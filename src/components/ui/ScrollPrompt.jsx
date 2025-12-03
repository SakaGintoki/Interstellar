import React, { useState, useEffect } from "react";
import { useSceneStore } from "../../hooks/useSceneStore";

function ScrollPrompt() {
  const [visible, setVisible] = useState(true);
  const currentScale = useSceneStore((state) => state.currentScale);

  useEffect(() => {
    // Sembunyikan jika bukan di scene 'atom'
    if (currentScale !== "atom") {
      setVisible(false);
    }
  }, [currentScale]);

  if (!visible) return null;

  return (
    // UBAH: Tambahkan 'hidden md:block'
    // 'hidden': Sembunyi secara default (Mobile)
    // 'md:block': Muncul hanya di layar medium ke atas (Desktop)
    <div className="hidden md:block fixed bottom-24 left-1/2 -translate-x-1/2 transform text-white text-center animate-pulse z-50 pointer-events-none">
      
      <p className="text-xs font-mono tracking-[0.2em] uppercase opacity-80 mb-2 drop-shadow-md">
        Scroll to Explore
      </p>

      <div className="w-5 h-8 border border-white/60 rounded-full mx-auto relative backdrop-blur-md bg-black/10 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
        <div className="w-1 h-1.5 bg-cyan-400 rounded-full absolute left-1/2 -translate-x-1/2 top-1.5 animate-bounce"></div>
      </div>

    </div>
  );
}

export default ScrollPrompt;