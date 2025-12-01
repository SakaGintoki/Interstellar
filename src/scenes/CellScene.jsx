import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Float,
  OrbitControls,
  MeshDistortMaterial,
} from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

// --- CONFIG: Colors and tunables (easy to tweak) ---
const COLORS = {
  membrane: '#a4d8fa',
  nucleus: '#ff5e6c',
  nucleolus: '#8a2be2',
  golgi: '#bf8bff',
  mitochondria: '#f0d676',
  vesicle: '#88eebb',
  cytoplasm: '#ffffff'
}
const PARAMS = {
  membrane: { radius: 4.2, segments: 64, distort: 0.32, speed: 1.4, opacity: 0.42 },
  nucleus: { radius: 1.4, segments: 32 },
  sparkles: { count: 400, scale: 3.8, size: 3 },
  mitochondriaCount: 5
}

// --- Utility: precreate sphere geometry to reuse ---
function useSharedSphere(radius = 1, segments = 32) {
  return useMemo(() => new THREE.SphereGeometry(radius, segments, segments), [radius, segments])
}

// --- 1) Cell membrane: MeshDistortMaterial + single sphere, memoized geometry & material ref for animation ---
const CellMembrane = React.memo(() => {
  const geom = useSharedSphere(PARAMS.membrane.radius, PARAMS.membrane.segments)
  const materialRef = useRef(null)

  // subtle vertex-based animation through material properties (MeshDistort handles GPU distortion)
  useFrame((state, dt) => {
    if (materialRef.current) {
      // gently vary distort to avoid static look
      materialRef.current.distort = PARAMS.membrane.distort + Math.sin(state.clock.elapsedTime * 0.7) * 0.02
    }
  })

  return (
    <mesh geometry={geom} renderOrder={0}>
      <MeshDistortMaterial
        ref={materialRef}
        color={COLORS.membrane}
        roughness={0.2}
        metalness={0.1}
        transmission={0.62}
        thickness={2.4}
        distort={PARAMS.membrane.distort}
        speed={PARAMS.membrane.speed}
        transparent
        opacity={PARAMS.membrane.opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
})

// --- 2) Nucleus: layered spheres for bloom + inner nucleolus with wireframe hint ---
const Nucleus = React.memo(() => {
  const outerGeom = useSharedSphere(1.4, 32)
  const innerGeom = useSharedSphere(0.6, 24)

  return (
    <group>
      <Float speed={0.6} rotationIntensity={0.1} floatIntensity={0.05}>
        <mesh geometry={outerGeom}>
          <meshStandardMaterial
            color={COLORS.nucleus}
            emissive={COLORS.nucleus}
            emissiveIntensity={0.55}
            roughness={0.7}
            transparent
            opacity={0.92}
          />
        </mesh>
        <mesh geometry={innerGeom} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#5e0000"
            emissive="#ff0000"
            emissiveIntensity={1.2}
            roughness={1}
            wireframe
          />
        </mesh>
      </Float>
    </group>
  )
})

// --- 3) Golgi: stacked flattened tori inside a Float wrapper, geometry memoized ---
const GolgiComplex = ({ position = [0, 0, 0], rotation = [0, 0, 0], stack = 5 }) => {
  const torusGeometries = useMemo(() => {
    return Array.from({ length: stack }).map((_, i) => (
      new THREE.TorusGeometry(0.8 - i * 0.09, 0.1, 12, 32)
    ))
  }, [stack])

  return (
    <group position={position} rotation={rotation}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.45}>
        {torusGeometries.map((g, i) => (
          <mesh key={i} geometry={g} position={[0, (i - stack / 2) * 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial
              color={COLORS.golgi}
              emissive={COLORS.golgi}
              emissiveIntensity={0.45}
              roughness={0.45}
            />
          </mesh>
        ))}
        <mesh position={[0.8, 0.5, 0]}>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshStandardMaterial color={COLORS.golgi} emissive={COLORS.golgi} />
        </mesh>
      </Float>
    </group>
  )
}

// --- 4) Mitochondria: simple capsule mesh, grouped and slightly animated, geometry memoized ---
const Mitochondrion = ({ pos = [0, 0, 0], rot = [0, 0, 0], scale = 1 }) => {
  // capsule geometry created in JSX for readability (capsule is available in recent three versions)
  const innerRef = useRef(null)
  useFrame((state) => {
    if (innerRef.current) innerRef.current.rotation.z += Math.sin(state.clock.elapsedTime * 0.3) * 0.002
  })

  return (
    <group position={pos} rotation={rot} scale={scale}>
      <Float speed={1.2} rotationIntensity={0.6} floatIntensity={0.25}>
        <mesh>
          <capsuleGeometry args={[0.25, 0.6, 4, 16]} />
          <meshStandardMaterial
            color={COLORS.mitochondria}
            roughness={0.32}
            emissive={COLORS.mitochondria}
            emissiveIntensity={0.18}
          />
        </mesh>

        <mesh ref={innerRef} scale={[0.82, 0.82, 0.82]}>
          <capsuleGeometry args={[0.2, 0.5, 4, 8]} />
          <meshBasicMaterial color="#d4af37" wireframe />
        </mesh>
      </Float>
    </group>
  )
}

// --- 5) Sparkles / cytoplasm points: memoized buffer and subtle per-frame rotation ---
const Sparkles = ({ count = PARAMS.sparkles.count, scale = PARAMS.sparkles.scale, size = PARAMS.sparkles.size, color = '#ccffdd' }) => {
  const points = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = Math.random() * scale
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)
      arr[i * 3] = x
      arr[i * 3 + 1] = y
      arr[i * 3 + 2] = z
    }
    return arr
  }, [count, scale])

  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.02
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={points.length / 3} array={points} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={size * 0.016} color={color} transparent opacity={0.65} sizeAttenuation />
    </points>
  )
}

// --- Scene: assemble, lights, postprocessing, controls ---
export default function CellScene() {
  // mitochondria positions for fidelity to your layout
  const mitoTransforms = useMemo(() => [
    { pos: [2, 1, 1], rot: [1, 1, 0] },
    { pos: [2.5, -1, 0], rot: [0.5, 2, 0] },
    { pos: [1, -2.5, 1], rot: [2, 0, 1] },
    { pos: [-1, -2, -1], rot: [0, 0.5, 1] },
    { pos: [-2, 0.5, 2], rot: [1, 0, 0] }
  ], [])

  return (
    <>
      <color attach="background" args={['#000000']} />
      <hemisphereLight skyColor={0x444466} groundColor={0x222222} intensity={0.25} />
      <ambientLight intensity={0.15} />
      <pointLight position={[10, 10, 10]} intensity={1.3} />
      <spotLight position={[-10, 0, -5]} intensity={4.2} angle={0.5} penumbra={1} color="#44aaff" />
      <spotLight position={[0, -10, 0]} intensity={1.8} color="#ff0055" />

      <group>
        <CellMembrane />
        <Nucleus />

        <GolgiComplex position={[-2, 1.5, 0.5]} rotation={[0.5, 0.5, 0]} />
        <GolgiComplex position={[-1.5, 2.2, -0.5]} rotation={[0.2, 0.1, 0]} />

        {mitoTransforms.map((m, i) => (
          <Mitochondrion key={i} pos={m.pos} rot={m.rot} />
        ))}

        <mesh position={[1.5, 2, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color={COLORS.vesicle} emissive={COLORS.vesicle} emissiveIntensity={0.5} />
        </mesh>

        <mesh position={[-1, -1.5, 2]}>
          <sphereGeometry args={[0.4, 18, 18]} />
          <meshStandardMaterial color="#4488ff" emissive="#4488ff" emissiveIntensity={0.5} />
        </mesh>

        <Sparkles count={400} scale={3.8} size={3} color="#ccffdd" />
      </group>

      <EffectComposer disableNormalPass>
        <Bloom intensity={1.4} luminanceThreshold={0.18} mipmapBlur radius={0.6} />
        <Vignette eskil={false} offset={0.1} darkness={1.05} />
      </EffectComposer>

      <OrbitControls autoRotate autoRotateSpeed={0.45} enableZoom enablePan />
    </>
  )
}
