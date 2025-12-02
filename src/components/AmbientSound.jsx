import React, { useState, useRef } from "react";

const AmbientSound = () => {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false); 
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  const FADE_OUT_DURATION = 50; 

  const initializeAudio = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch((err) => console.log("Audio play error:", err));

      setIsFadingOut(true);

      setTimeout(() => {
        setHasInteracted(true);
      }, FADE_OUT_DURATION); 
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <>
      <audio ref={audioRef} loop src="/sounds/interstellar.mp3" />
      
      {/* 1. LAYAR SPLASH AWAL (Fade-Out Logic) */}
      {!hasInteracted && (
        <div 
          className={`
            fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden
            transition-opacity duration-${FADE_OUT_DURATION} ease-out 
            ${isFadingOut ? 'opacity-0' : 'opacity-100'}
          `}
        >
          
          {/* A. Background Atmosphere (Radial Gradient halus) */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-black to-black pointer-events-none"></div>
          
          {/* B. HUD Elements (Garis Dekorasi Pojok) */}
          {/* Top Left */}
          <div className="absolute top-8 left-8 w-64 h-64 border-l border-t border-cyan-500/20 opacity-50"></div>
          <div className="absolute top-8 left-8 w-2 h-2 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
          {/* Bottom Right */}
          <div className="absolute bottom-8 right-8 w-64 h-64 border-r border-b border-cyan-500/20 opacity-50"></div>
          <div className="absolute bottom-8 right-8 w-2 h-2 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>

          {/* C. Vertical Lines Decor */}
          <div className="absolute top-0 bottom-0 left-20 w-[1px] bg-gradient-to-b from-transparent via-cyan-900/30 to-transparent hidden md:block"></div>
          <div className="absolute top-0 bottom-0 right-20 w-[1px] bg-gradient-to-b from-transparent via-cyan-900/30 to-transparent hidden md:block"></div>

          {/* D. Main Content Container */}
          <div className="relative z-10 flex flex-col items-center text-center px-4">
            
            {/* Status Label */}
            <div className="mb-6 flex items-center gap-3 opacity-60">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] md:text-xs font-mono tracking-[0.3em] text-cyan-400 uppercase">
                System Online // Ready for Connection
              </span>
            </div>

            {/* BIG TITLE */}
            <h1 className="text-4xl md:text-7xl font-bold text-white tracking-[0.2em] mb-2 drop-shadow-[0_0_25px_rgba(6,182,212,0.5)]">
              INTERSTELLAR
            </h1>
            <h2 className="text-xs md:text-sm text-cyan-300/50 font-mono tracking-[0.5em] uppercase mb-12">
              Journey Across Scales
            </h2>

            {/* THE BUTTON */}
            <button
              onClick={initializeAudio}
              className="group relative px-10 py-4 rounded-full transition-all duration-500 ease-out border border-cyan-500/30 backdrop-blur-md bg-black/40 hover:bg-cyan-900/40 shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_35px_rgba(34,211,238,0.5)] hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 rounded-full border border-cyan-400/30 border-t-transparent animate-spin-slow pointer-events-none"></div>
              <div className="absolute inset-0 rounded-full blur-md opacity-20 group-hover:opacity-40 bg-cyan-400 transition-opacity duration-500"></div>
              <div className="relative z-10 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-200 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-mono text-sm tracking-[0.2em] text-cyan-200 group-hover:text-white transition-colors uppercase">
                  Initialize System
                </span>
              </div>
            </button>
            
            {/* Audio Recommendation Footer */}
            <div className="mt-16 text-[9px] text-cyan-700/50 font-mono tracking-widest uppercase">
              [ Recommended: Use Headphones for Full Immersion ]
            </div>
          </div>
        </div>
      )}

      {/* 2. TOMBOL MUTE */}
      {hasInteracted && (
        <button
          onClick={toggleMute}
          title={isMuted ? "Unmute Sound" : "Mute Sound"}
          className={`
            fixed bottom-20 right-6 z-50 p-3 rounded-full transition-all duration-500 ease-out origin-center
            border backdrop-blur-md group
            ${isMuted 
              ? 'bg-red-500/10 hover:bg-red-500/30 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
              : 'bg-black/40 hover:bg-cyan-900/40 border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
            }
          `}
        >
          {/* A. Decorative Ring Spin (Hanya muncul saat Suara ON) */}
          {!isMuted && (
            <div className="absolute inset-0 rounded-full border border-cyan-400/30 border-t-transparent animate-spin-slow pointer-events-none"></div>
          )}

          {/* B. Glow Effect Background */}
          <div className={`absolute inset-0 rounded-full blur-md opacity-40 transition-opacity duration-500 ${isMuted ? 'bg-red-500' : 'bg-cyan-400 group-hover:opacity-60'}`}></div>

          {/* C. Icon Logic */}
          <div className="relative z-10">
            {isMuted ? (
              // Icon Mute (Speaker Silang - Merah Pucat)
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              // Icon Sound On (Speaker Wave - Cyan Cerah)
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-200 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </div>
        </button>
      )}
    </>
  );
};

export default AmbientSound;