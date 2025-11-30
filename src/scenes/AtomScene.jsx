import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Trail } from "@react-three/drei";
import * as THREE from "three";

// --- CONSTANTS ---
const ORBIT_RADIUS = 3.5;
const ELECTRON_SPEED_1 = 1.5;
const ELECTRON_SPEED_2 = 1.8;
const ELECTRON_SPEED_3 = 2.1;

// --- GLOW SHADER (same as yours) ---
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

// ---------- EXTRA AMBIENCE COMPONENTS ----------

// Big inverted sphere giving the atom a colored environment
function AmbientGlow({ color = "#021226", intensity = 0.8, radius = 1000 }) {
  return (
    <mesh scale={radius}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        side={THREE.BackSide}
        color={color}
        emissive={color}
        emissiveIntensity={intensity}
        transparent
        opacity={0.85}
        toneMapped={false}
      />
    </mesh>
  );
}

// Tiny “quantum mist” particles around the atom
function ElectronMist({ count = 350, radius = 8 }) {
  const pointsRef = useRef();

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = radius * Math.random() * 0.9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const idx = i * 3;
      arr[idx] = x;
      arr[idx + 1] = y;
      arr[idx + 2] = z;
    }
    return arr;
  }, [count, radius]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();

    // slow rotation & tiny breathing
    pointsRef.current.rotation.y = t * 0.15;
    pointsRef.current.rotation.x = Math.sin(t * 0.25) * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#66e5ff"
        transparent
        opacity={0.6}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

// ---------- MAIN COMPONENT ----------
function AtomScene() {
  const nucleusRef = useRef();

  const electron1Ref = useRef();
  const electron2Ref = useRef();
  const electron3Ref = useRef();

  // Glow material around nucleus
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

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Rotate nucleus slightly
    if (nucleusRef.current) {
      nucleusRef.current.rotation.y += delta * 0.4;

      // subtle breathing scale
      const s = 1 + Math.sin(t * 2.0) * 0.05;
      nucleusRef.current.scale.set(s, s, s);
    }

    // Electron orbits
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
      {/* Ambient environment */}
      <AmbientGlow color="#020b1c" intensity={0.9} radius={35} />
      <ElectronMist count={400} radius={9} />

      {/* Lighting */}
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 0, 0]} intensity={2.0} color={0x66ccff} />
      <pointLight position={[6, 4, 8]} intensity={0.8} color={0xffffff} />
      <pointLight position={[-5, -3, -6]} intensity={0.6} color={0x88aaff} />

      {/* Nucleus */}
      <Sphere ref={nucleusRef} args={[0.5, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color={0xffffaa}
          emissive={0xffffaa}
          emissiveIntensity={3}
          roughness={0.3}
          metalness={0.1}
        />
      </Sphere>

      {/* Nucleus glow shell */}
      <Sphere args={[0.6, 32, 32]} position={[0, 0, 0]}>
        <primitive attach="material" object={shaderMaterial} />
      </Sphere>

      {/* Electron 1 */}
      <mesh ref={electron1Ref}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color={0x00ffff}
          emissive={0x00ffff}
          emissiveIntensity={5}
        />
        <Trail
          width={0.2}
          length={6}
          color={new THREE.Color(0x00ffff)}
          attenuation={(t) => t * t}
        />
      </mesh>

      {/* Electron 2 */}
      <mesh ref={electron2Ref}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color={0x00ffff}
          emissive={0x00ffff}
          emissiveIntensity={5}
        />
        <Trail
          width={0.2}
          length={6}
          color={new THREE.Color(0x00ffff)}
          attenuation={(t) => t * t}
        />
      </mesh>

      {/* Electron 3 */}
      <mesh ref={electron3Ref}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color={0x00ffff}
          emissive={0x00ffff}
          emissiveIntensity={5}
        />
        <Trail
          width={0.2}
          length={6}
          color={new THREE.Color(0x00ffff)}
          attenuation={(t) => t * t}
        />
      </mesh>
    </>
  );
}

export default AtomScene;