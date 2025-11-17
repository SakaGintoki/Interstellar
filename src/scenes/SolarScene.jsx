import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, useTexture, Line } from '@react-three/drei' // <-- Line ditambahkan
import * as THREE from 'three'

// --- Data Planet HD (SAMA, TIDAK DIUBAH) ---
const planetsData = [
  { name: 'Mercury', distance: 4, radius: 0.2, texture: '/textures/mercury.jpg', speed: 1.8, bump: 0.05 },
  { name: 'Venus', distance: 6, radius: 0.35, texture: '/textures/venus_surface.jpg', speed: 1.2, bump: 0.08 },
  { name: 'Earth', distance: 8, radius: 0.4, texture: '/textures/earth_day.jpg', speed: 1.0, bump: 0.03, clouds: true },
  { name: 'Mars', distance: 10, radius: 0.3, texture: '/textures/mars.jpg', speed: 0.8, bump: 0.06 },
  { name: 'Jupiter', distance: 16, radius: 1.5, texture: '/textures/jupiter.jpg', speed: 0.4, bump: 0.1 },
  { name: 'Saturn', distance: 22, radius: 1.2, texture: '/textures/saturn.jpg', speed: 0.3, bump: 0.05, ring: true },
  { name: 'Uranus', distance: 28, radius: 0.8, texture: '/textures/uranus.jpg', speed: 0.2, bump: 0.03 },
  { name: 'Neptune', distance: 34, radius: 0.75, texture: '/textures/neptune.jpg', speed: 0.1, bump: 0.02 },
]

const ringGeometry = new THREE.RingGeometry(1.5, 2.5, 64);
ringGeometry.rotateX(-Math.PI * 0.5);
function Planet({ planet }) {
  const planetRef = useRef();
  const orbitRef = useRef();

  const planetTexture = useTexture(planet.texture);
  const normalMap = useTexture('/textures/earth_specular_map.jpg');
  const ringTexture = useTexture('/textures/saturn_ring_alpha.png');
  const cloudsMap = useTexture('/textures/earth_clouds.jpg');

  useFrame((state, delta) => {
    if (orbitRef.current) orbitRef.current.rotation.y += delta * planet.speed * 0.5;
    if (planetRef.current) planetRef.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={orbitRef}>
      <Sphere ref={planetRef} position={[planet.distance, 0, 0]} args={[planet.radius, 64, 64]}>
        {planet.name === 'Earth' ? (
          <>
            <meshStandardMaterial
              map={planetTexture}
              normalMap={normalMap}
              normalScale={[planet.bump, planet.bump]}
              emissive={0x3366ff}
              emissiveIntensity={0.1}
              metalness={0.1}
              roughness={0.7}
            />
            <Sphere args={[planet.radius * 1.02, 64, 64]}>
              <meshStandardMaterial
                map={cloudsMap}
                blending={THREE.AdditiveBlending}
                transparent
                opacity={0.6}
                alphaMap={cloudsMap}
              />
            </Sphere>
          </>
        ) : (
          <meshStandardMaterial
            map={planetTexture}
            bumpMap={planetTexture}
            bumpScale={planet.bump}
            metalness={0.1}
            roughness={0.8}
          />
        )}
      </Sphere>

      {planet.ring && (
        <mesh
          geometry={ringGeometry}
          position={[planet.distance, 0, 0]}
          rotation-z={0.2}
        >
          <meshBasicMaterial
            map={ringTexture}
            alphaMap={ringTexture}
            transparent
            side={THREE.DoubleSide}
            opacity={0.9}
          />
        </mesh>
      )}
    </group>
  )
}


const coronaVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const coronaFragmentShader = `
  varying vec3 vNormal;
  uniform float uGlowIntensity;
  uniform vec3 uGlowColor;
  void main() {
    float intensity = pow(0.3 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    gl_FragColor = vec4(uGlowColor, 1.0) * (intensity * uGlowIntensity);
  }
`;


// --- Komponen Orbit ---
function PlanetOrbit({ distance }) {
  const points = useMemo(() => {
    const numPoints = 64;
    const pts = [];
    for (let i = 0; i <= numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance));
    }
    return pts;
  }, [distance]);

  return (
    <Line
      points={points}
      color={0x666666} 
      lineWidth={1}
      transparent
      opacity={0.1} 
      depthWrite={false} 
    />
  );
}


function SolarScene() {
  const [starTexture, sunTexture] = useTexture([
    '/textures/star_particle.png',
    '/textures/sun.jpg'
  ])

  const starPositions = useMemo(() => {
    const count = 15000 
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 800
      arr[i * 3 + 1] = (Math.random() - 0.5) * 800
      arr[i * 3 + 2] = (Math.random() - 0.5) * 800
    }
    return { array: arr, count }
  }, [])

  const starfieldRef = useRef()
  const sunRef = useRef()

  // Material untuk Corona Matahari
  const coronaMaterial = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: coronaVertexShader,
    fragmentShader: coronaFragmentShader,
    uniforms: {
      uGlowIntensity: { value: 0.8 }, // glow biar warnanya lebih cerah
      uGlowColor: { value: new THREE.Color(0xffaa00) } // kalau ini untuk warnanya
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  }), []);

  useFrame((state, delta) => {
    if (starfieldRef.current) starfieldRef.current.rotation.y += delta * 0.01

    if (sunRef.current) {
      const t = state.clock.elapsedTime;
      sunRef.current.material.emissiveIntensity = 2 + Math.sin(t * 0.5) * 0.3; 
    }
  })

  return (
    <>
      {/* Matahari */}
      <Sphere ref={sunRef} args={[2.5, 64, 64]}>
        <meshStandardMaterial
          emissiveMap={sunTexture}
          emissive={0xffffff}
          emissiveIntensity={2}
        />
      </Sphere>

      {/* Atmosfer Matahari */}
      <Sphere args={[2.7, 64, 64]}> 
        <primitive object={coronaMaterial} />
      </Sphere>
      
      {/* Pencahayaan */}
      <pointLight intensity={20} color={0xffffaa} distance={200} />
      <ambientLight intensity={0.1} /> 


      {/* Planets dan Orbitnya */}
      {planetsData.map((p) => (
        <React.Fragment key={p.name}>
          <Planet key={p.name} planet={p} />
          {/* 👇 **PENAMBAHAN: Garis Orbit** */}
          <PlanetOrbit distance={p.distance} />
        </React.Fragment>
      ))}

      {/* Starfield (Sama, sudah benar) */}
      <points ref={starfieldRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={starPositions.array}
            itemSize={3}
            count={starPositions.count}
          />
        </bufferGeometry>
        <pointsMaterial
          map={starTexture}
          size={0.4} 
          blending={THREE.AdditiveBlending}
          transparent
          opacity={0.8} 
          depthWrite={false}
          sizeAttenuation={true} 
        />
      </points>
    </>
  )
}

export default SolarScene