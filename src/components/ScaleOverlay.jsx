import React from "react";
import { useSceneStore } from "../hooks/useSceneStore";

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
  
  for (const p of prefixes) {
    if (exponent >= p.exp) best = p;
  }

  const value = abs / Math.pow(10, best.exp);
  
  let display;
  if (value < 10) display = value.toFixed(2);
  else if (value < 100) display = value.toFixed(1);
  else display = value.toFixed(0);

  return { val: display, unit: best.name };
}

export function ScaleOverlay() {
  const scaleExp = useSceneStore((s) => s.scaleExp);
  const meters = isFinite(scaleExp) ? Math.pow(10, scaleExp) : 1;
  const { val, unit } = formatScale(meters);

  return (
    // Diubah: bottom-20 di HP (memberi ruang untuk tombol navigasi zoom di paling bawah)
    <div className="fixed bottom-20 md:bottom-12 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center gap-2 w-full">
      
      {/* Container dibuat lebih compact di mobile */}
      <div className="backdrop-blur-xl bg-black/60 border border-white/10 rounded-full px-5 py-2 flex items-baseline gap-2 shadow-2xl shadow-black/80 ring-1 ring-cyan-500/20">
        <span className="text-cyan-200/50 text-[10px] font-mono uppercase tracking-widest hidden xs:inline-block">
          Scale
        </span>
        
        <div className="flex items-baseline gap-1 text-white">
          <span className="font-mono text-sm md:text-base font-bold tracking-tighter tabular-nums text-cyan-50 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
            {val}
          </span>
          <span className="text-xs md:text-sm font-medium text-cyan-200/80">
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}