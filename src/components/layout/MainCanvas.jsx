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
import { usePreloadAssets } from "../../hooks/usePreloadAssets";
import { WarpLines } from "../../components/WarpLines"; // adjust path if needed
import { ScaleOverlay } from "../../components/ScaleOverlay"; // adjust path if needed
import { SceneHUD } from "../../components/SceneHUD"; // ✅ add this

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
  const controlsRef = useRef();     // OrbitControls for left view
  const fadeMaterialRef = useRef(); // fade plane material (left)
  const debugCamRef = useRef();     // debug camera (right) – keeps your old setup
  const warpIntensityRef = useRef(0); // NEW
  const warpDirectionRef = useRef(1);   // 🔴 NEW
  usePreloadAssets();

  // NEW: checkpoint-based navigation hook
const {
  zoomOutToNextScene,
  zoomInToPrevScene,
  logs,
} = useScrollNavigation(cameraRef, controlsRef, fadeMaterialRef, warpIntensityRef, warpDirectionRef);

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

          // 🔥 NEW: force all shader materials’ uOpacity to 0 on startup
          if (m.uniforms.uOpacity) {
            m.uniforms.uOpacity.value = 0.0;
          }
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
	<ScaleOverlay />
	<SceneHUD />  {/* ⬅️ new HUD overlay */}
      {/* HUD: zoom-to-next-scene button */}
      <button
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 30,
          padding: "8px 14px",
          borderRadius: "999px",
          border: "none",
          background: "rgba(0,0,0,0.7)",
          color: "#fff",
          fontSize: 14,
          cursor: "pointer",
        }}
        onClick={zoomOutToNextScene}
      >
        Zoom out to next scene
      </button>
      <button
    style={{
      position: "fixed",
      bottom: 20,
      left: 20,
      zIndex: 30,
      padding: "8px 14px",
      borderRadius: "999px",
      border: "none",
      background: "rgba(0,0,0,0.7)",
      color: "#fff",
      fontSize: 14,
      cursor: "pointer",
    }}
    onClick={zoomInToPrevScene}
  >
    Zoom in to previous scene
  </button>
  
  {/* 🔍 Right-side log window overlay */}
      <div
        style={{
          position: "fixed",
          top: 10,
          right: 10,
          width: "48%",         // stays over the right canvas
          maxHeight: "40%",
          overflowY: "auto",
          background: "rgba(0,0,0,0.7)",
          color: "#9eff9e",
          fontFamily: "monospace",
          fontSize: 11,
          padding: "8px 10px",
          borderRadius: 8,
          zIndex: 35,
          pointerEvents: "none", // so you can still drag orbit in the canvas
        }}
      >
        <div style={{ marginBottom: 4, opacity: 0.8 }}>
          Camera log (latest on top)
        </div>
        {logs.map((entry) => (
          <div key={entry.id} style={{ marginBottom: 2 }}>
            <div>{entry.label}</div>
            <div style={{ opacity: 0.8 }}>
              from: [{entry.from.map((v) => v.toFixed(1)).join(", ")}]
            </div>
            <div style={{ opacity: 0.8 }}>
              to:&nbsp;&nbsp;&nbsp;
              [{entry.to.map((v) => v.toFixed(1)).join(", ")}]
            </div>
          </div>
        ))}
      </div>
  
      {/* LEFT: main interactive cinematic view */}
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
        {/* Optional: keep Lenis disabled with new system */}
        {/* <LenisController /> */}
        <MaterialUpdater />

        <PerspectiveCamera
          makeDefault
          ref={cameraRef}
          fov={75}
          near={0.1}
          far={5000}
          position={[0, 0, 10]}
        />

        {/* NEW: user orbit + scroll, limits overridden per scene by hook */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.1}
        />

        <ambientLight intensity={0.5} />

        <SceneManager />
        <WarpLines
          warpIntensityRef={warpIntensityRef}
		  warpDirectionRef={warpDirectionRef}
          cameraRef={cameraRef}
        />
        {/* Debug single scenes if needed */}
        {/* <DnaScene /> */}
        {/* <AtomScene /> */}
        {/* <GalaxyScene /> */}
        {/* <SolarScene /> */}
        {/* <EarthScene /> */}
        {/* <CellScene /> */}

        {/* Fade effect for transitions */}
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
          width: "50%", // set to 0% + left=0 and make left 100% if you want to hide debug
          height: "100%",
          background: "#111111",
        }}
        dpr={Math.min(2, window.devicePixelRatio || 1)}
      >
        <color attach="background" args={["#111111"]} />

        {/* Debug camera (angled, like your original) */}
        <PerspectiveCamera
          makeDefault
          ref={debugCamRef}
          position={[30, 40, 50]}
          fov={55}
          near={0.1}
          far={50000}
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

        {/* Shows the MAIN left camera frustum in debug view */}
        <CameraFrustumHelper cameraRef={cameraRef} />

        {/* Optionally also render your scene here */}
        <ambientLight intensity={0.6} />
        <SceneManager />
      </Canvas>
    </>
  );
}

export default MainCanvas;