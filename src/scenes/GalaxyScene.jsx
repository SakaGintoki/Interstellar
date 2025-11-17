import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import vertexShader from "../shaders/galaxy/vertex.glsl";
import fragmentShader from "../shaders/galaxy/fragment.glsl";

const PARTICLE_COUNT = 200000; // 200k particles
const BRANCHES = 5;
const RADIUS = 20;
const SPIN = 1;
const RANDOMNESS = 0.5;

function GalaxyScene() {
  const particlesRef = useRef();

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 8.0 * (window.devicePixelRatio || 1.0) },
          opacity: { value: 1.0 },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  // Generate particle positions and colors
  const [positions, colors] = useMemo(() => {
    const posArray = new Float32Array(PARTICLE_COUNT * 3);
    const colArray = new Float32Array(PARTICLE_COUNT * 3);

    const colorInside = new THREE.Color(0xff6030);
    const colorOutside = new THREE.Color(0x1b3984);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Position
      const radius = Math.random() * RADIUS;
      const spinAngle = radius * SPIN;
      const branchAngle = ((i % BRANCHES) / BRANCHES) * Math.PI * 2;

      const randomX =
        ((Math.random() - 0.5) ** 3 * RANDOMNESS * (RADIUS - radius)) / RADIUS;
      const randomY =
        ((Math.random() - 0.5) ** 3 * RANDOMNESS * (RADIUS - radius)) / RADIUS;
      const randomZ =
        ((Math.random() - 0.5) ** 3 * RANDOMNESS * (RADIUS - radius)) / RADIUS;

      posArray[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      posArray[i3 + 1] = randomY;
      posArray[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      // Color
      const mixedColor = colorInside
        .clone()
        .lerp(colorOutside, radius / RADIUS);
      colArray[i3 + 0] = mixedColor.r;
      colArray[i3 + 1] = mixedColor.g;
      colArray[i3 + 2] = mixedColor.b;
    }

    return [posArray, colArray];
  });

  useFrame((state, delta) => {
    material.uniforms.uTime.value += delta * 0.1;
    particlesRef.current.rotation.y += delta * 0.02;
  });

  return (
    <points ref={particlesRef} rotation={[Math.PI * 0.1, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_COUNT}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <primitive attach="material" object={material} />
    </points>
  );
}

export default GalaxyScene;
