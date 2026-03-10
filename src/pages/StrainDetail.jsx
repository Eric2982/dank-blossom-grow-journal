import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Edit, ArrowLeft, Trash2, Sprout, Flower, X, Bell, BellOff, Camera, Image, ChevronDown, ChevronUp } from "lucide-react";
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
import StrainAnalytics from "../components/grow/StrainAnalytics";
import FeedingPlanner from "../components/grow/FeedingPlanner";
import HarvestTracker from "../components/grow/HarvestTracker";
import PullToRefresh from "../components/PullToRefresh";
import { Badge } from "@/components/ui/badge";
import ExportPDFButton from "../components/grow/ExportPDFButton";

export default function StrainDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const strainId = urlParams.get("id");
  
  const [showReadingForm, setShowReadingForm] = useState(false);
  const [showNutrientForm, setShowNutrientForm] = useState(false);
  const [showWateringForm, setShowWateringForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [editingReading, setEditingReading] = useState(null);
  const [editingNutrient, setEditingNutrient] = useState(null);
  const [editingWatering, setEditingWatering] = useState(null);
  const [collapsedNutrientDates, setCollapsedNutrientDates] = useState({});
  const galleryInputRef = React.useRef();
  const cameraInputRef = React.useRef();
  
  const queryClient = useQueryClient();

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }
  }, []);

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

  const { data: wateringActions = [] } = useQuery({
    queryKey: ["wateringActions", strainId],
    queryFn: () => base44.entities.WateringAction.filter({ strain_id: strainId }, "-created_date", 50),
  });

  const { data: feedingPlans = [] } = useQuery({
    queryKey: ["feedingPlans", strainId],
    queryFn: () => base44.entities.FeedingPlan.filter({ strain_id: strainId }),
  });

  const { data: harvests = [] } = useQuery({
    queryKey: ["harvests", strainId],
    queryFn: () => base44.entities.Harvest.filter({ strain_id: strainId }, "-created_date"),
  });

  const createReadingMutation = useMutation({
    mutationFn: (data) => base44.entities.GrowReading.create({ ...data, strain_id: strainId }),
    onMutate: async (newReading) => {
      await queryClient.cancelQueries({ queryKey: ["readings", strainId] });
      const previous = queryClient.getQueryData(["readings", strainId]);
      
      queryClient.setQueryData(["readings", strainId], (old = []) => [
        { ...newReading, id: "temp-" + Date.now(), created_date: new Date().toISOString(), strain_id: strainId },
        ...old
      ]);
      
      return { previous };
    },
    onError: (err, newReading, context) => {
      queryClient.setQueryData(["readings", strainId], context.previous);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["readings", strainId] });
      setShowReadingForm(false);
      setEditingReading(null);
    },
  });

  const updateReadingMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GrowReading.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["readings", strainId] });
      setShowReadingForm(false);
      setEditingReading(null);
    },
  });

  const deleteReadingMutation = useMutation({
    mutationFn: (id) => base44.entities.GrowReading.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["readings", strainId] }),
  });

  const createNutrientMutation = useMutation({
    mutationFn: async (data) => {
      if (data.nutrients) {
        const promises = data.nutrients.map(n => 
          base44.entities.NutrientLog.create({ ...n, strain_id: strainId })
        );
        await Promise.all(promises);
      } else {
        await base44.entities.NutrientLog.create({ ...data, strain_id: strainId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrients", strainId] });
      setShowNutrientForm(false);
      setEditingNutrient(null);
    },
  });

  const updateNutrientMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NutrientLog.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrients", strainId] });
      setShowNutrientForm(false);
      setEditingNutrient(null);
    },
  });

  const deleteNutrientMutation = useMutation({
    mutationFn: (id) => base44.entities.NutrientLog.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nutrients", strainId] }),
  });

  const createWateringMutation = useMutation({
    mutationFn: (data) => base44.entities.WateringSchedule.create({ ...data, strain_id: strainId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watering", strainId] });
      setShowWateringForm(false);
      setEditingWatering(null);
    },
  });

  const updateWateringMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WateringSchedule.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["watering", strainId] });
      const previous = queryClient.getQueryData(["watering", strainId]);
      
      queryClient.setQueryData(["watering", strainId], (old = []) =>
        old.map(w => w.id === id ? { ...w, ...data } : w)
      );
      
      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["watering", strainId], context.previous);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watering", strainId] });
      setShowWateringForm(false);
      setEditingWatering(null);
    },
  });

  const deleteWateringMutation = useMutation({
    mutationFn: (id) => base44.entities.WateringSchedule.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["watering", strainId] }),
  });

  const logWateringAction = useMutation({
    mutationFn: (data) => base44.entities.WateringAction.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wateringActions", strainId] }),
  });

  const createFeedingPlanMutation = useMutation({
    mutationFn: (data) => base44.entities.FeedingPlan.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feedingPlans", strainId] }),
  });

  const updateFeedingPlanMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FeedingPlan.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feedingPlans", strainId] }),
  });

  const deleteFeedingPlanMutation = useMutation({
    mutationFn: (id) => base44.entities.FeedingPlan.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feedingPlans", strainId] }),
  });

  const createHarvestMutation = useMutation({
    mutationFn: (data) => base44.entities.Harvest.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["harvests", strainId] }),
  });

  const updateHarvestMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Harvest.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["harvests", strainId] }),
  });

  const deleteHarvestMutation = useMutation({
    mutationFn: (id) => base44.entities.Harvest.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["harvests", strainId] }),
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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const updatedPhotos = [...(strain.photos || []), file_url];
      await base44.entities.Strain.update(strainId, { photos: updatedPhotos });
      queryClient.invalidateQueries({ queryKey: ["strain", strainId] });
    } catch (error) {
      alert("Failed to upload photo");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Group nutrients by date for collapsible view
  const nutrientsByDate = React.useMemo(() => {
    const groups = {};
    nutrients.forEach(n => {
      const dateKey = format(new Date(n.created_date), "MMM d, yyyy");
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(n);
    });
    return groups;
  }, [nutrients]);

  const toggleNutrientDate = (dateKey) => {
    setCollapsedNutrientDates(prev => ({ ...prev, [dateKey]: !prev[dateKey] }));
  };

  const handleDeletePhoto = async (photoUrl) => {
    const updatedPhotos = (strain.photos || []).filter(p => p !== photoUrl);
    await base44.entities.Strain.update(strainId, { photos: updatedPhotos });
    queryClient.invalidateQueries({ queryKey: ["strain", strainId] });
  };

  const handleToggleNotifications = async () => {
    if (!("Notification" in window)) {
      alert("Notifications not supported in this browser");
      return;
    }

    if (Notification.permission === "granted") {
      setNotificationsEnabled(!notificationsEnabled);
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === "granted");
    }
  };

  useEffect(() => {
    if (!notificationsEnabled || !watering.length) return;

    const checkWatering = () => {
      watering.forEach(schedule => {
        const next = new Date(schedule.next_watering);
        const now = new Date();
        const hoursUntil = (next - now) / (1000 * 60 * 60);

        if (hoursUntil <= 2 && hoursUntil > 0) {
          new Notification("Watering Reminder", {
            body: `Time to water ${strain.name}!`,
            icon: "/favicon.ico"
          });
        }
      });
    };

    const interval = setInterval(checkWatering, 60000);
    return () => clearInterval(interval);
  }, [notificationsEnabled, watering, strain]);

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["strain", strainId] }),
      queryClient.invalidateQueries({ queryKey: ["readings", strainId] }),
      queryClient.invalidateQueries({ queryKey: ["nutrients", strainId] }),
      queryClient.invalidateQueries({ queryKey: ["watering", strainId] }),
      queryClient.invalidateQueries({ queryKey: ["wateringActions", strainId] }),
      queryClient.invalidateQueries({ queryKey: ["feedingPlans", strainId] }),
      queryClient.invalidateQueries({ queryKey: ["harvests", strainId] }),
    ]);
  };

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

  const handleWatered = (schedule, method = "manual", amount = null) => {
    const now = new Date();
    const next = new Date(now);
    next.setDate(next.getDate() + schedule.frequency_days);
    
    updateWateringMutation.mutate({
      id: schedule.id,
      data: { last_watered: now.toISOString(), next_watering: next.toISOString() }
    });

    logWateringAction.mutate({
      strain_id: strainId,
      schedule_id: schedule.id,
      amount_liters: amount,
      method: method,
      sensor_data: latest ? {
        temperature: latest.temperature,
        humidity: latest.humidity,
        vpd: latest.vpd
      } : null
    });
  };

  const handleAutomatedWatering = (schedule) => {
    if (window.confirm(`Trigger automated watering for ${strain.name}?`)) {
      const amount = parseFloat(prompt("Enter water amount (liters):", "2"));
      if (amount) {
        handleWatered(schedule, "automated", amount);
      }
    }
  };

  const handleManualOverride = (schedule) => {
    const amount = parseFloat(prompt("Manual override - Enter water amount (liters):", "2"));
    if (amount) {
      handleWatered(schedule, "manual_override", amount);
    }
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
    <PullToRefresh onRefresh={handleRefresh}>
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
          <Button onClick={handleToggleNotifications} variant="outline" size="sm"
            className={`border-white/10 ${notificationsEnabled ? 'text-emerald-400' : 'text-white'} hover:bg-white/5`}>
            {notificationsEnabled ? <Bell className="w-3 h-3 mr-2" /> : <BellOff className="w-3 h-3 mr-2" />}
            Alerts
          </Button>
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

      {/* Photos */}
      {(strain.photos?.length > 0 || !uploading) && (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Photos</h3>
            <div className="flex gap-2">
              <input ref={galleryInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
              <Button type="button" size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/5"
                onClick={() => galleryInputRef.current?.click()} disabled={uploading}>
                <Image className="w-3 h-3 mr-2" /> Gallery
              </Button>
              <Button type="button" size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/5"
                onClick={() => cameraInputRef.current?.click()} disabled={uploading}>
                <Camera className="w-3 h-3 mr-2" /> Camera
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {strain.photos?.map((photo, idx) => (
              <div key={idx} className="relative group rounded-lg overflow-hidden aspect-square">
                <img src={photo} alt={`${strain.name} ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleDeletePhoto(photo)}
                  className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Analytics */}
      <StrainAnalytics readings={readings} />

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
        <ReadingsHistory readings={readings} onDelete={(id) => deleteReadingMutation.mutate(id)} 
          onEdit={(reading) => { setEditingReading(reading); setShowReadingForm(true); }} />
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
          <div className="space-y-2">
            {Object.entries(nutrientsByDate).map(([dateKey, items]) => {
              const isCollapsed = collapsedNutrientDates[dateKey];
              return (
                <div key={dateKey} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                  <button
                    onClick={() => toggleNutrientDate(dateKey)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-white/70 text-sm font-medium">{dateKey}</span>
                      <span className="text-white/30 text-xs">{items.length} nutrient{items.length > 1 ? "s" : ""}</span>
                    </div>
                    {isCollapsed ? <ChevronDown className="w-4 h-4 text-white/30" /> : <ChevronUp className="w-4 h-4 text-white/30" />}
                  </button>
                  {!isCollapsed && (
                    <div className="border-t border-white/5 overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-white/5">
                          <tr className="text-white/40 text-xs">
                            <th className="text-left p-3 font-normal">Nutrient</th>
                            <th className="text-left p-3 font-normal">Type</th>
                            <th className="text-left p-3 font-normal">Amount</th>
                            <th className="text-left p-3 font-normal">Stage</th>
                            <th className="text-left p-3 font-normal">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-white text-sm">
                          {items.map((n) => (
                            <tr key={n.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                              <td className="p-3">{n.nutrient_name} {n.brand && <span className="text-white/40">({n.brand})</span>}</td>
                              <td className="p-3">{n.nutrient_type}</td>
                              <td className="p-3">{n.volume_ml}ml</td>
                              <td className="p-3">{n.grow_stage}</td>
                              <td className="p-3">
                                <div className="flex gap-2">
                                  <Button onClick={() => { setEditingNutrient(n); setShowNutrientForm(true); }}
                                    size="sm" variant="ghost" className="h-7 px-2 text-white/40 hover:text-white">
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button onClick={() => deleteNutrientMutation.mutate(n.id)}
                                    size="sm" variant="ghost" className="h-7 px-2 text-white/20 hover:text-red-400">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
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
                      <Button onClick={() => handleAutomatedWatering(w)} size="sm" variant="outline"
                        className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10">
                        Auto Water
                      </Button>
                      <Button onClick={() => handleManualOverride(w)} size="sm" variant="outline"
                        className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">
                        Manual
                      </Button>
                      <Button onClick={() => { setEditingWatering(w); setShowWateringForm(true); }} 
                        size="sm" variant="ghost" className="text-white/40 hover:text-white">
                        <Edit className="w-3 h-3" />
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

      {/* Feeding Planner */}
      <FeedingPlanner
        strainId={strainId}
        plans={feedingPlans}
        onCreatePlan={(data) => createFeedingPlanMutation.mutate(data)}
        onUpdatePlan={({ id, data }) => updateFeedingPlanMutation.mutate({ id, data })}
        onDeletePlan={(id) => deleteFeedingPlanMutation.mutate(id)}
      />

      {/* Harvest Tracker */}
      <HarvestTracker
        strainId={strainId}
        harvests={harvests}
        onCreateHarvest={(data) => createHarvestMutation.mutate(data)}
        onUpdateHarvest={({ id, data }) => updateHarvestMutation.mutate({ id, data })}
        onDeleteHarvest={(id) => deleteHarvestMutation.mutate(id)}
      />

      {/* Watering History */}
      {wateringActions.length > 0 && (
        <div>
          <h2 className="text-lg font-light text-white mb-4">Watering History</h2>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/5">
                  <tr className="text-white/40 text-xs">
                    <th className="text-left p-3 font-normal">Date</th>
                    <th className="text-left p-3 font-normal">Method</th>
                    <th className="text-left p-3 font-normal">Amount</th>
                    <th className="text-left p-3 font-normal">Conditions</th>
                  </tr>
                </thead>
                <tbody className="text-white text-sm">
                  {wateringActions.map((action) => (
                    <tr key={action.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-3">{format(new Date(action.created_date), "MMM d, yyyy h:mm a")}</td>
                      <td className="p-3">
                        <Badge className={`${
                          action.method === "automated" ? "bg-blue-500/10 text-blue-400" :
                          action.method === "manual_override" ? "bg-yellow-500/10 text-yellow-400" :
                          "bg-green-500/10 text-green-400"
                        } border-none text-xs`}>
                          {action.method.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="p-3">{action.amount_liters ? `${action.amount_liters}L` : "—"}</td>
                      <td className="p-3 text-white/40 text-xs">
                        {action.sensor_data ? `${action.sensor_data.temperature}°F, ${action.sensor_data.humidity}% RH` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>

    <AddReadingDialog open={showReadingForm} onOpenChange={(open) => { setShowReadingForm(open); if (!open) setEditingReading(null); }} 
      reading={editingReading}
      onSubmit={(data) => editingReading ? updateReadingMutation.mutate({ id: editingReading.id, data }) : createReadingMutation.mutate(data)} />
    <NutrientForm open={showNutrientForm} onOpenChange={(open) => { setShowNutrientForm(open); if (!open) setEditingNutrient(null); }}
      nutrient={editingNutrient}
      onSubmit={(data) => editingNutrient ? updateNutrientMutation.mutate({ id: editingNutrient.id, data }) : createNutrientMutation.mutate(data)} />
    <WateringForm open={showWateringForm} onOpenChange={(open) => { setShowWateringForm(open); if (!open) setEditingWatering(null); }}
      schedule={editingWatering}
      onSubmit={(data) => editingWatering ? updateWateringMutation.mutate({ id: editingWatering.id, data }) : createWateringMutation.mutate(data)} />
    <StrainForm open={showEditForm} onOpenChange={setShowEditForm} strain={strain}
      onSubmit={(data) => updateStrainMutation.mutate(data)} />
    </PullToRefresh>
  );
}