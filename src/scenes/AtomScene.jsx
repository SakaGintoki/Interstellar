import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
// --- BARU --- (Import Trail dan Stars)
import { Sphere, Trail, Stars } from "@react-three/drei";
import * as THREE from "three";
// --- BARU --- (Import untuk Efek Bloom)
import { EffectComposer, Bloom } from "@react-three/postprocessing";

// --- KONSTANTA ---
const ORBIT_RADIUS = 3.5; // Sedikit lebih besar
const ELECTRON_SPEED_1 = 1.5;
const ELECTRON_SPEED_2 = 1.8;
const ELECTRON_SPEED_3 = 2.1;

// --- SHADER (Sama seperti sebelumnya, tidak berubah) ---
const glowVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewDirection;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vViewDirection = normalize(cameraPosition - worldPosition.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const glowFragmentShader = `
  precision highp float;
  uniform vec3 uGlowColor;
  uniform float uGlowPower;
  varying vec3 vNormal;
  varying vec3 vViewDirection;
  void main() {
    float fresnel = dot(vNormal, vViewDirection) + 1.0;
    fresnel = pow(fresnel, uGlowPower);
    gl_FragColor = vec4(uGlowColor * fresnel, fresnel * 0.5);
  }
`;
// --- AKHIR SHADER ---


// --- KOMPONEN UTAMA ---
function AtomScene() {
  const nucleusRef = useRef();
  
  // --- BARU --- (Ref terpisah untuk tiap elektron)
  const electron1Ref = useRef();
  const electron2Ref = useRef();
  const electron3Ref = useRef();

  // Material untuk 'Glow' di sekitar inti (Tidak berubah)
  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uGlowColor: { value: new THREE.Color(0x00aaff) }, 
          uGlowPower: { value: 3.5 },
          opacity: { value: 1.0 },
        },
        vertexShader: glowVertexShader,
        fragmentShader: glowFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.BackSide,
      }),
    []
  );

  // Animasi setiap frame
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    
    // Rotasi Inti (Tidak berubah)
    if (nucleusRef.current) {
      nucleusRef.current.rotation.y += delta * 0.2;
    }

    // --- BERUBAH --- (Animasi 3 elektron secara terpisah)
    if (electron1Ref.current) {
      electron1Ref.current.position.set(
        Math.cos(t * ELECTRON_SPEED_1) * ORBIT_RADIUS,
        0,
        Math.sin(t * ELECTRON_SPEED_1) * ORBIT_RADIUS
      );
    }
    if (electron2Ref.current) {
      electron2Ref.current.position.set(
        0,
        Math.cos(t * ELECTRON_SPEED_2) * ORBIT_RADIUS,
        Math.sin(t * ELECTRON_SPEED_2) * ORBIT_RADIUS
      );
    }
    if (electron3Ref.current) {
      electron3Ref.current.position.set(
        Math.cos(t * ELECTRON_SPEED_3) * ORBIT_RADIUS,
        Math.sin(t * ELECTRON_SPEED_3) * ORBIT_RADIUS,
        0
      );
    }
  });

  return (
    <>
      {/* --- PENCAHAYAAN (Sedikit diubah) --- */}
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 0]} intensity={1.5} color={0xffffff} />

      {/* --- INTI ATOM (NUCLEUS) --- */}
      <Sphere ref={nucleusRef} args={[0.5, 32, 32]} position={[0, 0, 0]}>
        {/* Naikkan emissiveIntensity agar mekar/bloom */}
        <meshStandardMaterial color={0xffff00} emissive={0xffff00} emissiveIntensity={3} />
      </Sphere>

      {/* --- GLOW INTI (Tidak berubah) --- */}
      <Sphere args={[0.55, 32, 32]} position={[0, 0, 0]}>
        <primitive attach="material" object={shaderMaterial} />
      </Sphere>

      {/* --- BERUBAH --- (Ganti instancedMesh dengan 3 mesh + Trail) */}
      
      {/* Elektron 1 */}
      <mesh ref={electron1Ref}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color={0x00ffff}
          emissive={0x00ffff}
          emissiveIntensity={5} // Naikkan intensity untuk bloom
        />
        {/* Tambahkan jejak/trail */}
        <Trail
          width={0.2} // Lebar jejak
          length={6}  // Panjang jejak
          color={new THREE.Color(0x00ffff)}
          attenuation={(t) => t * t} // Pudar di ujung
        />
      </mesh>

      {/* Elektron 2 */}
      <mesh ref={electron2Ref}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={0x00ffff} emissive={0x00ffff} emissiveIntensity={5} />
        <Trail width={0.2} length={6} color={new THREE.Color(0x00ffff)} attenuation={(t) => t * t} />
      </mesh>

      {/* Elektron 3 */}
      <mesh ref={electron3Ref}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={0x00ffff} emissive={0x00ffff} emissiveIntensity={5} />
        <Trail width={0.2} length={6} color={new THREE.Color(0x00ffff)} attenuation={(t) => t * t} />
      </mesh>
      
      {/* --- HAPUS --- (Semua <Ring> jalur orbit dihapus) */}

      {/* --- BARU --- (Tambahkan Efek Post-Processing Bloom) */}
      <EffectComposer>
        <Bloom
          intensity={1.0} // Intensitas bloom
          luminanceThreshold={0.1} // Hanya objek terang (emissive) yang bloom
          luminanceSmoothing={0.025}
          mipmapBlur={true} // Kualitas lebih baik
        />
      </EffectComposer>
    </>
  );
}

export default AtomScene;