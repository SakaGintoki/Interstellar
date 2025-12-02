import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function WarpLines({
  warpIntensityRef,
  warpDirectionRef,
  cameraRef,
  count = 400, // Menambah jumlah garis agar lebih padat
  radius = 8,
  depth = 100,
}) {
  const groupRef = useRef();
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate seeds sekali saja
  const seeds = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      // Distribusi radius yang lebih natural (sedikit kosong di tengah)
      const r = radius * (0.5 + Math.random()); 
      const z = -Math.random() * depth;
      const speed = 30 + Math.random() * 50; // Kecepatan variatif
      arr.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r, z, speed });
    }
    return arr;
  }, [count, radius, depth]);

  useFrame((state, delta) => {
    const cam = cameraRef?.current;
    if (!cam || !groupRef.current || !meshRef.current) return;

    const intensity = warpIntensityRef?.current ?? 0;
    
    // Visibility check untuk performa
    if (intensity < 0.001) {
       groupRef.current.visible = false;
       return;
    }
    groupRef.current.visible = true;

    // Sinkronisasi posisi group dengan kamera
    groupRef.current.position.copy(cam.position);
    groupRef.current.quaternion.copy(cam.quaternion);

    // Opacity dinamis berdasarkan intensitas
    const mat = meshRef.current.material;
    mat.opacity = THREE.MathUtils.lerp(0, 0.8, intensity * 1.5); // Lebih smooth
    
    // Warna bisa berubah sedikit saat kecepatan tinggi (opsional, di sini tetap putih)
    // mat.color.setHSL(0.6, 1, 0.5 + intensity * 0.5); 

    const dir = warpDirectionRef?.current ?? 1; // 1 = zoom out, -1 = zoom in

    for (let i = 0; i < count; i++) {
      const s = seeds[i];

      // Faktor kecepatan berdasarkan delta time dan intensitas
      const moveFactor = s.speed * delta * (0.5 + 3.0 * intensity);

      if (dir >= 0) {
        // Mundur (Zoom out effect)
        s.z -= moveFactor;
        if (s.z < -depth) s.z = 0;
      } else {
        // Maju (Zoom in effect)
        s.z += moveFactor;
        if (s.z > 0) s.z = -depth;
      }

      dummy.position.set(s.x, s.y, s.z);
      
      // Peregangan garis (Streaking) semakin cepat semakin panjang
      const stretch = 2 + 30 * intensity; 
      dummy.scale.set(1, 1, stretch);
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    
    // Agar selalu di render di atas fade plane
    meshRef.current.renderOrder = 9999;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[null, null, count]}
      >
        <boxGeometry args={[0.08, 0.08, 1]} /> {/* Geometri sedikit lebih tebal */}
        <meshBasicMaterial
          color="#a5f3fc" // Warna Cyan muda (Tailwind cyan-200)
          transparent
          opacity={0}
          depthWrite={false}
          depthTest={false} // Tembus objek lain
          blending={THREE.AdditiveBlending} // Efek cahaya (glowing)
        />
      </instancedMesh>
    </group>
  );
}