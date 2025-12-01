import React, { useState, useEffect } from 'react'
import { useSceneStore } from '../../hooks/useSceneStore'

function ScrollPrompt() {
  const [visible, setVisible] = useState(true)
  const currentScale = useSceneStore((state) => state.currentScale)

  // Hide the prompt once the user starts scrolling
  useEffect(() => {
    if (currentScale !== 'atom') {
      setVisible(false)
    }
  }, [currentScale])

  if (!visible) return null

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white text-center animate-pulse">
      <p className="text-sm opacity-80">Scroll to explore</p>
      <div className="w-6 h-10 border-2 border-white rounded-full mx-auto mt-2 relative">
        <div className="w-1 h-2 bg-white rounded-full absolute left-1/2 -translate-x-1/2 top-2 animate-bounce"></div>
      </div>
    </div>
  )
}

export default ScrollPrompt