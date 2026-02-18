import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  let event;
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return Response.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userEmail = session.metadata.user_email || session.customer_email;
        
        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          
          await base44.asServiceRole.entities.Subscription.create({
            user_email: userEmail,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            status: subscription.status,
            plan: 'premium',
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          });
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        const existingSubs = await base44.asServiceRole.entities.Subscription.filter({
          stripe_subscription_id: subscription.id
        });

        if (existingSubs.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(existingSubs[0].id, {
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const existingSubs = await base44.asServiceRole.entities.Subscription.filter({
          stripe_subscription_id: invoice.subscription
        });

        if (existingSubs.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(existingSubs[0].id, {
            status: 'past_due',
          });
        }
        break;
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});