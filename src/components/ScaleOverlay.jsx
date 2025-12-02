// src/components/ScaleOverlay.jsx
import React from "react";
import { useSceneStore } from "../hooks/useSceneStore";

// Format a meter value into e.g. "3 micrometers", "300 kilometers", etc.
function formatScale(meters) {
  const abs = Math.abs(meters);

  // Guard: if NaN / 0 / Infinity, just show something sane
  if (!isFinite(abs) || abs === 0) return "1 meter";

  const prefixes = [
    { exp: -9,  name: "nanometers",    short: "nm" },
    { exp: -6,  name: "micrometers",   short: "µm" },
    { exp: -3,  name: "millimeters",   short: "mm" },
    { exp: 0,   name: "meters",        short: "m" },
    { exp: 3,   name: "kilometers",    short: "km" },
    { exp: 6,   name: "megameters",    short: "Mm" },
    { exp: 9,   name: "gigameters",    short: "Gm" },
    { exp: 12,  name: "terameters",    short: "Tm" },
    { exp: 15,  name: "petameters",    short: "Pm" },
    { exp: 18,  name: "exameters",     short: "Em" },
    { exp: 21,  name: "zettameters",   short: "Zm" },
    { exp: 24,  name: "yottameters",   short: "Ym" },
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

  return `${display} ${best.name}`;
}

export function ScaleOverlay() {
  // 👇 single source of truth: animated log10(meters)
  const scaleExp = useSceneStore((s) => s.scaleExp);

  // convert exponent back to meters
  const meters = isFinite(scaleExp) ? Math.pow(10, scaleExp) : 1;
  const label = formatScale(meters);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 40,
        padding: "8px 16px",
        borderRadius: 999,
        background: "rgba(0, 0, 0, 0.7)",
        color: "#e3f6ff",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: 13,
        letterSpacing: 0.3,
        pointerEvents: "none",
        boxShadow: "0 0 18px rgba(0,0,0,0.6)",
        border: "1px solid rgba(120, 200, 255, 0.4)",
        textAlign: "center",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ opacity: 0.7, marginRight: 6 }}>Scale:</span>
      <span style={{ fontWeight: 600 }}>{label}</span>
    </div>
  );
}