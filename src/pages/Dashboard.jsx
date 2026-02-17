import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Leaf } from "lucide-react";
import ReadingCard from "../components/grow/ReadingCard";
import ReadingsChart from "../components/grow/ReadingsChart";
import ReadingsHistory from "../components/grow/ReadingsHistory";
import AddReadingDialog from "../components/grow/AddReadingDialog";
import WateringReminders from "../components/grow/WateringReminders";
import StrainCard from "../components/grow/StrainCard";
import StrainForm from "../components/grow/StrainForm";

export default function Dashboard() {
  const [showForm, setShowForm] = useState(false);
  const [showStrainForm, setShowStrainForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: readings = [], isLoading } = useQuery({
    queryKey: ["readings"],
    queryFn: () => base44.entities.GrowReading.list("-created_date", 100),
  });

  const { data: strains = [] } = useQuery({
    queryKey: ["strains"],
    queryFn: () => base44.entities.Strain.list("-created_date", 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.GrowReading.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["readings"] });
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GrowReading.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["readings"] }),
  });

  const createStrainMutation = useMutation({
    mutationFn: (data) => base44.entities.Strain.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strains"] });
      setShowStrainForm(false);
    },
  });

  const deleteStrainMutation = useMutation({
    mutationFn: (id) => base44.entities.Strain.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["strains"] }),
  });

  const latest = readings[0];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-white">Grow Dashboard</h1>
          <p className="text-white/30 text-sm mt-1">Monitor your environment in real-time</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2">
          <Plus className="w-4 h-4" /> Log Reading
        </Button>
      </div>

      {/* Strains Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-light text-white">Active Strains</h2>
          </div>
          <Button onClick={() => setShowStrainForm(true)} variant="outline" size="sm"
            className="border-white/10 text-white hover:bg-white/5 gap-2 h-8 text-xs">
            <Plus className="w-3 h-3" /> Add Strain
          </Button>
        </div>
        {strains.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
            <p className="text-white/30 text-sm">No strains tracked yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {strains.map(strain => (
              <StrainCard key={strain.id} strain={strain} onDelete={(id) => deleteStrainMutation.mutate(id)} />
            ))}
          </div>
        )}
      </div>

      {/* Latest Readings Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {["temperature", "humidity", "ppfd", "ec", "vpd", "ph"].map((type) => (
          <ReadingCard key={type} type={type} value={latest?.[type]} />
        ))}
      </div>

      {/* Trend Chart */}
      <ReadingsChart readings={readings} />

      {/* Watering Reminders */}
      <WateringReminders />

      {/* History Table */}
      <div>
        <h2 className="text-lg font-light text-white mb-4">Reading History</h2>
        <ReadingsHistory readings={readings} onDelete={(id) => deleteMutation.mutate(id)} />
      </div>

      <AddReadingDialog open={showForm} onOpenChange={setShowForm} onSubmit={(data) => createMutation.mutate(data)} />
      <StrainForm open={showStrainForm} onOpenChange={setShowStrainForm} onSubmit={(data) => createStrainMutation.mutate(data)} />
    </div>
  );
}