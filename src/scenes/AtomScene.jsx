import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Sphere,
  Trail,
  Float,
  Line,
  Stars,
  OrbitControls,
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// --- CONSTANTS & CONFIG ---
const ELECTRONS = [
  { radius: 2.5, speed: 1.5, rotation: [0, 0, 0], color: "#00ffff" }, // Orbit Datar
  { radius: 3.0, speed: 1.8, rotation: [Math.PI / 3, 0, 0], color: "#ff00ff" }, // Miring 60 derajat
  { radius: 3.5, speed: 2.1, rotation: [-Math.PI / 3, 0, 0], color: "#ffffff" }, // Miring -60 derajat
];

// --- FRESNEL GLOW SHADER (Diperbaiki agar lebih halus) ---
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
  uniform vec3 uGlowColor;
  uniform float uGlowPower;
  varying vec3 vNormal;
  varying vec3 vViewDirection;
  void main() {
    float fresnel = dot(vNormal, vViewDirection);
    fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
    fresnel = pow(fresnel, uGlowPower);
    gl_FragColor = vec4(uGlowColor, fresnel);
  }
`;

// ---------- NUCLEUS COMPONENT ----------
function Nucleus() {
  const meshRef = useRef();

  // Acak posisi proton/neutron sedikit agar terlihat seperti cluster alami
  const particles = useMemo(() => {
    const temp = [];
    // Proton (Warna Cyan)
    for (let i = 0; i < 6; i++) {
      temp.push({
        pos: [
          Math.random() * 0.3 - 0.15,
          Math.random() * 0.3 - 0.15,
          Math.random() * 0.3 - 0.15,
        ],
        color: new THREE.Color("#00aaff"),
        type: "proton",
      });
    }
    // Neutron (Warna Ungu Gelap)
    for (let i = 0; i < 7; i++) {
      temp.push({
        pos: [
          Math.random() * 0.3 - 0.15,
          Math.random() * 0.3 - 0.15,
          Math.random() * 0.3 - 0.15,
        ],
        color: new THREE.Color("#5500ff"),
        type: "neutron",
      });
    }
    return temp;
  }, []);

  const glowMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          // uGlowColor: { value: new THREE.Color("#00ffff") },
          uGlowPower: { value: 4.5 }, // Naikkan (misal 4.0 - 6.0) agar glow lebih tipis di pinggir
          uGlowPower: { value: 2.0 },
        },
        vertexShader: glowVertexShader,
        fragmentShader: glowFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.FrontSide, // Render bagian depan saja agar tidak aneh
      }),
    []
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      // Rotasi lambat nucleus
      meshRef.current.rotation.y = t * 0.2;
      meshRef.current.rotation.z = t * 0.1;

      // Detak jantung (Pulse)
      const scale = 1 + Math.sin(t * 3) * 0.05;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={meshRef}>
      {/* Inti Partikel */}
      {particles.map((p, i) => (
        <Sphere key={i} args={[0.12, 16, 16]} position={p.pos}>
          <meshStandardMaterial
            color={p.color}
            emissive={p.color}
            emissiveIntensity={4} // High intensity for Bloom
            roughness={0.1}
            metalness={0.8}
          />
        </Sphere>
      ))}

      {/* Energy Shield (Glow Shader) */}
      <Sphere args={[0.65, 32, 32]}>
        <primitive attach="material" object={glowMaterial} />
      </Sphere>

      {/* Core Light Point */}
      <pointLight distance={3} intensity={5} color="#00ffff" />
    </group>
  );
}

// ---------- ELECTRON COMPONENT ----------
function Electron({ radius, speed, rotation, color }) {
  const ref = useRef();

  // Membuat garis orbit (Cincin tipis)
  const orbitPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      points.push(
        new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
      );
    }
    return points;
  }, [radius]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    // Menggerakkan elektron memutar
    if (ref.current) {
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius;
    }
  });

  return (
    <group rotation={rotation}>
      {/* Garis Orbit Tipis */}
      <Line
        points={orbitPoints}
        color={color}
        opacity={0.15}
        transparent
        lineWidth={2} // Rekomendasi ketebalan
        depthWrite={false}
        toneMapped={false}
        // TAMBAHKAN INI:
        frustumCulled={false}
      />
      {/* Elektron + Trail */}
      <group ref={ref}>
        <Trail
          width={0.8} // Lebar trail
          length={8} // Panjang trail
          color={new THREE.Color(color)}
          attenuation={(t) => t * t} // Ekor menipis
        >
          <Sphere args={[0.08, 16, 16]}>
            <meshBasicMaterial color={[10, 10, 20]} toneMapped={false} />
            {/* toneMapped=false agar warna putihnya "menembus" batas HDR */}
          </Sphere>
        </Trail>

        {/* Glow Sphere di sekeliling elektron */}
        <pointLight distance={1.5} intensity={2} color={color} />
      </group>
    </group>
  );
}

// ---------- MAIN SCENE ----------
function AtomScene() {
  return (
    <>
      <color attach="background" args={["#050510"]} />

      {/* Kontrol Kamera */}
      {/* <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} minDistance={5} maxDistance={20} /> */}
      <OrbitControls makeDefault minDistance={5} maxDistance={20} />

      {/* Efek Bintang Latar Belakang */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* Lighting Scene */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#4444ff" />

      {/* Float membuat seluruh atom melayang naik turun pelan */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <Nucleus />

        {ELECTRONS.map((props, i) => (
          <Electron key={i} {...props} />
        ))}
      </Float>

      {/* --- POST PROCESSING (BLOOM) --- */}
      {/* Efek ini yang membuat benda "bersinar" */}
      <EffectComposer disableNormalPass>
        <Bloom
          luminanceThreshold={1} // Hanya benda sangat terang yang kena bloom
          mipMapBlur // Blur halus
          intensity={1.5} // Kekuatan cahaya
          radius={0.6} // Radius sebaran cahaya
        />
      </EffectComposer>
    </>
  );
}

export default AtomScene;
