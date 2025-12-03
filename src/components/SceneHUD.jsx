import React, { useEffect, useState } from "react";
import { useSceneStore } from "../hooks/useSceneStore";

// --- DATA CONSTANTS ---
const SCENE_DATA = {
  atom: {
    title: "Atom",
    tagline: "Building block of matter",
    paragraph: "Atom adalah tata surya terkecil penyusun semesta. Intinya padat layaknya matahari, dikelilingi elektron yang mengorbit cepat. Inilah blok bangunan dasar dari semua materi yang Anda sentuh.",
  },
  dna: {
    title: "DNA",
    tagline: "Genetic information carrier",
    paragraph: "DNA adalah kode rahasia kehidupan Anda. Molekul ini menyimpan instruksi lengkap dari orang tua, menentukan segala sifat unik tubuh dan memastikan cerita kehidupan terus berlanjut.",
  },
  cell: {
    title: "Cell",
    tagline: "Basic unit of life",
    paragraph: "Sel adalah pabrik mikroskopis yang tak pernah tidur. Unit terkecil ini bekerja nonstop mengubah makanan menjadi energi dan menjalankan instruksi tubuh agar Anda tetap hidup dan bergerak.",
  },
  earth: {
    title: "Earth",
    tagline: "Our living planet",
    paragraph: "Bumi dan Bulan adalah pasangan dansa abadi. Gravitasi mengikat keduanya, di mana Bulan menjaga kestabilan putaran Bumi dan mengatur irama pasang surut lautan kita.",
  },
  solar: {
    title: "Solar System",
    tagline: "Our cosmic neighborhood",
    paragraph: "Tata surya adalah keluarga besar planet yang mengelilingi Matahari. Dari planet batuan hingga raksasa gas, semuanya berdansa mengelilingi satu titik api kehidupan karena ikatan gravitasi yang kuat.",
  },
  galaxy: {
    title: "Galaxy",
    tagline: "Island of star systems",
    paragraph: "Galaksi adalah kota metropolitan bertabur bintang. Pusatnya yang terang benderang mengikat ratusan miliar tata surya termasuk milik kita dalam satu putaran gravitasi yang megah.",
  },
  universe: {
    title: "Universe",
    tagline: "All space and time",
    paragraph: "Universe adalah samudra kosmik tanpa tepi. Galaksi-galaksi hanyalah pulau cahaya kecil yang tersebar di dalamnya. Ini adalah wadah mahaluas tempat semua sejarah dan masa depan terjadi.",
  },
};

function useTypewriter(text, speed = 30, delay = 0) {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    setDisplayedText(""); 
    const timeoutStart = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText((prev) => text.slice(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, speed);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeoutStart);
  }, [text, speed, delay]);

  return displayedText;
}

export function SceneHUD() {
  const currentScale = useSceneStore((s) => s.currentScale) || "atom";
  const { title, tagline, paragraph } = SCENE_DATA[currentScale] || SCENE_DATA.atom;

  const displayTitle = useTypewriter(title, 100, 0);
  const displayTagline = useTypewriter(tagline, 40, 600); 
  const displayParagraph = useTypewriter(paragraph, 10, 1000);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none">
      
      {/* TOP CENTER: Title & Tagline */}
      {/* Diubah: top-20 di HP (turun ke bawah) agar tidak nabrak header 'Interstellar' */}
      <div className="absolute top-20 md:top-8 left-0 w-full flex flex-col items-center justify-center">
        <div className="relative backdrop-blur-sm bg-black/20 border-y border-cyan-500/30 px-8 py-3 md:px-12 md:py-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-[90%]">
          {/* Decorative Lines */}
          <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500/50"></div>
          <div className="absolute top-0 right-0 w-1.5 h-full bg-cyan-500/50"></div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-200 uppercase drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] text-center">
            {displayTitle}
          </h1>
          
          <div className="mt-1 text-[10px] md:text-sm font-mono text-cyan-300/80 tracking-widest text-center uppercase min-h-[1em]">
             {displayTagline}
          </div>
        </div>
      </div>

      {/* BOTTOM LEFT: Description Card */}
      {/* Diubah: bottom-36 di HP (naik ke atas) agar scale pill ada di bawahnya, bukan menumpuk */}
      <div className="absolute bottom-36 left-4 right-4 md:bottom-36 md:left-8 md:right-auto md:max-w-xs">
        <div className="relative overflow-hidden rounded-tr-3xl bg-black/60 backdrop-blur-xl border-l-4 border-cyan-500 p-5 md:p-8 shadow-2xl ring-1 ring-white/10 group">
          
          {/* Scanline effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_2px,3px_100%] opacity-20"></div>

          {/* Header kecil */}
          <div className="flex items-center gap-2 mb-2 opacity-60">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></div>
            <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-cyan-100">
              Information
            </span>
          </div>

          <p className="relative z-10 text-xs md:text-[12px] leading-relaxed text-slate-200 font-light text-justify font-sans tracking-wide">
            {displayParagraph}
          </p>
        </div>
      </div>
    </div>
  );
}