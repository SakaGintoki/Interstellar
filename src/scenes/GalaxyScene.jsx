import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
// Sesuaikan path import shader Anda
import vertexShader from "../shaders/galaxy/vertex.glsl";
import fragmentShader from "../shaders/galaxy/fragment.glsl";

const PARTICLE_COUNT = 700000; // Ditingkatkan untuk kepadatan ala Milky Way
const BRANCHES = 5; // Milky Way memiliki lengan spiral yang kompleks
const RADIUS = 85; // Lebih luas
const SPIN = 1;
const RANDOMNESS = 0.3;
const RANDOMNESS_POWER = 4; // Kekuatan pemusatan partikel ke lengan

function GalaxyScene() {
  const pointsRef = useRef();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 40.0 * (window.devicePixelRatio || 1.0) },
    }),
    []
  );

  const { positions, colors, scales, randomness } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const scales = new Float32Array(PARTICLE_COUNT * 1);
    const randomness = new Float32Array(PARTICLE_COUNT * 3);

    // --- WARNA MILKY WAY ---
    // Bagian Dalam: Emas Hangat / Putih Kekuningan (Bintang Tua)
    const colorInside = new THREE.Color("#f8c885"); 
    // Bagian Luar: Biru Laut / Ungu Gelap (Bintang Muda & Gas)
    const colorOutside = new THREE.Color("#5078f2"); 

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Geometri Spiral
      const radius = Math.random() * RADIUS;
      const spinAngle = radius * SPIN;
      const branchAngle = ((i % BRANCHES) / BRANCHES) * Math.PI * 2;

      // Randomness untuk membuat "Debu" di sekitar lengan
      const randomX = Math.pow(Math.random(), RANDOMNESS_POWER) * (Math.random() < 0.5 ? 1 : -1) * RANDOMNESS * radius;
      const randomY = Math.pow(Math.random(), RANDOMNESS_POWER) * (Math.random() < 0.5 ? 1 : -1) * RANDOMNESS * radius;
      const randomZ = Math.pow(Math.random(), RANDOMNESS_POWER) * (Math.random() < 0.5 ? 1 : -1) * RANDOMNESS * radius;

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY * 0.5; // Pipihkan sumbu Y agar seperti piringan galaksi
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      // Simpan nilai random untuk dipakai di shader (vertex animation)
      randomness[i3] = randomX;
      randomness[i3 + 1] = randomY;
      randomness[i3 + 2] = randomZ;

      // --- PEWARNAAN ---
      // Campur warna berdasarkan radius, tapi tambahkan sedikit variasi acak
      // agar tidak terlihat seperti gradasi linear yang membosankan
      const mixedColor = colorInside.clone().lerp(colorOutside, radius / RADIUS);
      
      // Tambahkan sedikit noise warna random untuk variasi bintang
      mixedColor.r += (Math.random() - 0.5) * 0.1;
      mixedColor.b += (Math.random() - 0.5) * 0.1;

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      // --- SKALA ---
      // Distribusi ukuran: Banyak debu kecil, sedikit bintang besar
      // Math.pow membuat distribusi tidak linear (lebih banyak yang kecil)
      scales[i] = Math.pow(Math.random(), 2.0) * Math.random(); 
    }

    return { positions, colors, scales, randomness };
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
        // Update waktu shader
        pointsRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
        // Rotasi lambat container (untuk view)
        pointsRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    // Rotasi awal sedikit miring agar terlihat megah
    <points ref={pointsRef} rotation={[Math.PI * 0.15, 0, 0]}>
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
        <bufferAttribute
          attach="attributes-aScale"
          count={PARTICLE_COUNT}
          array={scales}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aRandomness"
          count={PARTICLE_COUNT}
          array={randomness}
          itemSize={3}
        />
      </bufferGeometry>
      {/* depthWrite={false} sangat penting agar partikel transparan tidak saling menutupi secara kasar.
         AdditiveBlending membuat tumpukan partikel menjadi semakin terang (efek cahaya).
      */}
      <shaderMaterial
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors={true}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </points>
  );
}

export default GalaxyScene;