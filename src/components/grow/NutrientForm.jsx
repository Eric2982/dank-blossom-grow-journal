import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const nutrientTypes = [
  { value: "base", label: "Base" },
  { value: "bloom", label: "Bloom" },
  { value: "grow", label: "Grow" },
  { value: "cal-mag", label: "Cal-Mag" },
  { value: "silica", label: "Silica" },
  { value: "enzyme", label: "Enzyme" },
  { value: "beneficial", label: "Beneficial" },
  { value: "pH_up", label: "pH Up" },
  { value: "pH_down", label: "pH Down" },
  { value: "other", label: "Other" },
];

export default function NutrientForm({ open, onOpenChange, onSubmit }) {
  const [form, setForm] = useState({
    nutrient_name: "", brand: "", volume_ml: "", water_volume_liters: "",
    nutrient_type: "base", grow_stage: "vegetative", notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      nutrient_name: form.nutrient_name,
      brand: form.brand || undefined,
      volume_ml: parseFloat(form.volume_ml),
      water_volume_liters: form.water_volume_liters ? parseFloat(form.water_volume_liters) : undefined,
      nutrient_type: form.nutrient_type,
      grow_stage: form.grow_stage,
      notes: form.notes || undefined,
    };
    onSubmit(data);
    setForm({ nutrient_name: "", brand: "", volume_ml: "", water_volume_liters: "", nutrient_type: "base", grow_stage: "vegetative", notes: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white font-light text-xl">Log Nutrient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-white/50 text-xs">Nutrient Name *</Label>
              <Input value={form.nutrient_name} onChange={(e) => setForm({ ...form, nutrient_name: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1" placeholder="e.g. FloraMicro" required />
            </div>
            <div>
              <Label className="text-white/50 text-xs">Brand</Label>
              <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1" placeholder="e.g. General Hydro" />
            </div>
            <div>
              <Label className="text-white/50 text-xs">Type</Label>
              <Select value={form.nutrient_type} onValueChange={(v) => setForm({ ...form, nutrient_type: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-white/10">
                  {nutrientTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/50 text-xs">Volume (mL) *</Label>
              <Input type="number" step="0.1" value={form.volume_ml} onChange={(e) => setForm({ ...form, volume_ml: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1" required />
            </div>
            <div>
              <Label className="text-white/50 text-xs">Water Volume (L)</Label>
              <Input type="number" step="0.1" value={form.water_volume_liters} onChange={(e) => setForm({ ...form, water_volume_liters: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-white/50 text-xs">Growth Stage</Label>
            <Select value={form.grow_stage} onValueChange={(v) => setForm({ ...form, grow_stage: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-zinc-800 border-white/10">
                <SelectItem value="seedling">🌱 Seedling</SelectItem>
                <SelectItem value="vegetative">🌿 Vegetative</SelectItem>
                <SelectItem value="flowering">🌸 Flowering</SelectItem>
                <SelectItem value="harvest">🌾 Harvest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white/50 text-xs">Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="bg-white/5 border-white/10 text-white mt-1 resize-none" rows={2} />
          </div>
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">Save Nutrient Log</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}