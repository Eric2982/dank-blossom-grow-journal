import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { User, Trash2, Crown, Mail, Calendar, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createPageUrl } from "../utils";

export default function Settings() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

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
        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Account
        </Button>
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