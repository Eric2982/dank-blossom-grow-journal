import React, { useState } from "react";
import { ChevronDown, Leaf, AlertTriangle, BookOpen, Lightbulb, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const sections = [
  {
    id: "vpd",
    icon: Lightbulb,
    title: "Understanding VPD",
    color: "text-violet-400",
    content: `**Vapor Pressure Deficit (VPD)** measures the difference between the moisture in the air and how much moisture the air can hold when saturated.

**Ideal Ranges:**
- Seedling / Clone: 0.4–0.8 kPa
- Vegetative: 0.8–1.2 kPa
- Early Flower: 1.0–1.5 kPa
- Late Flower: 1.2–1.6 kPa

**Why it matters:** VPD directly affects transpiration rate. Too low = risk of mold. Too high = plants close stomata and stop growing.`,
    resources: [
      { title: "Quest - VPD Chart & Calculator", url: "https://www.questclimate.com/vpd-chart-vapor-pressure-deficit/" },
      { title: "Royal Queen Seeds - Complete VPD Guide", url: "https://www.royalqueenseeds.com/blog-vpd-chart-cannabis-n1042" }
    ]
  },
  {
    id: "ppfd",
    icon: Lightbulb,
    title: "PPFD & Light",
    color: "text-yellow-400",
    content: `**Photosynthetic Photon Flux Density (PPFD)** measures the amount of usable light reaching your canopy.

**Ideal Ranges:**
- Seedlings: 100–300 µmol/m²/s
- Vegetative: 400–600 µmol/m²/s
- Flowering: 600–900 µmol/m²/s

**DLI (Daily Light Integral):** Aim for 25–40 mol/m²/day during flower. Calculate: PPFD × 3600 × hours ÷ 1,000,000.`,
    resources: [
      { title: "Photone - PPFD Meter App", url: "https://photoneapp.com/" },
      { title: "Migro - LED Grow Light Science", url: "https://migrolight.com/blogs/grow-lights" },
      { title: "Fluence - DLI Calculator", url: "https://fluence.science/science-articles/dli-daily-light-integral-calculator/" }
    ]
  },
  {
    id: "ec",
    icon: Lightbulb,
    title: "EC & Nutrients",
    color: "text-emerald-400",
    content: `**Electrical Conductivity (EC)** measures the total dissolved salts in your nutrient solution.

**Ideal Ranges:**
- Seedling: 0.5–0.8 mS/cm
- Early Veg: 0.8–1.2 mS/cm
- Late Veg: 1.2–1.6 mS/cm
- Flowering: 1.6–2.2 mS/cm
- Late Flower: 1.0–1.6 mS/cm

**Tip:** Always measure runoff EC. If runoff EC is much higher than input, flush your medium.`,
    resources: [
      { title: "General Hydroponics - Feed Charts", url: "https://generalhydroponics.com/feedcharts" },
      { title: "Bluelab - EC/PPM Guide", url: "https://www.bluelab.com/learning-center/ec-tds-and-cf" }
    ]
  },
  {
    id: "deficiencies",
    icon: AlertTriangle,
    title: "Common Deficiencies",
    color: "text-rose-400",
    content: `**Nitrogen (N):** Lower leaves turn pale yellow, then fall off. Common in late veg/early flower.

**Phosphorus (P):** Dark green leaves with purple stems. Slow growth. Common in flower.

**Potassium (K):** Brown/burnt leaf edges (tips and margins). Older leaves affected first.

**Calcium (Ca):** Brown spots on new growth, curling leaf tips. Common in coco coir.

**Magnesium (Mg):** Interveinal chlorosis (yellowing between veins) on older leaves.

**Iron (Fe):** Interveinal chlorosis on NEW growth. Usually caused by high pH.

**Tip:** Most deficiencies are caused by pH lockout, not lack of nutrients. Check pH first!`,
    resources: [
      { title: "Grow Weed Easy - Nutrient Deficiency Pictures", url: "https://www.growweedeasy.com/cannabis-symptoms-pictures" },
      { title: "Royal Queen Seeds - Nutrient Deficiency Chart", url: "https://www.royalqueenseeds.com/blog-cannabis-nutrient-deficiency-chart-n757" }
    ]
  },
  {
    id: "ph",
    icon: BookOpen,
    title: "pH Guide",
    color: "text-pink-400",
    content: `**pH** determines nutrient availability. Wrong pH = lockout even with plenty of nutrients.

**Ideal Ranges:**
- Soil: 6.0–7.0 (sweet spot: 6.5)
- Coco / Hydro: 5.5–6.5 (sweet spot: 5.8–6.0)

**Tip:** Let pH drift slightly between waterings (e.g., 5.8 → 6.2) so all nutrients get a chance to be absorbed at their optimal pH range.`,
    resources: [
      { title: "GrowWeedEasy - pH Perfect Guide", url: "https://www.growweedeasy.com/ph" },
      { title: "Advanced Nutrients - pH Perfect Technology", url: "https://www.advancednutrients.com/articles/ph-perfect-technology/" }
    ]
  },
  {
    id: "environment",
    icon: Leaf,
    title: "Climate Control",
    color: "text-blue-400",
    content: `**Temperature:**
- Veg: 70–85°F (lights on), 65–75°F (lights off)
- Flower: 65–80°F (lights on), 60–70°F (lights off)
- Late flower: drop to 60–65°F at night for color expression

**Humidity:**
- Seedling: 65–70%
- Veg: 50–60%
- Flower: 40–50%
- Late Flower: 35–45%

**Airflow:** Ensure gentle leaf movement. Stagnant air = mold & weak stems.`,
    resources: [
      { title: "Perfect Grower - Climate Guide", url: "https://perfectgrower.com/knowledge/temperature-humidity-guide/" },
      { title: "Grow Weed Easy - Environment Tutorial", url: "https://www.growweedeasy.com/temperature" }
    ]
  },
];

function AccordionItem({ section }) {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <Icon className={`w-5 h-5 ${section.color} shrink-0`} />
        <span className="text-white font-medium text-sm flex-1">{section.title}</span>
        <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0">
              <div className="text-white/50 text-sm leading-relaxed whitespace-pre-line mb-4">
                {section.content.split(/\*\*(.*?)\*\*/g).map((part, i) =>
                  i % 2 === 1 ? <strong key={i} className="text-white/80">{part}</strong> : part
                )}
              </div>
              {section.resources && (
                <div className="pt-3 border-t border-white/5">
                  <div className="text-white/40 text-xs font-medium mb-2">Learn More:</div>
                  <div className="space-y-1.5">
                    {section.resources.map((resource, idx) => (
                      <a key={idx} href={resource.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-xs transition-colors group">
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span>{resource.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LearnSection() {
  return (
    <div className="space-y-3">
      {sections.map(section => (
        <AccordionItem key={section.id} section={section} />
      ))}
    </div>
  );
}