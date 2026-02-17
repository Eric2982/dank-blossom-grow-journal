import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function StrainForm({ open, onOpenChange, onSubmit }) {
  const [form, setForm] = useState({
    name: "", type: "hybrid", breeder: "", thc_percentage: "", cbd_percentage: "",
    flowering_time_days: "", planted_date: "", harvest_date: "", status: "active", notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name: form.name,
      type: form.type,
      breeder: form.breeder || undefined,
      thc_percentage: form.thc_percentage ? parseFloat(form.thc_percentage) : undefined,
      cbd_percentage: form.cbd_percentage ? parseFloat(form.cbd_percentage) : undefined,
      flowering_time_days: form.flowering_time_days ? parseInt(form.flowering_time_days) : undefined,
      planted_date: form.planted_date || undefined,
      harvest_date: form.harvest_date || undefined,
      status: form.status,
      notes: form.notes || undefined,
    };
    onSubmit(data);
    setForm({ name: "", type: "hybrid", breeder: "", thc_percentage: "", cbd_percentage: "",
      flowering_time_days: "", planted_date: "", harvest_date: "", status: "active", notes: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white font-light text-xl">Add Strain</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-white/50 text-xs">Strain Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-white/5 border-white/10 text-white mt-1" placeholder="e.g. Gorilla Glue #4" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-white/50 text-xs">Type *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-white/10">
                  <SelectItem value="indica">Indica</SelectItem>
                  <SelectItem value="sativa">Sativa</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/50 text-xs">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-white/10">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="harvested">Harvested</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-white/50 text-xs">Breeder / Seed Bank</Label>
            <Input value={form.breeder} onChange={(e) => setForm({ ...form, breeder: e.target.value })}
              className="bg-white/5 border-white/10 text-white mt-1" placeholder="e.g. Barney's Farm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-white/50 text-xs">THC %</Label>
              <Input type="number" step="0.1" value={form.thc_percentage} onChange={(e) => setForm({ ...form, thc_percentage: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1" />
            </div>
            <div>
              <Label className="text-white/50 text-xs">CBD %</Label>
              <Input type="number" step="0.1" value={form.cbd_percentage} onChange={(e) => setForm({ ...form, cbd_percentage: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-white/50 text-xs">Flowering Time (days)</Label>
            <Input type="number" value={form.flowering_time_days} onChange={(e) => setForm({ ...form, flowering_time_days: e.target.value })}
              className="bg-white/5 border-white/10 text-white mt-1" placeholder="e.g. 60" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-white/50 text-xs">Planted Date</Label>
              <Input type="date" value={form.planted_date} onChange={(e) => setForm({ ...form, planted_date: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1" />
            </div>
            <div>
              <Label className="text-white/50 text-xs">Harvest Date</Label>
              <Input type="date" value={form.harvest_date} onChange={(e) => setForm({ ...form, harvest_date: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-white/50 text-xs">Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="bg-white/5 border-white/10 text-white mt-1 resize-none" rows={2} />
          </div>
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
            Add Strain
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}