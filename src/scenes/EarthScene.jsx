import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Ring } from "@react-three/drei";
import * as THREE from "three";
import vertexShader from "../shaders/atmosphere/vertex.glsl";
import fragmentShader from "../shaders/atmosphere/fragment.glsl";

function EarthScene() {
  const earthRef = useRef();
  const cloudsRef = useRef();
  const sunLightRef = useRef();
  const moonRef = useRef(); 

  const [dayMap, nightMap, cloudsMap, moonMap] = useTexture([
    "/textures/earth_day_2.jpg",
    "/textures/earth_night_2.jpg",
    "/textures/earth_clouds_2.jpg",
    "/textures/moon.jpg",
  ]);

  const earthMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uDayTexture: { value: dayMap },
        uNightTexture: { value: nightMap },
        uSunDirection: { value: new THREE.Vector3(1, 0, 0) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uDayTexture;
        uniform sampler2D uNightTexture;
        uniform vec3 uSunDirection;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        
        void main() {
          vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
          float sunDot = dot(vNormal, normalize(uSunDirection));
          
          float dayIntensity = smoothstep(-0.2, 0.2, sunDot);
          
          vec3 dayColor = texture2D(uDayTexture, vUv).rgb;
          vec3 nightColor = texture2D(uNightTexture, vUv).rgb;
          
          // Add specular highlight
          float specular = pow(max(0.0, dot(reflect(-normalize(uSunDirection), vNormal), viewDirection)), 32.0);
          vec3 specularColor = vec3(1.0) * specular * 0.5 * dayIntensity;
          
          vec3 finalColor = mix(nightColor, dayColor, dayIntensity) + specularColor;
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });
  }, [dayMap, nightMap]);

  const atmosphereMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uGlowColor: { value: new THREE.Color(0x4da6ff) },
          uGlowPower: { value: 3.0 },
          opacity: { value: 1.0 },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    []
  );

  const moonOrbitRadius = 6;
  const moonOrbitSpeed = 0.5; 

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.05;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.06;

    const sunX = Math.cos(t * 0.1) * 10;
    const sunZ = Math.sin(t * 0.1) * 10;
    if (sunLightRef.current) {
      sunLightRef.current.position.set(sunX, 0, sunZ);
      if (
        earthRef.current &&
        earthMaterial &&
        earthMaterial.uniforms &&
        earthMaterial.uniforms.uSunDirection
      ) {
        const sunDirection = new THREE.Vector3()
          .subVectors(
            sunLightRef.current.position,
            earthRef.current.position || new THREE.Vector3()
          )
          .normalize();
        earthMaterial.uniforms.uSunDirection.value.copy(sunDirection);
      }
    }

    if (moonRef.current) {
      const moonX = Math.cos(t * moonOrbitSpeed) * moonOrbitRadius;
      const moonZ = Math.sin(t * moonOrbitSpeed) * moonOrbitRadius;
      moonRef.current.position.set(moonX, 0, moonZ);
      moonRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <>
      <directionalLight
        ref={sunLightRef}
        intensity={2.0}
        position={[10, 0, 10]}
      />

      {/* Earth */}
      {/* (Radius Bumi = 1 * scale 3 = 3) */}
      <mesh ref={earthRef} scale={[3, 3, 3]}>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive attach="material" object={earthMaterial} />
      </mesh>

      {/* Clouds */}
      <mesh ref={cloudsRef} scale={[3.03, 3.03, 3.03]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={cloudsMap}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Atmosphere */}
      <mesh scale={[3.15, 3.15, 3.15]}>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive attach="material" object={atmosphereMaterial} />
      </mesh>

      {/* Radius Bulan = 27% dari radius Bumi (0.27 * 3 = 0.81) */}
      <mesh ref={moonRef} scale={[0.81, 0.81, 0.81]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial map={moonMap} />
      </mesh>

      {/* Orbit Bulan */}
      <Ring
        args={[
          moonOrbitRadius - 0.01, // innerRadius (cocokkan dengan orbitRadius)
          moonOrbitRadius + 0.01, // outerRadius (cocokkan dengan orbitRadius)
          128, // segments
        ]}
        rotation-x={Math.PI / 2} // Putar agar sejajar dengan bidang XZ
      >
        <meshBasicMaterial
          color="#555"
          side={THREE.DoubleSide}
          transparent
          opacity={0.3}
        />
      </Ring>
    </>
  );
}

export default EarthScene;