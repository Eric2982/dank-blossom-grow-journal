import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function BarcodeScanner({ open, onOpenChange, onResult }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | manual | loading | error
  const [errorMsg, setErrorMsg] = useState("");
  const [manualBarcode, setManualBarcode] = useState("");

  const lookupBarcode = async (barcode) => {
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Look up this product barcode: ${barcode}. Find the real product name, brand, and what type of nutrient/product it is (base, bloom, grow, cal-mag, silica, enzyme, beneficial, pH_up, pH_down, or other). Return accurate product information.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            product_name: { type: "string" },
            brand: { type: "string" },
            nutrient_type: { type: "string" },
            found: { type: "boolean" }
          }
        }
      });
      if (result.found && result.product_name) {
        onResult({
          nutrient_name: result.product_name,
          brand: result.brand || "",
          nutrient_type: result.nutrient_type || "other"
        });
        onOpenChange(false);
      } else {
        setStatus("error");
        setErrorMsg(`Barcode ${barcode} not found. Please enter manually.`);
      }
    } catch (e) {
      setStatus("error");
      setErrorMsg("Could not look up product. Please enter manually.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white font-light text-lg">Scan Barcode</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {status === "scanning" && (
            <>
              <p className="text-white/50 text-sm text-center">Point camera at product barcode</p>
              <div className="relative rounded-lg overflow-hidden bg-black aspect-[4/3]">
                <video ref={videoRef} className="w-full h-full object-cover" />
                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-2/3 h-1/3 border-2 border-emerald-400 rounded-md opacity-70" />
                </div>
              </div>
            </>
          )}

          {status === "loading" && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              <p className="text-white/70 text-sm">Looking up product...</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <p className="text-red-400 text-sm text-center">{errorMsg}</p>
              <Button onClick={startScanner} className="bg-emerald-600 hover:bg-emerald-500">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}