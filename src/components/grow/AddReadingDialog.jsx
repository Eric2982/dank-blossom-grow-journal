import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fields = [
  { key: "temperature", label: "Temperature (°F)", type: "number", step: "0.1" },
  { key: "humidity", label: "Humidity (%)", type: "number", step: "0.1" },
  { key: "ppfd", label: "PPFD (µmol/m²/s)", type: "number", step: "1" },
  { key: "ec", label: "EC (mS/cm)", type: "number", step: "0.01" },
  { key: "vpd", label: "VPD (kPa)", type: "number", step: "0.01" },
  { key: "ph", label: "pH", type: "number", step: "0.1" },
];

export default function AddReadingDialog({ open, onOpenChange, onSubmit }) {
  const [form, setForm] = useState({
    temperature: "", humidity: "", ppfd: "", ec: "", vpd: "", ph: "",
    grow_stage: "vegetative", notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {};
    fields.forEach(f => {
      if (form[f.key] !== "") data[f.key] = parseFloat(form[f.key]);
    });
    data.grow_stage = form.grow_stage;
    if (form.notes) data.notes = form.notes;
    onSubmit(data);
    setForm({ temperature: "", humidity: "", ppfd: "", ec: "", vpd: "", ph: "", grow_stage: "vegetative", notes: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white font-light text-xl">Log Reading</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {fields.map(f => (
              <div key={f.key}>
                <Label className="text-white/50 text-xs">{f.label}</Label>
                <Input
                  type={f.type}
                  step={f.step}
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                  placeholder="—"
                />
              </div>
            ))}
          </div>
          <div>
            <Label className="text-white/50 text-xs">Growth Stage</Label>
            <Select value={form.grow_stage} onValueChange={(v) => setForm({ ...form, grow_stage: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
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
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="bg-white/5 border-white/10 text-white mt-1 resize-none"
              rows={2}
              placeholder="Observations..."
            />
          </div>
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
            Save Reading
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}