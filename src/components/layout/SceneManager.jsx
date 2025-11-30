import React, { Suspense, lazy } from 'react'
import { useSceneStore } from '../../hooks/useSceneStore'

// Lazy load all scenes for code splitting and performance
const AtomScene = lazy(() => import('../../scenes/AtomScene'))
const DnaScene = lazy(() => import('../../scenes/DnaScene'))
const CellScene = lazy(() => import('../../scenes/CellScene'))
const EarthScene = lazy(() => import('../../scenes/EarthScene'))
const SolarScene = lazy(() => import('../../scenes/SolarScene'))
const GalaxyScene = lazy(() => import('../../scenes/GalaxyScene'))
const UniverseScene = lazy(() => import('../../scenes/UniverseScene'))
import { StarField } from "../visual/StarField"; // adjust path as needed

function SceneManager() {
  const currentScale = useSceneStore((state) => state.currentScale)

  return (
    <Suspense fallback={null}>
      {currentScale === 'atom' && <AtomScene />}
      {currentScale === 'dna' && <DnaScene />}
      {currentScale === 'cell' && <CellScene />}
      {currentScale === 'earth' && (
        <>
          {/* Starfield for solar scale */}
          <StarField
            count={500}
            radius={400}
            size={8}
            fade={0.2}
          />
          <EarthScene />
        </>
      )}
      {currentScale === "solar" && (
        <>
          {/* Starfield for solar scale */}
          <StarField
            count={1000}
            radius={800}
            size={10}
            fade={0.3}
          />
          <SolarScene />
        </>
      )}

      {currentScale === "galaxy" && (
        <>
          {/* Denser / larger for galaxy */}
          <StarField
            count={2000}
            radius={1500}
            size={12}
            fade={0.4}
          />
          <GalaxyScene />
        </>
      )}

      {currentScale === "universe" && (
        <>
          {/* Very wide, more subtle stars */}
          <StarField
            count={3000}
            radius={2500}
            size={9}
            fade={0.5}
          />
          <UniverseScene />
        </>
      )}
    </Suspense>
  )
}

export default SceneManager