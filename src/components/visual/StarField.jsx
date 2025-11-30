// src/components/visual/StarField.jsx
import React, { useMemo, useRef } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function StarField({
  count = 800,
  radius = 600,
  size = 8,
  fade = 0.2, // 0–1: how many stars are closer vs far
  color = "#ffffff",
}) {
  const texture = useLoader(
    THREE.TextureLoader,
    "/textures/star_particle.png" // your sprite
  );

  const materialRef = useRef();
  const baseSize = useRef(size);
  const timeOffset = useRef(Math.random() * 1000); // so multiple fields don't sync perfectly

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);

      const r =
        radius *
        Math.pow(Math.random(), fade > 0 ? fade : 1.0);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const idx = i * 3;
      pos[idx] = x;
      pos[idx + 1] = y;
      pos[idx + 2] = z;
    }
    return pos;
  }, [count, radius, fade]);

  // Twinkling: small, smooth variations in size + opacity over time
  useFrame((state, delta) => {
    if (!materialRef.current) return;
    timeOffset.current += delta;

    const t = timeOffset.current;

    // very subtle so it doesn't look like pulsing blobs
    const sizeMod = 1 + 0.12 * Math.sin(t * 2.2);
    const opacityMod =
      0.75 + 0.25 * Math.sin(t * 1.7 + 1.234);

    materialRef.current.size = baseSize.current * sizeMod;
    materialRef.current.opacity = opacityMod;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        map={texture}
        transparent
        alphaTest={0.1}
        depthWrite={false}
        size={size}
        sizeAttenuation
        color={color}
      />
    </points>
  );
}