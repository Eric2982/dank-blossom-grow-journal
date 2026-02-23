import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's subscription
        const subscriptions = await base44.entities.Subscription.filter({ 
            user_email: user.email,
            status: 'active'
        });

        if (!subscriptions || subscriptions.length === 0) {
            return Response.json({ error: 'No active subscription found' }, { status: 404 });
        }

        const subscription = subscriptions[0];

        // Cancel the Stripe subscription
        const canceledSubscription = await stripe.subscriptions.cancel(
            subscription.stripe_subscription_id
        );

        // Update subscription status in database
        await base44.asServiceRole.entities.Subscription.update(subscription.id, {
            status: 'canceled'
        });

        console.log('Subscription canceled:', canceledSubscription.id);

        return Response.json({ 
            success: true,
            message: 'Subscription canceled successfully',
            ends_at: canceledSubscription.current_period_end
        });
    } catch (error) {
        console.error('Subscription cancellation error:', error);
        return Response.json({ 
            error: error.message || 'Failed to cancel subscription' 
        }, { status: 500 });
    }
});