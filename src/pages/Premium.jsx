import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, TrendingUp, Bell, Crown } from "lucide-react";

const PRICE_ID = "price_1T2vd9DpjvlmOzLjVcU5JV3N";

const features = [
  { icon: TrendingUp, text: "Advanced Strain Analytics & Growth Trends" },
  { icon: Zap, text: "Automated Watering System Integration" },
  { icon: Bell, text: "Smart Notifications & Alerts" },
  { icon: Sparkles, text: "Unlimited Strains & Grow Logs" },
  { icon: Check, text: "Export Data to PDF/Excel" },
  { icon: Crown, text: "Priority Support" },
];

export default function Premium() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        if (u) {
          const subs = await base44.entities.Subscription.filter({ user_email: u.email });
          if (subs.length > 0) {
            setSubscription(subs[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };
    fetchUser();
  }, []);

  const handleSubscribe = async () => {
    if (window.parent !== window) {
      alert('Checkout only works in the published app, not in preview. Please open your app in a new tab.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('createCheckout', { priceId: PRICE_ID });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isPremium = subscription && ['active', 'trialing'].includes(subscription.status);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4">
          <Crown className="w-8 h-8 text-amber-400" />
          <h1 className="text-3xl font-light text-white">Premium Membership</h1>
        </div>
        <p className="text-white/40 text-sm">Unlock advanced features for serious growers</p>
      </div>

      {isPremium && (
        <div className="mb-8 p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-white font-medium">Active Premium Subscription</p>
                <p className="text-white/40 text-xs mt-0.5">
                  Renews {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-none">
              {subscription.status}
            </Badge>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h3 className="text-white font-medium mb-2">Free</h3>
          <div className="mb-6">
            <span className="text-3xl text-white font-light">$0</span>
            <span className="text-white/40 text-sm">/month</span>
          </div>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-2 text-white/50 text-sm">
              <Check className="w-4 h-4 text-emerald-400" />
              Basic grow tracking
            </li>
            <li className="flex items-center gap-2 text-white/50 text-sm">
              <Check className="w-4 h-4 text-emerald-400" />
              Up to 3 strains
            </li>
            <li className="flex items-center gap-2 text-white/50 text-sm">
              <Check className="w-4 h-4 text-emerald-400" />
              Environmental logging
            </li>
            <li className="flex items-center gap-2 text-white/50 text-sm">
              <Check className="w-4 h-4 text-emerald-400" />
              Community chat
            </li>
          </ul>
          <Button variant="outline" className="w-full" disabled>
            Current Plan
          </Button>
        </div>

        {/* Premium Plan */}
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-6 relative">
          <Badge className="absolute top-4 right-4 bg-amber-500/10 text-amber-400 border-none text-xs">
            POPULAR
          </Badge>
          <h3 className="text-white font-medium mb-2">Premium</h3>
          <div className="mb-6">
            <span className="text-3xl text-white font-light">$9.99</span>
            <span className="text-white/40 text-sm">/month</span>
          </div>
          <ul className="space-y-3 mb-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <li key={idx} className="flex items-start gap-2 text-white/70 text-sm">
                  <Icon className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <span>{feature.text}</span>
                </li>
              );
            })}
          </ul>
          {isPremium ? (
            <Button className="w-full bg-emerald-600 hover:bg-emerald-500" disabled>
              <Check className="w-4 h-4 mr-2" />
              Active Subscription
            </Button>
          ) : (
            <Button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              {loading ? "Loading..." : "Upgrade to Premium"}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-8 p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
        <h3 className="text-white font-medium mb-3">Why Go Premium?</h3>
        <p className="text-white/50 text-sm leading-relaxed mb-4">
          Premium membership unlocks advanced tools designed for serious growers. Get detailed analytics on your strains,
          automate your watering schedules, receive smart notifications, and track unlimited grows with comprehensive data export options.
        </p>
        <p className="text-white/40 text-xs">
          Cancel anytime. No questions asked. All your data remains accessible even after cancellation.
        </p>
      </div>
    </div>
  );
}