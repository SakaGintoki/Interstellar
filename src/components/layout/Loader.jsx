import React from 'react'
import { Html, useProgress } from '@react-three/drei'

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="flex flex-col items-center">
        <span className="text-white text-lg">{Math.round(progress)}% loaded</span>
        <div className="w-40 h-1 bg-gray-700 rounded-full overflow-hidden mt-2">
          <div
            className="h-1 bg-accent-blue rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Html>
  )
}

export default Loader