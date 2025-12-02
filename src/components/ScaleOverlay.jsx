import React from "react";
import { useSceneStore } from "../hooks/useSceneStore";

// Helper: Format angka besar/kecil dengan rapi
function formatScale(meters) {
  const abs = Math.abs(meters);
  if (!isFinite(abs) || abs === 0) return { val: "0", unit: "m" };

  const prefixes = [
    { exp: -9, name: "nanometers", short: "nm" },
    { exp: -6, name: "micrometers", short: "µm" },
    { exp: -3, name: "millimeters", short: "mm" },
    { exp: 0,  name: "meters",      short: "m" },
    { exp: 3,  name: "kilometers",  short: "km" },
    { exp: 6,  name: "megameters",  short: "Mm" },
    { exp: 9,  name: "gigameters",  short: "Gm" },
    { exp: 12, name: "terameters",  short: "Tm" },
    { exp: 15, name: "petameters",  short: "Pm" },
    { exp: 18, name: "exameters",   short: "Em" },
    { exp: 21, name: "zettameters", short: "Zm" },
    { exp: 24, name: "yottameters", short: "Ym" },
  ];

  const exponent = Math.floor(Math.log10(abs));
  let best = prefixes[0];
  
  // Find best fit prefix
  for (const p of prefixes) {
    if (exponent >= p.exp) best = p;
  }

  const value = abs / Math.pow(10, best.exp);
  
  // Logic pembulatan yang lebih bersih
  let display;
  if (value < 10) display = value.toFixed(2);
  else if (value < 100) display = value.toFixed(1);
  else display = value.toFixed(0);

  return { val: display, unit: best.name };
}

export function ScaleOverlay() {
  const scaleExp = useSceneStore((s) => s.scaleExp);
  
  // Kalkulasi nilai
  const meters = isFinite(scaleExp) ? Math.pow(10, scaleExp) : 1;
  const { val, unit } = formatScale(meters);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center gap-2">
      {/* Indikator Panah Kecil */}
      {/* <div className="w-0.5 h-4 bg-cyan-400/50 mb-1 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div> */}

      {/* Main Container */}
      <div className="backdrop-blur-md bg-black/40 border border-white/10 rounded-full px-6 py-2 flex items-baseline gap-3 shadow-2xl shadow-black/50 ring-1 ring-white/5">
        <span className="text-cyan-200/60 text-xs font-mono uppercase tracking-widest">
          Current Scale
        </span>
        
        <div className="flex items-baseline gap-1.5 text-white">
          <span className="font-mono text-base font-light tracking-tighter tabular-nums text-cyan-50 drop-shadow-md">
            {val}
          </span>
          <span className="text-sm font-light text-cyan-200/80">
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}