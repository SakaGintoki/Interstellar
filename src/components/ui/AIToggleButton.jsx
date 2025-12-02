import React from 'react'
import { useSceneStore } from '../../hooks/useSceneStore'

function AIToggleButton() {
  const { isAIPanelOpen, toggleAIPanel } = useSceneStore()

  return (
    <button
      onClick={toggleAIPanel}
      // PERUBAHAN ADA DI SINI:
      // 1. Tambahkan 'transform' (opsional di Tailwind baru, tapi aman ditulis)
      // 2. Logika: jika open 'scale-75', jika close 'scale-100'
      // 3. 'origin-center' memastikan ia mengecil ke tengah titiknya sendiri
      className={`
        group relative p-3 rounded-full transition-all duration-500 ease-out origin-center
        border border-cyan-500/30 backdrop-blur-md
        ${isAIPanelOpen 
          ? 'scale-75 bg-red-500/20 hover:bg-red-500/40 border-red-400/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
          : 'scale-100 bg-black/40 hover:bg-cyan-900/40 border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.4)] animate-pulse-slow'
        }
      `}
      aria-label={isAIPanelOpen ? 'Close AI Interface' : 'Initialize AI Interface'}
    >
      {/* Decorative Ring Spin (Hanya muncul saat tertutup/besar) */}
      {!isAIPanelOpen && (
        <div className="absolute inset-0 rounded-full border border-cyan-400/30 border-t-transparent animate-spin-slow pointer-events-none"></div>
      )}

      {isAIPanelOpen ? (
        // Close Icon (Geometric X)
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        // AI Icon (Data Node / Sparkle)
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-200 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )}

      {/* Glow Effect Background */}
      <div className={`absolute inset-0 rounded-full blur-md opacity-40 transition-opacity duration-500 ${isAIPanelOpen ? 'bg-red-500' : 'bg-cyan-400 group-hover:opacity-60'}`}></div>
    </button>
  )
}

export default AIToggleButton