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

function SceneManager() {
  const currentScale = useSceneStore((state) => state.currentScale)

  return (
    <Suspense fallback={null}>
      {currentScale === 'atom' && <AtomScene />}
      {currentScale === 'dna' && <DnaScene />}
      {currentScale === 'cell' && <CellScene />}
      {currentScale === 'earth' && <EarthScene />}
      {currentScale === 'solar' && <SolarScene />}
      {currentScale === 'galaxy' && <GalaxyScene />}
      {currentScale === 'universe' && <UniverseScene />}
    </Suspense>
  )
}

export default SceneManager