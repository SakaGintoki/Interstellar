import React, { useRef, useMemo } from "react";

import { useFrame } from "@react-three/fiber";

import * as THREE from "three";

import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
} from "@react-three/postprocessing";

import { BlendFunction } from "postprocessing";

import vertexShader from "../shaders/universe/vertex.glsl";

import fragmentShader from "../shaders/universe/fragment.glsl";

// Membuat tekstur bintang yang lebih halus (Soft Glow)

const getStarTexture = () => {
  const canvas = document.createElement("canvas");

  canvas.width = 32;
  canvas.height = 32;

  const ctx = canvas.getContext("2d");

  const center = 16;

  const gradient = ctx.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    16
  );

  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");

  gradient.addColorStop(0.2, "rgba(230, 240, 255, 0.8)");

  gradient.addColorStop(0.5, "rgba(50, 100, 255, 0.2)");

  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = gradient;

  ctx.fillRect(0, 0, 32, 32);

  return new THREE.CanvasTexture(canvas);
};

const StarField = ({ count, size, speed, spread }) => {
  const mesh = useRef();

  const texture = useMemo(() => getStarTexture(), []);

  const particles = useMemo(() => {
    const pos = new Float32Array(count * 3);

    const cols = new Float32Array(count * 3);

    const scales = new Float32Array(count);

    const colorChoices = [
      new THREE.Color("#ffddaa"), // Warm white

      new THREE.Color("#ffffff"), // Pure white

      new THREE.Color("#aaddff"), // Blueish

      new THREE.Color("#ffaaaa"), // Reddish giant
    ];

    for (let i = 0; i < count; i++) {
      // Distribusi Volume (Spherical Volume)

      // Menggunakan Math.cbrt agar distribusi merata di dalam bola, tidak menumpuk di tengah

      const r = spread * Math.cbrt(Math.random());

      const theta = Math.random() * Math.PI * 2;

      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);

      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);

      pos[i * 3 + 2] = r * Math.cos(phi);

      // Warna acak dari palette

      const color =
        colorChoices[Math.floor(Math.random() * colorChoices.length)];

      cols[i * 3] = color.r;

      cols[i * 3 + 1] = color.g;

      cols[i * 3 + 2] = color.b;

      scales[i] = 0.5 + Math.random() * 0.5;
    }

    return { pos, cols, scales };
  }, [count, spread]);

  useFrame((state) => {
    if (mesh.current) {
      // Rotasi sangat lambat untuk background

      mesh.current.rotation.y = state.clock.getElapsedTime() * speed;

      // Sedikit goyangan (wobble) agar terasa hidup

      mesh.current.rotation.z =
        Math.sin(state.clock.getElapsedTime() * 0.1) * 0.05;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.pos}
          itemSize={3}
        />

        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.cols}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        size={size}
        map={texture}
        vertexColors
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
      />
    </points>
  );
};

const UniverseScene = () => {
  const meshRef = useRef();

  // Warna diperbaiki untuk kontras yang lebih tinggi

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },

      uColorStart: { value: new THREE.Color("#050011") }, // Hampir hitam/ungu tua

      uColorMid: { value: new THREE.Color("#220033") }, // Ungu tengah

      uColorEnd: { value: new THREE.Color("#0066ff") }, // Biru elektrik
    }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value =
        state.clock.getElapsedTime();

      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <>
      <group>
        {/* BACKGROUND NEBULA */}

        <mesh ref={meshRef} scale={[1.5, 1.5, 1.5]}>
          <sphereGeometry args={[40, 64, 64]} />

          <shaderMaterial
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            side={THREE.BackSide} // Render bagian dalam bola
            transparent={true}
            depthWrite={false}
            blending={THREE.AdditiveBlending} // Membuat nebula bercahaya
          />
        </mesh>

        {/* LAYER 1: Bintang Jauh (Dust) */}

        <StarField count={5000} size={0.15} speed={0.002} spread={60} />

        {/* LAYER 2: Bintang Sedang */}

        <StarField count={1000} size={0.4} speed={0.005} spread={40} />

        {/* LAYER 3: Bintang Dekat (Bright) */}

        <StarField count={150} size={0.9} speed={0.01} spread={30} />
      </group>

      {/* POST PROCESSING CINEMATIC */}

      <EffectComposer disableNormalPass>
        {/* Noise memberikan tekstur film grain agar tidak terlalu terlihat 'plastik' */}

        <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />

        <Bloom
          luminanceThreshold={0.15}
          mipMapBlur
          intensity={1.5}
          radius={0.7}
          levels={8}
        />

        <Vignette eskil={false} offset={0.3} darkness={0.6} />
      </EffectComposer>
    </>
  );
};

export default UniverseScene;
