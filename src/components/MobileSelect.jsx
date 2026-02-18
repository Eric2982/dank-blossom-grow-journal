import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function MobileSelect({ value, onValueChange, options, placeholder, label, className }) {
  const [open, setOpen] = React.useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const selectedOption = options.find(opt => opt.value === value);

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className={`justify-start bg-white/5 border-white/10 text-white hover:bg-white/10 ${className}`}
          >
            {selectedOption?.label || placeholder}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="bg-zinc-900 border-white/10">
          <DrawerHeader>
            <DrawerTitle className="text-white">{label || placeholder}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 space-y-2">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  value === option.value
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                <span>{option.label}</span>
                {value === option.value && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`bg-white/5 border-white/10 text-white ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-zinc-800 border-white/10">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}