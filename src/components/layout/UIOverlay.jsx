import React from 'react'
import AIPanel from '../ui/AIPanel'
import AIToggleButton from '../ui/AIToggleButton'
import ScrollPrompt from '../ui/ScrollPrompt'
import { ScaleOverlay } from '../ScaleOverlay'
import { SceneHUD } from '../SceneHUD'

// Ini adalah Layout utama yang membungkus semua UI layer
function UIOverlay() {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-10 font-sans">
      
      {/* 1. Header Area */}
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-50">
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-2xl font-light text-white tracking-[0.2em] uppercase mix-blend-difference opacity-90">
            Interstellar
          </h1>
          <span className="text-[10px] text-cyan-300 font-mono tracking-widest mt-1 opacity-70">
            PROJECT // V.1.0
          </span>
        </div>
      </header>

      {/* 2. Interactive Elements (Pointer events auto) */}
      <div className="pointer-events-auto absolute z-50 right-6 top-6">
        <AIToggleButton />
      </div>

      <div className="pointer-events-auto absolute z-40 right-0 top-0 h-full">
         <AIPanel />
      </div>

      {/* 3. Data Overlays (Passive) */}
      <SceneHUD />
      <ScaleOverlay />
      
      {/* 4. Footer / Prompts */}
      <div className="absolute bottom-10 right-10 z-30">
        <ScrollPrompt />
      </div>

      {/* Vignette Overlay untuk kesan cinematic */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)] pointer-events-none z-0"></div>
    </div>
  )
}

export default UIOverlay