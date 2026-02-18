import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Leaf, Crown } from "lucide-react";
import StrainCard from "../components/grow/StrainCard";
import StrainForm from "../components/grow/StrainForm";

export default function Dashboard() {
  const [showStrainForm, setShowStrainForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: strains = [] } = useQuery({
    queryKey: ["strains"],
    queryFn: () => base44.entities.Strain.list("-created_date", 50),
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: subscription } = useQuery({
    queryKey: ["subscription", user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const createStrainMutation = useMutation({
    mutationFn: (data) => base44.entities.Strain.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strains"] });
      setShowStrainForm(false);
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-light text-white">Dashboard</h1>
            <p className="text-white/40 text-sm mt-1">Manage your grow strains and track progress</p>
          </div>
          {subscription?.[0]?.status === "active" ? (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1">
              <Crown className="w-3 h-3" /> Premium
            </Badge>
          ) : (
            <Badge variant="outline" className="text-white/50 border-white/20">Free</Badge>
          )}
        </div>
        <Button onClick={() => setShowStrainForm(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2">
          <Plus className="w-4 h-4" /> Add Strain
        </Button>
      </div>

      {/* Strains Section */}
      {strains.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 text-center">
          <Leaf className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <h3 className="text-white text-lg mb-2">No strains yet</h3>
          <p className="text-white/30 text-sm mb-4">Start tracking your grows by adding a strain</p>
          <Button onClick={() => setShowStrainForm(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Your First Strain
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {strains.map(strain => (
            <StrainCard key={strain.id} strain={strain} />
          ))}
        </div>
      )}

      <StrainForm open={showStrainForm} onOpenChange={setShowStrainForm} onSubmit={(data) => createStrainMutation.mutate(data)} />
    </div>
  );
}