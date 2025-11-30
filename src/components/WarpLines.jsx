// src/components/WarpLines.jsx
import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function WarpLines({
  warpIntensityRef,
  warpDirectionRef,
  cameraRef,          // main travelling camera
  count = 200,
  radius = 6,
  depth = 80,
}) {
  const groupRef = useRef();
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // random initial positions + speeds in camera-space
  const seeds = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = radius * (0.3 + 0.7 * Math.random());
      const z = -Math.random() * depth;
      const speed = 20 + Math.random() * 40;
      arr.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r, z, speed });
    }
    return arr;
  }, [count, radius, depth]);

  useFrame((_, delta) => {
    const cam = cameraRef?.current;
    if (!cam || !groupRef.current || !meshRef.current) return;

    const intensity = warpIntensityRef?.current ?? 0;

    // Follow the REAL camera
    groupRef.current.position.copy(cam.position);
    groupRef.current.quaternion.copy(cam.quaternion);

    // Force this group to render last, over fade plane & scene
    groupRef.current.traverse((obj) => {
      obj.renderOrder = 9999;
    });

    groupRef.current.visible = intensity > 0.01;
    if (intensity <= 0.01) return;

    const mat = meshRef.current.material;
    mat.opacity = 0.2 + 0.8 * intensity;

    const dir = warpDirectionRef?.current ?? 1;

	for (let i = 0; i < count; i++) {
	  const s = seeds[i];

	  // dir >= 0  → streaks fly AWAY from camera (zoom OUT)
	  // dir < 0   → streaks fly TOWARD camera (zoom IN)
	  if (dir >= 0) {
		s.z -= s.speed * delta * (0.3 + 1.7 * intensity);
		if (s.z < -depth) {
		  s.z = 0;            // respawn near camera
		}
	  } else {
		s.z += s.speed * delta * (0.3 + 1.7 * intensity);
		if (s.z > 0) {
		  s.z = -depth;       // respawn far away in front
		}
	  }

	  dummy.position.set(s.x, s.y, s.z);
	  const stretch = 4 + 16 * intensity;
	  dummy.scale.set(1, 1, stretch);
	  dummy.updateMatrix();
	  meshRef.current.setMatrixAt(i, dummy.matrix);
	}
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[
          new THREE.BoxGeometry(0.05, 0.05, 1),
          undefined,
          count,
        ]}
      >
        <meshBasicMaterial
          color={0xffffff}
          transparent
          depthWrite={false}
          depthTest={false}              // <--- ignore depth so it draws over fade plane
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
    </group>
  );
}