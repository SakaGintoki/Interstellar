import React, { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'
import * as THREE from 'three'
import vertexShader from '../shaders/glow/vertex.glsl'
import fragmentShader from '../shaders/glow/fragment.glsl'

const MITOCHONDRIA_COUNT = 50

function CellScene() {
  const cellRef = useRef()
  const mitochondriaRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Re-use the glow shader for the cell membrane
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

  // Position mitochondria instances randomly within the cell (once on mount)
  useEffect(() => {
    if (!mitochondriaRef.current) return
    for (let i = 0; i < MITOCHONDRIA_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      const radius = Math.random() * 3.5 // Radius less than cell (4)

      dummy.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      )
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      dummy.scale.setScalar(Math.random() * 0.2 + 0.1)
      dummy.updateMatrix()
      mitochondriaRef.current.setMatrixAt(i, dummy.matrix)
    }
    mitochondriaRef.current.instanceMatrix.needsUpdate = true
  }, [dummy])

  useFrame((state, delta) => {
    if (cellRef.current) {
      cellRef.current.rotation.y += delta * 0.05
    }
    if (mitochondriaRef.current) {
      mitochondriaRef.current.rotation.x += delta * 0.1
      mitochondriaRef.current.rotation.z += delta * 0.08
    }
  })

  return (
    <group ref={cellRef}>
      {/* Cell Membrane (Outer) */}
      <Sphere args={[4, 64, 64]}>
        <meshStandardMaterial color={0x0088aa} transparent opacity={0.2} roughness={0.1} />
      </Sphere>

      {/* Cell Membrane (Inner Glow) */}
      <Sphere args={[4.05, 64, 64]}>
        <shaderMaterial attach="material" args={[membraneMaterial]} />
      </Sphere>

      {/* Nucleus */}
      <Sphere position={[0, 0, 0]} args={[1.2, 32, 32]}>
        <meshStandardMaterial
          color={0xaa00ff}
          roughness={0.5}
          emissive={0xaa00ff}
          emissiveIntensity={0.3}
        />
      </Sphere>

      {/* Mitochondria */}
      <instancedMesh ref={mitochondriaRef} args={[MITOCHONDRIA_COUNT, undefined, undefined]}>
        <capsuleGeometry args={[0.2, 0.4, 16, 32]} />
        <meshStandardMaterial color={0xff8c00} roughness={0.7} />
      </instancedMesh>
    </group>
  )
}

export default CellScene