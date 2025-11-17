import React, { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import vertexShader from "../shaders/universe/vertex.glsl";
import fragmentShader from "../shaders/universe/fragment.glsl";

function UniverseScene() {
  const meshRef = useRef();

  const initialRes = useMemo(
    () =>
      new THREE.Vector2(
        typeof window !== "undefined" ? window.innerWidth : 1,
        typeof window !== "undefined" ? window.innerHeight : 1
      ),
    []
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: initialRes },
          uCameraPos: { value: new THREE.Vector3(0, 0, 10) },
          cameraPosition: { value: new THREE.Vector3(0, 0, 10) },
          uCameraViewMatrix: { value: new THREE.Matrix4() },        
          uCameraProjectionMatrix: { value: new THREE.Matrix4() }, 
          opacity: { value: 1.0 }, 
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
      }),
    [initialRes]
  );

  useEffect(() => {
    const onResize = () => {
      if (material && material.uniforms && material.uniforms.uResolution) {
        material.uniforms.uResolution.value.set(
          window.innerWidth,
          window.innerHeight
        );
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("resize", onResize);
      onResize();
    }
    return () => {
      if (typeof window !== "undefined")
        window.removeEventListener("resize", onResize);
      if (material && material.dispose) material.dispose();
    };
  }, [material]);

  useFrame((state, delta) => {
    if (!material || !material.uniforms) return;
    material.uniforms.uTime.value += delta;
    material.uniforms.uCameraPos.value.copy(state.camera.position);
    if (material.uniforms.cameraPosition) material.uniforms.cameraPosition.value.copy(state.camera.position);
    material.uniforms.uCameraViewMatrix.value.copy(state.camera.matrixWorldInverse);
    material.uniforms.uCameraProjectionMatrix.value.copy(state.camera.projectionMatrix);
  });

  return (
    <mesh ref={meshRef} scale={[400, 400, 400]}>
      <boxGeometry args={[1, 1, 1]} />
      <primitive attach="material" object={material} />
    </mesh>
  );
}

export default UniverseScene;
