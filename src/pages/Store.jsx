import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag } from "lucide-react";
import StoreCard from "../components/grow/StoreCard";

const categories = [
  { value: "all", label: "All" },
  { value: "lighting", label: "Lighting" },
  { value: "nutrients", label: "Nutrients" },
  { value: "climate_control", label: "Climate" },
  { value: "monitoring", label: "Monitoring" },
  { value: "tents_rooms", label: "Tents" },
  { value: "growing_media", label: "Media" },
  { value: "irrigation", label: "Irrigation" },
  { value: "accessories", label: "Accessories" },
];

export default function Store() {
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: items = [] } = useQuery({
    queryKey: ["store"],
    queryFn: () => base44.entities.StoreItem.list("-created_date", 100),
  });

  const filtered = activeCategory === "all" ? items : items.filter(i => i.category === activeCategory);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light text-white">Grow Shop</h1>
        <p className="text-white/30 text-sm mt-1">Recommended equipment & supplies</p>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveCategory}>
        <TabsList className="bg-white/5 border border-white/5 flex-wrap h-auto gap-1 p-1">
          {categories.map(c => (
            <TabsTrigger key={c.value} value={c.value}
              className="text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-white/40">
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-16 text-center">
          <ShoppingBag className="w-10 h-10 text-white/10 mx-auto mb-4" />
          <p className="text-white/30 text-sm">No products listed yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(item => <StoreCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}