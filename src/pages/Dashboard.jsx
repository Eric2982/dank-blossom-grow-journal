import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ReadingCard from "../components/grow/ReadingCard";
import ReadingsChart from "../components/grow/ReadingsChart";
import ReadingsHistory from "../components/grow/ReadingsHistory";
import AddReadingDialog from "../components/grow/AddReadingDialog";
import WateringReminders from "../components/grow/WateringReminders";

export default function Dashboard() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: readings = [], isLoading } = useQuery({
    queryKey: ["readings"],
    queryFn: () => base44.entities.GrowReading.list("-created_date", 100),
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
    </div>
  );
}