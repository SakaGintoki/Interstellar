import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, useTexture, Line } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

// --- Data Planet ---
const planetsData = [
  { name: 'Mercury', distance: 10, radius: 0.4, texture: '/textures/mercury.jpg', speed: 1.5, bump: 0.1 },
  { name: 'Venus', distance: 15, radius: 0.7, texture: '/textures/venus_surface.jpg', speed: 1.2, bump: 0.1 },
  { name: 'Earth', distance: 22, radius: 0.8, texture: '/textures/earth_day.jpg', speed: 1.0, bump: 0.5, clouds: true },
  { name: 'Mars', distance: 30, radius: 0.6, texture: '/textures/mars.jpg', speed: 0.8, bump: 0.2 },
  { name: 'Jupiter', distance: 42, radius: 2.5, texture: '/textures/jupiter.jpg', speed: 0.4, bump: 0.05 },
  { name: 'Saturn', distance: 58, radius: 2.0, texture: '/textures/saturn.jpg', speed: 0.3, bump: 0.05, ring: true },
  { name: 'Uranus', distance: 72, radius: 1.5, texture: '/textures/uranus.jpg', speed: 0.2, bump: 0.05 },
  { name: 'Neptune', distance: 85, radius: 1.4, texture: '/textures/neptune.jpg', speed: 0.1, bump: 0.05 },
]

// --- Shader untuk Atmosfer Bumi ---
const fresnelVertexShader = `
varying vec3 vNormal;
varying vec3 vPositionVector;
`
const fresnelFragmentShader = `
varying vec3 vNormal;
varying vec3 vPositionVector;
void main() {
  float intensity = pow(0.65 - dot(vNormal, vPositionVector), 4.0);
  gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 1.5;
}
`

const ringGeometry = new THREE.RingGeometry(3, 5, 64);
ringGeometry.rotateX(-Math.PI * 0.5);

function Planet({ planet }) {
  const planetRef = useRef();
  const orbitRef = useRef();
  const cloudsRef = useRef();
  
  // Refs untuk Bulan (Hanya digunakan jika planet == Earth)
  const moonOrbitRef = useRef();
  const moonMeshRef = useRef();

  // --- PERBAIKAN 1: Acak posisi awal ---
  // Membuat sudut awal acak agar planet tidak berbaris lurus saat mulai
  // Ini mencegah planet lain langsung menutupi matahari (bulatan hitam di gambar Anda)
  const initialRotation = useMemo(() => Math.random() * Math.PI * 2, []);

  const planetTexture = useTexture(planet.texture);
  const normalMap = useTexture('/textures/earth_specular_map.jpg');
  const ringTexture = useTexture('/textures/saturn_ring_alpha.png');
  const cloudsMap = useTexture('/textures/earth_clouds.jpg');
  
  // --- TAMBAHAN BULAN: Load texture bulan ---
  // Gunakan texture loader secara kondisional agar tidak error di planet lain
  const moonTexture = planet.name === 'Earth' ? useTexture('/textures/moon.jpg') : null;

  useFrame((state, delta) => {
    // Rotasi Orbit Utama Planet
    if (orbitRef.current) orbitRef.current.rotation.y += delta * planet.speed * 0.1;
    // Rotasi Planet pada porosnya
    if (planetRef.current) planetRef.current.rotation.y += delta * 0.2;
    
    // Animasi Khusus Bumi
    if (planet.name === 'Earth') {
        if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.23;
        
        // --- TAMBAHAN BULAN: Animasi Orbit & Rotasi Bulan ---
        if (moonOrbitRef.current) moonOrbitRef.current.rotation.y += delta * 0.5; // Bulan mengelilingi bumi lebih cepat
        if (moonMeshRef.current) moonMeshRef.current.rotation.y += delta * 0.1; // Bulan berputar pada porosnya
    }
  });

  return (
    // Menerapkan rotasi awal acak di sini
    <group ref={orbitRef} rotation={[0, initialRotation, 0]}>
      <group position={[planet.distance, 0, 0]}>
        
        {/* MESH UTAMA PLANET */}
        <Sphere ref={planetRef} args={[planet.radius, 64, 64]} castShadow receiveShadow>
          {planet.name === 'Earth' ? (
            <meshStandardMaterial
              map={planetTexture}
              normalMap={normalMap}
              normalScale={[1, 1]}
              roughness={0.5}
              metalness={0.1}
            />
          ) : (
            <meshStandardMaterial
              map={planetTexture}
              bumpMap={planetTexture}
              bumpScale={planet.bump}
              roughness={0.7}
              metalness={0.1}
            />
          )}
        </Sphere>

        {/* KHUSUS BUMI: AWAN, ATMOSFER, dan BULAN */}
        {planet.name === 'Earth' && (
          <>
            {/* Lapisan Awan */}
            <Sphere ref={cloudsRef} args={[planet.radius * 1.01, 64, 64]}>
              <meshStandardMaterial
                map={cloudsMap}
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
                alphaMap={cloudsMap}
                depthWrite={false}
              />
            </Sphere>
            
            {/* Lapisan Atmosfer */}
            <mesh scale={[planet.radius * 1.25, planet.radius * 1.25, planet.radius * 1.25]}>
                <sphereGeometry args={[1, 64, 64]} />
                <shaderMaterial
                    vertexShader={fresnelVertexShader}
                    fragmentShader={fresnelFragmentShader}
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                    transparent
                    depthWrite={false} // PERBAIKAN: Mencegah atmosfer membuat kotak/lingkaran hitam
                />
            </mesh>

            {/* --- TAMBAHAN BULAN DISINI --- */}
             <group ref={moonOrbitRef} rotation={[Math.PI / 8, 0, 0]}> {/* Group untuk orbit bulan, sedikit miring */}
                {/* Posisi bulan relatif terhadap Bumi. Radius bumi 0.8, kita taruh bulan di jarak 2.5 */}
                <mesh ref={moonMeshRef} position={[2.5, 0, 0]} castShadow receiveShadow>
                    {/* Ukuran bulan kira-kira 1/4 bumi (0.8 / 4 = 0.2) */}
                    <sphereGeometry args={[0.2, 32, 32]} />
                    <meshStandardMaterial
                        map={moonTexture} // Pastikan Anda punya /textures/moon.jpg
                        roughness={0.9}
                        metalness={0.1}
                        color="#cccccc" // Sedikit abu-abu jika tekstur belum termuat
                    />
                </mesh>
                 {/* Optional: Visualisasi garis orbit bulan */}
                 <Line
                    points={useMemo(() => {
                         const pts = [];
                         for (let i = 0; i <= 64; i++) {
                             const angle = (i / 64) * Math.PI * 2;
                             pts.push(new THREE.Vector3(Math.cos(angle) * 2.5, 0, Math.sin(angle) * 2.5));
                         }
                         return pts;
                    }, [])}
                    color="#888"
                    opacity={0.2}
                    transparent
                    lineWidth={0.3}
                 />
            </group>
          </>
        )}

        {/* CINCIN SATURNUS */}
        {planet.ring && (
          <mesh
            geometry={ringGeometry}
            rotation-x={0.5}
            rotation-y={0.2}
            receiveShadow
          >
            <meshStandardMaterial
              map={ringTexture}
              transparent
              side={THREE.DoubleSide}
              opacity={0.8}
            />
          </mesh>
        )}
      </group>
    </group>
  )
}

// --- Komponen Garis Orbit Planet (Tidak Berubah) ---
function PlanetOrbit({ distance }) {
  const points = useMemo(() => {
    const numPoints = 128;
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
      color="#444"
      lineWidth={0.5}
      transparent
      opacity={0.3} 
    />
  );
}

function SolarScene() {
  const sunTexture = useTexture('/textures/sun.jpg')
  const sunRef = useRef()

  useFrame((state) => {
    if (sunRef.current) {
        sunRef.current.rotation.y += 0.002
    }
  })

  // Membuat Starfield
  const starPositions = useMemo(() => {
    const count = 3000
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 400 + Math.random() * 400
      const theta = 2 * Math.PI * Math.random()
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [])

  return (
    <>
      <ambientLight intensity={0.05} />
      
      <pointLight 
        position={[0, 0, 0]} 
        intensity={500}
        distance={200}
        decay={1.5}
        color="#ffecd6"
        castShadow 
        shadow-mapSize={[1024, 1024]} 
        shadow-bias={-0.0001} // PERBAIKAN: Menghilangkan artefak bayangan hitam pada permukaan planet
      />

      {/* --- MATAHARI --- */}
      <Sphere ref={sunRef} args={[4, 64, 64]}>
        <meshBasicMaterial 
            map={sunTexture} 
            color={[10, 3, 1]}
            toneMapped={false} 
        />
      </Sphere>

      {/* --- PLANETS --- */}
      {planetsData.map((p) => (
        <React.Fragment key={p.name}>
          <Planet planet={p} />
          <PlanetOrbit distance={p.distance} />
        </React.Fragment>
      ))}

      {/* --- STARFIELD --- */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={starPositions}
            itemSize={3}
            count={starPositions.length / 3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.8}
          color="#ffffff"
          transparent
          opacity={0.8}
          sizeAttenuation={true}
        />
      </points>

      {/* --- POST PROCESSING --- */}
      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.2}
            mipmapBlur 
            intensity={1.5} 
            radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  )
}

export default SolarScene