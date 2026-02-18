import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Scan } from "lucide-react";

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
  const [nutrients, setNutrients] = useState([{
    nutrient_name: "", brand: "", volume_ml: "", nutrient_type: "base"
  }]);
  const [waterVolume, setWaterVolume] = useState("");
  const [growStage, setGrowStage] = useState("vegetative");
  const [notes, setNotes] = useState("");
  const [scanningIndex, setScanningIndex] = useState(null);

  const addNutrient = () => {
    setNutrients([...nutrients, { nutrient_name: "", brand: "", volume_ml: "", nutrient_type: "base" }]);
  };

  const removeNutrient = (index) => {
    setNutrients(nutrients.filter((_, i) => i !== index));
  };

  const updateNutrient = (index, field, value) => {
    const updated = [...nutrients];
    updated[index][field] = value;
    setNutrients(updated);
  };

  const handleBarcodeScan = async (index) => {
    setScanningIndex(index);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: "Extract the product name and brand from this barcode or product. Return as JSON with fields: product_name, brand",
        response_json_schema: {
          type: "object",
          properties: {
            product_name: { type: "string" },
            brand: { type: "string" }
          }
        }
      });
      if (result.product_name) {
        updateNutrient(index, "nutrient_name", result.product_name);
        updateNutrient(index, "brand", result.brand || "");
      }
    } catch (error) {
      alert("Barcode scanning not available. Please enter manually.");
    } finally {
      setScanningIndex(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validNutrients = nutrients.filter(n => n.nutrient_name && n.volume_ml);
    
    if (validNutrients.length === 0) {
      alert("Please add at least one nutrient");
      return;
    }

    onSubmit({
      nutrients: validNutrients.map(n => ({
        nutrient_name: n.nutrient_name,
        brand: n.brand || undefined,
        volume_ml: parseFloat(n.volume_ml),
        water_volume_liters: waterVolume ? parseFloat(waterVolume) : undefined,
        nutrient_type: n.nutrient_type,
        grow_stage: growStage,
        notes: notes || undefined,
      }))
    });

    setNutrients([{ nutrient_name: "", brand: "", volume_ml: "", nutrient_type: "base" }]);
    setWaterVolume("");
    setGrowStage("vegetative");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white font-light text-xl">Log Nutrients</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {nutrients.map((nutrient, index) => (
              <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white/70 text-sm">Nutrient #{index + 1}</Label>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="ghost" 
                      onClick={() => handleBarcodeScan(index)}
                      className="text-emerald-400 hover:text-emerald-300 h-7 px-2">
                      <Scan className="w-3 h-3 mr-1" /> Scan
                    </Button>
                    {nutrients.length > 1 && (
                      <Button type="button" size="sm" variant="ghost"
                        onClick={() => removeNutrient(index)}
                        className="text-red-400 hover:text-red-300 h-7 px-2">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white/50 text-xs">Product Name *</Label>
                    <Input
                      value={nutrient.nutrient_name}
                      onChange={(e) => updateNutrient(index, "nutrient_name", e.target.value)}
                      className="bg-white/5 border-white/10 text-white mt-1"
                      placeholder="e.g. Tiger Bloom"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-white/50 text-xs">Brand</Label>
                    <Input
                      value={nutrient.brand}
                      onChange={(e) => updateNutrient(index, "brand", e.target.value)}
                      className="bg-white/5 border-white/10 text-white mt-1"
                      placeholder="e.g. Fox Farm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white/50 text-xs">Type</Label>
                    <Select value={nutrient.nutrient_type} onValueChange={(v) => updateNutrient(index, "nutrient_type", v)}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-white/10">
                        {nutrientTypes.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white/50 text-xs">Amount (ml) *</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={nutrient.volume_ml}
                      onChange={(e) => updateNutrient(index, "volume_ml", e.target.value)}
                      className="bg-white/5 border-white/10 text-white mt-1"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button type="button" onClick={addNutrient} variant="outline" size="sm"
            className="border-white/10 text-white hover:bg-white/5 w-full">
            <Plus className="w-3 h-3 mr-2" /> Add Another Nutrient
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-white/50 text-xs">Water Volume (L)</Label>
              <Input
                type="number"
                step="0.1"
                value={waterVolume}
                onChange={(e) => setWaterVolume(e.target.value)}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/50 text-xs">Growth Stage</Label>
              <Select value={growStage} onValueChange={setGrowStage}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-white/10">
                  <SelectItem value="seedling">Seedling</SelectItem>
                  <SelectItem value="vegetative">Vegetative</SelectItem>
                  <SelectItem value="flowering">Flowering</SelectItem>
                  <SelectItem value="harvest">Harvest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-white/50 text-xs">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-white/5 border-white/10 text-white mt-1 resize-none"
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
            Log Nutrients
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}