import React, { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'
import * as THREE from 'three'
import vertexShader from '../shaders/glow/vertex.glsl'
import fragmentShader from '../shaders/glow/fragment.glsl'

const MITOCHONDRIA_COUNT = 50

// Soft volumetric glow “outside” the cell
function AmbientCellGlow({
  color = '#001814',
  intensity = 0.7,
  radius = 1000,
}) {
  return (
    <mesh scale={radius}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        side={THREE.BackSide}
        color={color}
        emissive={color}
        emissiveIntensity={intensity}
        transparent
        opacity={0.9}
        toneMapped={false}
      />
    </mesh>
  )
}

// Cytoplasm-like tiny particles inside the cell
function CytoplasmParticles({ count = 250, radius = 4 }) {
  const pointsRef = useRef()

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = radius * Math.cbrt(Math.random()) // bias a bit toward center
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)

      const idx = i * 3
      arr[idx] = x
      arr[idx + 1] = y
      arr[idx + 2] = z
    }
    return arr
  }, [count, radius])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const t = clock.getElapsedTime()
    pointsRef.current.rotation.y = t * 0.08
    pointsRef.current.rotation.x = Math.sin(t * 0.25) * 0.12
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#88ffcc"
        transparent
        opacity={0.55}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

function CellScene() {
  const cellRef = useRef()
  const mitochondriaRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Glow shader for cell membrane
  const membraneMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uGlowColor: { value: new THREE.Color(0x00ffff) }, // Cyan glow
          uGlowPower: { value: 2.0 },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.BackSide,
      }),
    []
  )

  // Position mitochondria instances randomly within the cell
  useEffect(() => {
    if (!mitochondriaRef.current) return
    for (let i = 0; i < MITOCHONDRIA_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      const radius = Math.random() * 3.2 // slightly inside cell radius (4)

      dummy.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      )
      dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )
      dummy.scale.setScalar(Math.random() * 0.25 + 0.12)
      dummy.updateMatrix()
      mitochondriaRef.current.setMatrixAt(i, dummy.matrix)
    }
    mitochondriaRef.current.instanceMatrix.needsUpdate = true
  }, [dummy])

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()

    if (cellRef.current) {
      cellRef.current.rotation.y += delta * 0.05
    }
    if (mitochondriaRef.current) {
      mitochondriaRef.current.rotation.x += delta * 0.1
      mitochondriaRef.current.rotation.z += delta * 0.08
    }

    // subtle nucleus breathing
    const nucleus = cellRef.current?.getObjectByName('nucleus')
    if (nucleus) {
      const s = 1 + Math.sin(t * 1.2) * 0.05
      nucleus.scale.set(s, s, s)
    }
  })

  return (
    <group ref={cellRef}>
      {/* Ambient greenish environment */}
      <AmbientCellGlow color="#001d16" intensity={0.9} radius={35} />

      {/* Cytoplasm particles */}
      <CytoplasmParticles count={260} radius={3.8} />

      {/* Lights */}
      <ambientLight intensity={0.35} />
      <pointLight position={[5, 5, 8]} intensity={1.2} color={0xaaffdd} />
      <pointLight position={[-6, -3, -6]} intensity={0.8} color={0x66ffbb} />

      {/* Cell Membrane (Outer) */}
      <Sphere args={[4, 64, 64]}>
        <meshStandardMaterial
          color={0x0088aa}
          transparent
          opacity={0.24}
          roughness={0.15}
          metalness={0.1}
        />
      </Sphere>

      {/* Cell Membrane (Inner Glow) */}
      <Sphere args={[4.05, 64, 64]}>
        <shaderMaterial attach="material" args={[membraneMaterial]} />
      </Sphere>

      {/* Nucleus */}
      <Sphere name="nucleus" position={[0, 0, 0]} args={[1.2, 32, 32]}>
        <meshStandardMaterial
          color={0xaa00ff}
          roughness={0.4}
          emissive={0xaa00ff}
          emissiveIntensity={0.5}
        />
      </Sphere>

      {/* Mitochondria */}
      <instancedMesh
        ref={mitochondriaRef}
        args={[undefined, undefined, MITOCHONDRIA_COUNT]}
      >
        <capsuleGeometry args={[0.2, 0.4, 16, 32]} />
        <meshStandardMaterial color={0xff8c00} roughness={0.7} />
      </instancedMesh>
    </group>
  )
}

export default CellScene