import React, { useRef, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  PerspectiveCamera,
  OrthographicCamera,
  OrbitControls,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

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

// Helper that adds a CameraHelper for the main camera
function CameraFrustumHelper({ cameraRef }) {
  const helperRef = useRef();
  const { scene } = useThree();

  // Create & add helper once
  useEffect(() => {
    if (!cameraRef.current) return;

    const helper = new THREE.CameraHelper(cameraRef.current);
    helperRef.current = helper;
    scene.add(helper);

    return () => {
      scene.remove(helper);
    };
  }, [cameraRef, scene]);

  // Keep helper in sync
  useFrame(() => {
    if (helperRef.current) {
      helperRef.current.update();
    }
  });

  return null;
}

function MainCanvas() {
  const cameraRef = useRef();       // main cinematic camera (left)
  const fadeMaterialRef = useRef(); // fade plane material
  const debugCamRef = useRef();     // debug top-down camera (right)

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
            if (!m.uniforms.opacity)
              m.uniforms.opacity = { value: 1.0 };
            if (!m.uniforms.uOpacity)
              m.uniforms.uOpacity = {
                value: m.uniforms.opacity.value,
              };
            if (!m.uniforms.cameraPosition)
              m.uniforms.cameraPosition = {
                value: new THREE.Vector3(0, 0, 0),
              };
          }
        });
      });
    };

    patchMaterials();
    const timers = [50, 200, 1000].map((ms) =>
      setTimeout(patchMaterials, ms)
    );
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
            // Keep cameraPosition uniform in sync
            if (m.uniforms.cameraPosition) {
              if (
                !m.uniforms.cameraPosition.value ||
                typeof m.uniforms.cameraPosition.value.copy !==
                  "function"
              ) {
                m.uniforms.cameraPosition.value =
                  camera.position.clone();
              } else {
                m.uniforms.cameraPosition.value.copy(
                  camera.position
                );
              }
            }

            // Sync opacity / uOpacity
            if (m.uniforms.uOpacity && m.uniforms.opacity) {
              m.uniforms.opacity.value =
                m.uniforms.uOpacity.value;
            } else if (
              m.uniforms.uOpacity &&
              !m.uniforms.opacity
            ) {
              m.uniforms.opacity = {
                value: m.uniforms.uOpacity.value,
              };
            } else if (
              !m.uniforms.uOpacity &&
              m.uniforms.opacity
            ) {
              m.uniforms.uOpacity = {
                value: m.uniforms.opacity.value,
              };
            }
          }
        });
      });
    });

    return null;
  }

  return (
    <>
      {/* LEFT: original cinematic view */}
      <Canvas
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "50%", 
          height: "100%",
          background: "black",
        }}
        onCreated={handleCreated}
        dpr={Math.min(2, window.devicePixelRatio || 1)}
      >
        {/* Optional: comment out Lenis while debugging scroll */}
        {/* <LenisController /> */}
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

        {/* Debug single scenes if needed */}
        {/* <DnaScene /> */}
        {/* <AtomScene /> */}
        {/* <GalaxyScene /> */}
        {/* <SolarScene /> */}
        {/* <EarthScene /> */}
        {/* <CellScene /> */}

        {/* Fade effect */}
        <FadePlane ref={fadeMaterialRef} />

        {/* Postprocessing as before */}
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            height={300}
          />
          <Vignette
            offset={0.1}
            darkness={1.1}
            eskil={false}
          />
        </EffectComposer>
      </Canvas>
      {/* RIGHT: angled bird's-eye debug view */}
		<Canvas
		  style={{
			position: "fixed",
			top: 0,
			left: "50%",
			width: "50%", // Klo mau ilangin tinggal set width 0 terus set width LEFT 100%
			height: "100%",
			background: "#111111",
		  }}
		  dpr={Math.min(2, window.devicePixelRatio || 1)}
		>
		  <color attach="background" args={["#111111"]} />

		  {/* Debug camera (angled, like your original) */}
		  <PerspectiveCamera
			makeDefault
			position={[30, 40, 50]}    // <-- angled bird's-eye
			fov={55}
			near={0.1}
			far={50000}                // huge world scale
		  />

		  {/* Orbit around world from this debug cam */}
		  <OrbitControls
			enableDamping
			dampingFactor={0.15}
			rotateSpeed={0.9}
			zoomSpeed={0.9}
			panSpeed={1.0}
			target={[0, 0, 0]}
		  />

		  {/* Helpers */}
		  <axesHelper args={[20]} />
		  <gridHelper args={[300, 300]} />

		  {/* Actual frustum of the MAIN left camera */}
		  <CameraFrustumHelper cameraRef={cameraRef} />

		  {/* OPTIONAL but useful: show the whole scene here too */}
		  <ambientLight intensity={0.6} />
		  <SceneManager />
		</Canvas>
    </>
  );
}

export default MainCanvas;