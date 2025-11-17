import React from 'react'
import { useSceneStore } from '../../hooks/useSceneStore'

function AIToggleButton() {
  const { isAIPanelOpen, toggleAIPanel } = useSceneStore()

  return (
    <button
      onClick={toggleAIPanel}
      className="absolute top-4 right-6 p-2 rounded-full bg-space-gray-light hover:bg-accent-blue text-white z-50 pointer-events-auto transition-all"
      aria-label={isAIPanelOpen? 'Close AI Panel' : 'Open AI Panel'}
    >
      {isAIPanelOpen? (
        // Close Icon (X)
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        // AI Icon (Sparkle)
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-6.857 2.143L12 21l-2.143-6.857L3 12l6.857-2.143L12 3zm5 16l-1-3-1 3 1 3 1-3z" />
        </svg>
      )}
    </button>
  )
}

export default AIToggleButton