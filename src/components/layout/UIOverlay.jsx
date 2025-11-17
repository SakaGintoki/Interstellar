import React from 'react'
import AIPanel from '../ui/AIPanel'
import AIToggleButton from '../ui/AIToggleButton'
import ScrollPrompt from '../ui/ScrollPrompt'

function UIOverlay() {
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-10">
      {/* Container for all UI elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        {/* Header/Title - kept simple */}
        <h1 className="absolute top-4 left-6 text-xl md:text-2xl font-thin text-white opacity-90 mix-blend-difference">
          Interstellar Project
        </h1>

        <AIToggleButton />
        <AIPanel />
        <ScrollPrompt />
      </div>
    </div>
  )
}

export default UIOverlay