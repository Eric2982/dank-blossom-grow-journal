import React from "react";
import { Badge } from "@/components/ui/badge";
import { Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, differenceInDays } from "date-fns";

const typeColors = {
  indica: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  sativa: "bg-green-500/15 text-green-400 border-green-500/20",
  hybrid: "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

const statusColors = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  harvested: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  planned: "bg-blue-500/15 text-blue-400 border-blue-500/20",
};

export default function StrainCard({ strain, onDelete }) {
  const daysGrowing = strain.planted_date ? differenceInDays(new Date(), new Date(strain.planted_date)) : null;

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-base truncate">{strain.name}</h3>
          {strain.breeder && <p className="text-white/30 text-xs mt-0.5">{strain.breeder}</p>}
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-white/15 hover:text-red-400 shrink-0 -mt-1"
          onClick={() => onDelete(strain.id)}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge className={`${typeColors[strain.type]} border text-[10px]`}>
          {strain.type}
        </Badge>
        <Badge className={`${statusColors[strain.status]} border text-[10px]`}>
          {strain.status}
        </Badge>
      </div>

      <div className="space-y-1.5 text-xs">
        {(strain.thc_percentage || strain.cbd_percentage) && (
          <div className="flex items-center gap-2 text-white/40">
            <span>THC: {strain.thc_percentage ?? "—"}%</span>
            <span>•</span>
            <span>CBD: {strain.cbd_percentage ?? "—"}%</span>
          </div>
        )}
        {strain.flowering_time_days && (
          <div className="text-white/40">
            Flowering: {strain.flowering_time_days} days
          </div>
        )}
        {strain.planted_date && (
          <div className="flex items-center gap-1.5 text-white/40">
            <Calendar className="w-3 h-3" />
            Planted: {format(new Date(strain.planted_date), "MMM d, yyyy")}
            {daysGrowing && strain.status === "active" && (
              <span className="text-emerald-400 ml-1">({daysGrowing}d)</span>
            )}
          </div>
        )}
        {strain.harvest_date && (
          <div className="text-white/40">
            Harvest: {format(new Date(strain.harvest_date), "MMM d, yyyy")}
          </div>
        )}
      </div>

      {strain.notes && (
        <p className="text-white/30 text-xs mt-3 pt-3 border-t border-white/5 line-clamp-2">{strain.notes}</p>
      )}
    </div>
  );
}