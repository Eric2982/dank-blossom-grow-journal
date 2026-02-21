import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { User, Trash2, Crown, Mail, Calendar, Shield, FileText, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createPageUrl } from "../utils";

export default function Settings() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: subscription } = useQuery({
    queryKey: ["subscription", user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const isPremium = subscription?.[0]?.status === "active";

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== "delete") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    try {
      // Delete user's data first
      const strains = await base44.entities.Strain.list();
      const readings = await base44.entities.GrowReading.list();
      const nutrients = await base44.entities.NutrientLog.list();
      const schedules = await base44.entities.WateringSchedule.list();
      const actions = await base44.entities.WateringAction.list();
      const plans = await base44.entities.FeedingPlan.list();
      const harvests = await base44.entities.Harvest.list();
      const messages = await base44.entities.ChatMessage.filter({ user_email: user.email });

      // Delete all user data
      await Promise.all([
        ...strains.map(s => base44.entities.Strain.delete(s.id)),
        ...readings.map(r => base44.entities.GrowReading.delete(r.id)),
        ...nutrients.map(n => base44.entities.NutrientLog.delete(n.id)),
        ...schedules.map(s => base44.entities.WateringSchedule.delete(s.id)),
        ...actions.map(a => base44.entities.WateringAction.delete(a.id)),
        ...plans.map(p => base44.entities.FeedingPlan.delete(p.id)),
        ...harvests.map(h => base44.entities.Harvest.delete(h.id)),
        ...messages.map(m => base44.entities.ChatMessage.delete(m.id)),
      ]);

      toast.success("Account data deleted successfully");
      
      // Logout after deletion
      setTimeout(() => {
        base44.auth.logout(createPageUrl("Dashboard"));
      }, 1500);
    } catch (error) {
      toast.error("Failed to delete account: " + error.message);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-white/40">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-light text-white">Settings</h1>
        <p className="text-white/40 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Account Info Card */}
      <Card className="bg-white/[0.02] border-white/5 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-medium">{user.full_name || "User"}</h2>
            <p className="text-white/40 text-sm">{user.email}</p>
          </div>
          {isPremium ? (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1">
              <Crown className="w-3 h-3" /> Premium
            </Badge>
          ) : (
            <Badge variant="outline" className="text-white/50 border-white/20">Free</Badge>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-white/40" />
            <span className="text-white/60">Email verified</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-white/40" />
            <span className="text-white/60">Joined {new Date(user.created_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-white/40" />
            <span className="text-white/60">Role: {user.role}</span>
          </div>
        </div>
      </Card>

      {/* Subscription Card */}
      {isPremium && (
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 p-6">
          <div className="flex items-start gap-3">
            <Crown className="w-5 h-5 text-amber-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-white font-medium mb-1">Premium Subscription</h3>
              <p className="text-white/60 text-sm">
                Active until {new Date(subscription[0].current_period_end).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Privacy Policy */}
      <Card className="bg-white/[0.02] border-white/5 p-6 space-y-4">
        <button
          onClick={() => setShowPrivacyPolicy(!showPrivacyPolicy)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-white/60" />
            <div>
              <h3 className="text-white font-medium">Privacy Policy</h3>
              <p className="text-white/40 text-sm">How we handle your data</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-white/40 transition-transform ${showPrivacyPolicy ? 'rotate-180' : ''}`} />
        </button>

        {showPrivacyPolicy && (
          <div className="pt-4 border-t border-white/5 space-y-6 text-white/70 text-sm">
            <div>
              <p className="text-white/40 text-xs mb-4">Last Updated: February 20, 2026</p>
              <p className="mb-4">
                Dank Blossom is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal and cultivation data.
              </p>
            </div>

            <div>
              <h4 className="text-white font-medium mb-2">1. Information We Collect</h4>
              <ul className="list-disc list-inside space-y-2 text-white/60">
                <li><strong className="text-white/70">Account Information:</strong> Email address, full name, account creation date, and subscription status</li>
                <li><strong className="text-white/70">Cultivation Data:</strong> Strain details, plant photos, environmental readings (temperature, humidity, PPFD, EC, VPD, pH), nutrient logs, watering schedules, feeding plans, and harvest records</li>
                <li><strong className="text-white/70">Usage Data:</strong> Chat messages, app interactions, and feature usage patterns</li>
                <li><strong className="text-white/70">Payment Information:</strong> Processed securely through Stripe (we do not store credit card numbers)</li>
                <li><strong className="text-white/70">Device Information:</strong> Browser type, device identifiers, IP address, and operating system for security and functionality</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-2">2. How We Use Your Data</h4>
              <ul className="list-disc list-inside space-y-2 text-white/60">
                <li>Provide and maintain grow tracking, analytics, and notification services</li>
                <li>Process premium subscriptions and manage billing</li>
                <li>Generate personalized insights and recommendations for your grows</li>
                <li>Send watering reminders and growth stage notifications (if enabled)</li>
                <li>Improve app performance, features, and user experience</li>
                <li>Ensure account security and prevent unauthorized access</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-2">3. Data Storage & Security</h4>
              <p className="text-white/60 mb-2">
                Your data is stored on secure cloud infrastructure with industry-standard encryption:
              </p>
              <ul className="list-disc list-inside space-y-2 text-white/60">
                <li><strong className="text-white/70">Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest</li>
                <li><strong className="text-white/70">Access Control:</strong> Only you can view your cultivation data through your authenticated account</li>
                <li><strong className="text-white/70">Photo Storage:</strong> Plant images are stored securely and linked only to your account</li>
                <li><strong className="text-white/70">Payment Security:</strong> Processed by Stripe (PCI DSS Level 1 certified)</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-2">4. Data Sharing & Disclosure</h4>
              <p className="text-white/60 mb-2">We do NOT sell your personal data. Limited sharing occurs only for:</p>
              <ul className="list-disc list-inside space-y-2 text-white/60">
                <li><strong className="text-white/70">Service Providers:</strong> Stripe for payment processing, cloud hosting providers for data storage</li>
                <li><strong className="text-white/70">Legal Compliance:</strong> When required by law, court order, or to protect rights and safety</li>
                <li><strong className="text-white/70">Aggregated Data:</strong> Anonymous, aggregated analytics (no personal identifiers) may be used for research</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-2">5. User Rights & Control</h4>
              <ul className="list-disc list-inside space-y-2 text-white/60">
                <li><strong className="text-white/70">Access & Export:</strong> View and download all your cultivation data at any time</li>
                <li><strong className="text-white/70">Edit & Update:</strong> Modify or correct your account information and grow logs</li>
                <li><strong className="text-white/70">Delete:</strong> Permanently remove your account and all associated data (see Danger Zone below)</li>
                <li><strong className="text-white/70">Opt-Out:</strong> Disable notifications and promotional communications</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-2">6. Cookies & Tracking</h4>
              <p className="text-white/60">
                We use essential cookies for authentication and app functionality. No third-party advertising or tracking cookies are used.
              </p>
            </div>

            <div>
              <h4 className="text-white font-medium mb-2">7. Data Retention</h4>
              <ul className="list-disc list-inside space-y-2 text-white/60">
                <li>Active accounts: Data retained indefinitely while your account is active</li>
                <li>Deleted accounts: All personal and cultivation data permanently removed within 30 days</li>
                <li>Canceled subscriptions: Data remains accessible; you can delete your account separately</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-2">8. Children's Privacy</h4>
              <p className="text-white/60">
                Our service is intended for users 21+ years of age (or legal age in your jurisdiction). We do not knowingly collect data from minors.
              </p>
            </div>

            <div>
              <h4 className="text-white font-medium mb-2">9. International Users</h4>
              <p className="text-white/60">
                Data is processed and stored in the United States. By using Dank Blossom, you consent to the transfer of your information to the U.S.
              </p>
            </div>

            <div>
              <h4 className="text-white font-medium mb-2">10. Changes to Privacy Policy</h4>
              <p className="text-white/60">
                We may update this policy periodically. Significant changes will be communicated via email or in-app notification.
              </p>
            </div>

            <div className="pt-4 border-t border-white/5">
              <h4 className="text-white font-medium mb-2">Contact Us</h4>
              <p className="text-white/60">
                Questions or concerns about your privacy? Contact us at support@dankblossom.com
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Terms and Conditions */}
      <Card className="bg-white/[0.02] border-white/5 p-6">
        <a
          href="https://doc-hosting.flycricket.io/dank-blossom-grow-journal-terms-of-use/133e87e4-50a4-431c-a96f-2fe3c9cbba63/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-white/60" />
            <div>
              <h3 className="text-white font-medium group-hover:text-emerald-400 transition-colors">Terms and Conditions</h3>
              <p className="text-white/40 text-sm">Review our terms of use</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-red-950/20 border-red-500/20 p-6 space-y-4">
        <div>
          <h3 className="text-red-400 font-medium mb-1 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Danger Zone
          </h3>
          <p className="text-white/60 text-sm">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
        </div>

        <div className="pt-4 border-t border-red-500/20">
          <h4 className="text-white font-medium mb-3">Account Deletion Process</h4>
          <div className="space-y-4 text-white/70 text-sm">
            <div>
              <h5 className="text-white/90 font-medium mb-2">How to Request Deletion</h5>
              <p className="text-white/60 mb-2">
                To delete your account and all associated data maintained by Dank Blossom Inc., you can:
              </p>
              <ul className="list-disc list-inside space-y-1 text-white/60 ml-2">
                <li>Use the "Delete Account" button below for immediate self-service deletion</li>
                <li>Email our support team at support@dankblossom.com with your account email address</li>
              </ul>
            </div>

            <div>
              <h5 className="text-white/90 font-medium mb-2">Data That Will Be Permanently Deleted</h5>
              <ul className="list-disc list-inside space-y-1 text-white/60 ml-2">
                <li><strong className="text-white/70">Account Information:</strong> Your email, name, and login credentials</li>
                <li><strong className="text-white/70">Cultivation Data:</strong> All grow strains, plant photos, and grow journals</li>
                <li><strong className="text-white/70">Environmental Records:</strong> Temperature, humidity, PPFD, EC, VPD, and pH readings</li>
                <li><strong className="text-white/70">Nutrient Logs:</strong> All feeding schedules, nutrient applications, and plans</li>
                <li><strong className="text-white/70">Watering Data:</strong> Schedules, reminders, and watering history</li>
                <li><strong className="text-white/70">Harvest Records:</strong> Yield data, quality ratings, and harvest notes</li>
                <li><strong className="text-white/70">Community Content:</strong> Chat messages and forum posts</li>
              </ul>
            </div>

            <div>
              <h5 className="text-white/90 font-medium mb-2">Data Retention Period</h5>
              <p className="text-white/60">
                Upon deletion request, your account and all personal data will be <strong className="text-white/70">permanently removed within 30 days</strong>. 
                This allows time for backup cycles to complete. After 30 days, your data cannot be recovered.
              </p>
            </div>

            <div>
              <h5 className="text-white/90 font-medium mb-2">Data That May Be Retained</h5>
              <p className="text-white/60 mb-2">
                Dank Blossom Inc. may retain certain information as required by law or for legitimate business purposes:
              </p>
              <ul className="list-disc list-inside space-y-1 text-white/60 ml-2">
                <li>Transaction records for tax and accounting purposes (7 years)</li>
                <li>Anonymized analytics data with no personal identifiers</li>
                <li>Legal compliance records if required by law enforcement or regulatory agencies</li>
              </ul>
            </div>

            <div className="pt-2">
              <p className="text-white/50 text-xs">
                For questions about account deletion, contact Dank Blossom Inc. at support@dankblossom.com
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="flex-1 sm:flex-initial bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
          
          <a
            href="https://doc-hosting.flycricket.io/dank-blossom-grow-journal-account-deletion/133e87e4-50a4-431c-a96f-2fe3c9cbba63/deletion"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial"
          >
            <Button
              variant="outline"
              className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <FileText className="w-4 h-4 mr-2" />
              Account Deletion Help
            </Button>
          </a>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-zinc-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This action cannot be undone. This will permanently delete your account and remove all your data including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All grow strains and photos</li>
                <li>Environmental readings and logs</li>
                <li>Nutrient logs and feeding plans</li>
                <li>Watering schedules and history</li>
                <li>Harvest records</li>
                <li>Chat messages</li>
              </ul>
              <p className="mt-4 font-medium text-white">Type <span className="font-bold">DELETE</span> to confirm:</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="Type DELETE here"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 text-white border-white/10 hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText.toLowerCase() !== "delete"}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}