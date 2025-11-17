import React, { useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three"; // Add this import to fix the THREE is not defined error

import SceneManager from "./SceneManager";
import FadePlane from "./FadePlane";
import AtomScene from "../../scenes/AtomScene";
import GalaxyScene from "../../scenes/GalaxyScene";
import DnaScene from "../../scenes/DnaScene";
import SolarScene from "../../scenes/SolarScene";
import EarthScene from "../../scenes/EarthScene";
import CellScene from "../../scenes/CellScene";
import { useScrollNavigation } from "../../hooks/useScrollNavigation";
import { useLenis } from "../../hooks/useLenis";

function LenisController() {
  useLenis();
  return null;
}

function MainCanvas() {
  const cameraRef = useRef();
  const fadeMaterialRef = useRef();
  useScrollNavigation(cameraRef, fadeMaterialRef);

  const handleCreated = ({ scene }) => {
    const patchMaterials = () => {
      scene.traverse((obj) => {
        const mat = obj.material;
        if (!mat) return;
        const mats = Array.isArray(mat) ? mat : [mat];
        mats.forEach((m) => {
          if (m && m.isShaderMaterial) {
            if (!m.uniforms) m.uniforms = {};
            if (!m.uniforms.opacity) m.uniforms.opacity = { value: 1.0 };
            if (!m.uniforms.uOpacity) m.uniforms.uOpacity = { value: m.uniforms.opacity.value };
            if (!m.uniforms.cameraPcosition) m.uniforms.cameraPosition = { value: new THREE.Vector3(0,0,0) };
          }
        });
      });
    };

    patchMaterials();
    const timers = [50, 200, 1000].map((ms) => setTimeout(patchMaterials, ms));
    return () => timers.forEach(clearTimeout);
  };

  function MaterialUpdater() {
    const { scene, camera } = useThree();
    useFrame(() => {
      if (!scene) return;
      scene.traverse((obj) => {
        const mat = obj.material;
        if (!mat) return;
        const mats = Array.isArray(mat) ? mat : [mat];
        mats.forEach((m) => {
          if (m && m.isShaderMaterial && m.uniforms) {
            if (m.uniforms.cameraPosition) {
              if (!m.uniforms.cameraPosition.value || typeof m.uniforms.cameraPosition.value.copy !== "function") {
                m.uniforms.cameraPosition.value = camera.position.clone();
              } else {
                m.uniforms.cameraPosition.value.copy(camera.position);
              }
            }
            if (m.uniforms.uOpacity && m.uniforms.opacity) {
              m.uniforms.opacity.value = m.uniforms.uOpacity.value;
            } else if (m.uniforms.uOpacity && !m.uniforms.opacity) {
              m.uniforms.opacity = { value: m.uniforms.uOpacity.value };
            } else if (!m.uniforms.uOpacity && m.uniforms.opacity) {
              m.uniforms.uOpacity = { value: m.uniforms.opacity.value };
            }
          }
        });
      });
    });
    return null;
  }

  return (
    <Canvas
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "black",
      }}
      onCreated={handleCreated}
      dpr={Math.min(2, window.devicePixelRatio || 1)}
    >
      {/* MUST be inside Canvas */}
      <LenisController />
      <MaterialUpdater />

      <PerspectiveCamera
        makeDefault
        ref={cameraRef}
        fov={75}
        near={0.1}
        far={2000}
        position={[0, 0, 10]}
      />

      <ambientLight intensity={0.5} />

      <SceneManager />

      {/* Debug */}
      {/* <DnaScene /> */}
      {/* <AtomScene /> */}
      {/* <GalaxyScene /> */}
      {/* <SolarScene /> */}
      {/* <EarthScene /> */}
      {/* <CellScene /> */}

      
      {/* Fade effect */}
      <FadePlane ref={fadeMaterialRef} />

      {/* ----- POSTPROCESSING (safe values) ----- */}
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          height={300}
        />
        <Vignette offset={0.1} darkness={1.1} eskil={false} />
      </EffectComposer>

    </Canvas>
  );
}

export default MainCanvas;
