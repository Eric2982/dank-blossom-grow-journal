import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Edit, ArrowLeft, Trash2, Sprout, Flower } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { differenceInDays, format } from "date-fns";
import ReadingCard from "../components/grow/ReadingCard";
import ReadingsChart from "../components/grow/ReadingsChart";
import ReadingsHistory from "../components/grow/ReadingsHistory";
import AddReadingDialog from "../components/grow/AddReadingDialog";
import NutrientForm from "../components/grow/NutrientForm";
import WateringForm from "../components/grow/WateringForm";
import StrainForm from "../components/grow/StrainForm";
import { Badge } from "@/components/ui/badge";

export default function StrainDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const strainId = urlParams.get("id");
  
  const [showReadingForm, setShowReadingForm] = useState(false);
  const [showNutrientForm, setShowNutrientForm] = useState(false);
  const [showWateringForm, setShowWateringForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: strain } = useQuery({
    queryKey: ["strain", strainId],
    queryFn: async () => {
      const strains = await base44.entities.Strain.filter({ id: strainId });
      return strains[0];
    },
  });

  const { data: readings = [] } = useQuery({
    queryKey: ["readings", strainId],
    queryFn: () => base44.entities.GrowReading.filter({ strain_id: strainId }, "-created_date", 100),
  });

  const { data: nutrients = [] } = useQuery({
    queryKey: ["nutrients", strainId],
    queryFn: () => base44.entities.NutrientLog.filter({ strain_id: strainId }, "-created_date", 50),
  });

  const { data: watering = [] } = useQuery({
    queryKey: ["watering", strainId],
    queryFn: () => base44.entities.WateringSchedule.filter({ strain_id: strainId, active: true }),
  });

  const createReadingMutation = useMutation({
    mutationFn: (data) => base44.entities.GrowReading.create({ ...data, strain_id: strainId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["readings", strainId] });
      setShowReadingForm(false);
    },
  });

  const deleteReadingMutation = useMutation({
    mutationFn: (id) => base44.entities.GrowReading.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["readings", strainId] }),
  });

  const createNutrientMutation = useMutation({
    mutationFn: (data) => base44.entities.NutrientLog.create({ ...data, strain_id: strainId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrients", strainId] });
      setShowNutrientForm(false);
    },
  });

  const createWateringMutation = useMutation({
    mutationFn: (data) => base44.entities.WateringSchedule.create({ ...data, strain_id: strainId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watering", strainId] });
      setShowWateringForm(false);
    },
  });

  const updateWateringMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WateringSchedule.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["watering", strainId] }),
  });

  const deleteWateringMutation = useMutation({
    mutationFn: (id) => base44.entities.WateringSchedule.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["watering", strainId] }),
  });

  const updateStrainMutation = useMutation({
    mutationFn: (data) => base44.entities.Strain.update(strainId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strain", strainId] });
      setShowEditForm(false);
    },
  });

  const deleteStrainMutation = useMutation({
    mutationFn: () => base44.entities.Strain.delete(strainId),
    onSuccess: () => {
      window.location.href = createPageUrl("Dashboard");
    },
  });

  if (!strain) return <div className="text-white/50">Loading...</div>;

  const latest = readings[0];
  
  const vegDays = strain.planted_date && strain.flipped_to_flower_date 
    ? differenceInDays(new Date(strain.flipped_to_flower_date), new Date(strain.planted_date))
    : strain.planted_date && !strain.flipped_to_flower_date && strain.status === "active"
    ? differenceInDays(new Date(), new Date(strain.planted_date))
    : null;

  const flowerDays = strain.flipped_to_flower_date && strain.status === "active"
    ? differenceInDays(new Date(), new Date(strain.flipped_to_flower_date))
    : null;

  const handleWatered = (schedule) => {
    const now = new Date();
    const next = new Date(now);
    next.setDate(next.getDate() + schedule.frequency_days);
    updateWateringMutation.mutate({
      id: schedule.id,
      data: { last_watered: now.toISOString(), next_watering: next.toISOString() }
    });
  };

  const getWateringStatus = (schedule) => {
    const next = new Date(schedule.next_watering);
    const now = new Date();
    const diff = differenceInDays(next, now);
    if (diff < 0) return { label: "Overdue", color: "text-red-400" };
    if (diff === 0) return { label: "Due Today", color: "text-yellow-400" };
    if (diff <= 1) return { label: "Due Soon", color: "text-orange-400" };
    return { label: "Scheduled", color: "text-emerald-400" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="ghost" size="icon" className="text-white/40 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-light text-white">{strain.name}</h1>
            <p className="text-white/40 text-sm">{strain.breeder}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowEditForm(true)} variant="outline" size="sm"
            className="border-white/10 text-white hover:bg-white/5">
            <Edit className="w-3 h-3 mr-2" /> Edit
          </Button>
          <Button onClick={() => deleteStrainMutation.mutate()} variant="outline" size="sm"
            className="border-red-500/20 text-red-400 hover:bg-red-500/10">
            <Trash2 className="w-3 h-3 mr-2" /> Delete
          </Button>
        </div>
      </div>

      {/* Strain Info Card */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {vegDays !== null && (
            <div>
              <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                <Sprout className="w-3 h-3 text-green-400" />
                <span>Vegetative Stage</span>
              </div>
              <div className="text-2xl font-light text-white">{vegDays} days</div>
            </div>
          )}
          {flowerDays !== null && (
            <div>
              <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                <Flower className="w-3 h-3 text-pink-400" />
                <span>Flowering Stage</span>
              </div>
              <div className="text-2xl font-light text-white">{flowerDays} days</div>
            </div>
          )}
          {strain.planted_date && (
            <div>
              <div className="text-white/40 text-xs mb-1">Planted</div>
              <div className="text-sm text-white">{format(new Date(strain.planted_date), "MMM d, yyyy")}</div>
            </div>
          )}
          {strain.flipped_to_flower_date && (
            <div>
              <div className="text-white/40 text-xs mb-1">Flipped to Flower</div>
              <div className="text-sm text-white">{format(new Date(strain.flipped_to_flower_date), "MMM d, yyyy")}</div>
            </div>
          )}
        </div>
      </div>

      {/* Grow Readings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-light text-white">Grow Log</h2>
          <Button onClick={() => setShowReadingForm(true)} variant="outline" size="sm"
            className="border-white/10 text-white hover:bg-white/5 gap-2">
            <Plus className="w-3 h-3" /> Log Reading
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {["temperature", "humidity", "ppfd", "ec", "vpd", "ph"].map((type) => (
            <ReadingCard key={type} type={type} value={latest?.[type]} />
          ))}
        </div>
        <ReadingsChart readings={readings} />
        <ReadingsHistory readings={readings} onDelete={(id) => deleteReadingMutation.mutate(id)} />
      </div>

      {/* Nutrients */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-light text-white">Nutrients</h2>
          <Button onClick={() => setShowNutrientForm(true)} variant="outline" size="sm"
            className="border-white/10 text-white hover:bg-white/5 gap-2">
            <Plus className="w-3 h-3" /> Add Nutrient
          </Button>
        </div>
        {nutrients.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
            <p className="text-white/30 text-sm">No nutrients logged yet</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/5">
                  <tr className="text-white/40 text-xs">
                    <th className="text-left p-3 font-normal">Date</th>
                    <th className="text-left p-3 font-normal">Nutrient</th>
                    <th className="text-left p-3 font-normal">Type</th>
                    <th className="text-left p-3 font-normal">Amount</th>
                    <th className="text-left p-3 font-normal">Stage</th>
                  </tr>
                </thead>
                <tbody className="text-white text-sm">
                  {nutrients.map((n) => (
                    <tr key={n.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-3">{format(new Date(n.created_date), "MMM d, yyyy")}</td>
                      <td className="p-3">{n.nutrient_name} {n.brand && `(${n.brand})`}</td>
                      <td className="p-3">{n.nutrient_type}</td>
                      <td className="p-3">{n.volume_ml}ml</td>
                      <td className="p-3">{n.grow_stage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Watering Schedule */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-light text-white">Watering Schedule</h2>
          <Button onClick={() => setShowWateringForm(true)} variant="outline" size="sm"
            className="border-white/10 text-white hover:bg-white/5 gap-2">
            <Plus className="w-3 h-3" /> Add Schedule
          </Button>
        </div>
        {watering.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
            <p className="text-white/30 text-sm">No watering schedule set</p>
          </div>
        ) : (
          <div className="space-y-3">
            {watering.map((w) => {
              const status = getWateringStatus(w);
              return (
                <div key={w.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white text-sm mb-1">Every {w.frequency_days} days</div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${status.color} bg-transparent border-none text-xs`}>
                          {status.label}
                        </Badge>
                        <span className="text-white/40 text-xs">
                          Next: {format(new Date(w.next_watering), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleWatered(w)} size="sm" variant="outline"
                        className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">
                        Mark Watered
                      </Button>
                      <Button onClick={() => deleteWateringMutation.mutate(w.id)} size="sm" variant="ghost"
                        className="text-white/20 hover:text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddReadingDialog open={showReadingForm} onOpenChange={setShowReadingForm} 
        onSubmit={(data) => createReadingMutation.mutate(data)} />
      <NutrientForm open={showNutrientForm} onOpenChange={setShowNutrientForm}
        onSubmit={(data) => createNutrientMutation.mutate(data)} />
      <WateringForm open={showWateringForm} onOpenChange={setShowWateringForm}
        onSubmit={(data) => createWateringMutation.mutate(data)} />
      <StrainForm open={showEditForm} onOpenChange={setShowEditForm} strain={strain}
        onSubmit={(data) => updateStrainMutation.mutate(data)} />
    </div>
  );
}