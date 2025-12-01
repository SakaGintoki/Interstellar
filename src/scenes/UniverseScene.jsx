import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'; 
import vertexShader from '../shaders/universe/vertex.glsl';
import fragmentShader from '../shaders/universe/fragment.glsl';

const getStarTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 32; canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); // Inti putih
  gradient.addColorStop(0.4, 'rgba(200, 220, 255, 0.5)'); // Glow biru muda
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(canvas);
};

// 2.  Bintang 
const StarField = ({ count, size, speed }) => {
  const mesh = useRef();
  const texture = useMemo(() => getStarTexture(), []);
  
  const particles = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const scales = new Float32Array(count); // Variasi ukuran individual
    
    for (let i = 0; i < count; i++) {
      // Posisi menyebar di sphere radius 20-50
      const r = 20 + Math.random() * 30; 
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i*3+2] = r * Math.cos(phi);

      const colorType = Math.random();
      let color = new THREE.Color();
      if(colorType > 0.9) color.set('#b0d7ff'); 
      else if(colorType > 0.6) color.set('#ffffff'); 
      else if(colorType > 0.3) color.set('#ffdca3'); 
      else color.set('#ff8c8c'); 

      cols[i*3] = color.r;
      cols[i*3+1] = color.g;
      cols[i*3+2] = color.b;
      
      scales[i] = Math.random();
    }
    return { pos, cols, scales };
  }, [count]);

  useFrame((state) => {
    if(mesh.current) {
      mesh.current.rotation.y = state.clock.getElapsedTime() * speed;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={particles.pos} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={particles.cols} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        size={size} 
        map={texture} 
        vertexColors 
        transparent 
        opacity={0.8} 
        depthWrite={false} 
        blending={THREE.AdditiveBlending} 
        sizeAttenuation
      />
    </points>
  )
}

const UniverseScene = () => {
  const meshRef = useRef();

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColorStart: { value: new THREE.Color('#1a0033') }, 
    uColorEnd: { value: new THREE.Color('#0066ff') },   
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.01;
    }
  });

  return (
    <>
      <group>
        {/* BACKGROUND NEBULA (Volumetric Look) */}
        <mesh ref={meshRef} scale={[1, 1, 1]}>
          <sphereGeometry args={[50, 64, 64]} />
          <shaderMaterial
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            side={THREE.BackSide}
            transparent={true}
            depthWrite={false}
          />
        </mesh>

        {/* LAYER 1: Bintang Latar (Kecil, Banyak, Lambat) */}
        <StarField count={2000} size={0.3} speed={0.005} />

        {/* LAYER 2: Bintang Dekat (Besar, Sedikit, Lebih Cepat) */}
        <StarField count={300} size={0.8} speed={0.01} />
        
        {/* Pencahayaan Scene */}
        <ambientLight intensity={0.1} />
      </group>

      {/* POST PROCESSING */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.2} 
          mipMapBlur 
          intensity={1.2}
          radius={0.6} 
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

export default UniverseScene;