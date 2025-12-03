import React, { useRef, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  PerspectiveCamera,
  OrbitControls,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

import SceneManager from "./SceneManager";
import FadePlane from "./FadePlane";
// import AtomScene from "../../scenes/AtomScene"; // Keep imports if you need them later
// import GalaxyScene from "../../scenes/GalaxyScene";
// import DnaScene from "../../scenes/DnaScene";
// import SolarScene from "../../scenes/SolarScene";
// import EarthScene from "../../scenes/EarthScene";
// import CellScene from "../../scenes/CellScene";

import { useScrollNavigation } from "../../hooks/useScrollNavigation";
import { useLenis } from "../../hooks/useLenis";
import { usePreloadAssets } from "../../hooks/usePreloadAssets";
import { WarpLines } from "../../components/WarpLines"; 
import { ScaleOverlay } from "../../components/ScaleOverlay"; 
import { SceneHUD } from "../../components/SceneHUD"; 

// --- Helper Components ---

function LenisController() {
  useLenis();
  return null;
}

// Helper that adds a CameraHelper for the main camera (for debug view)
function CameraFrustumHelper({ cameraRef }) {
  const helperRef = useRef();
  const { scene } = useThree();

  useEffect(() => {
    if (!cameraRef.current) return;
    const helper = new THREE.CameraHelper(cameraRef.current);
    helperRef.current = helper;
    scene.add(helper);
    return () => {
      scene.remove(helper);
    };
  }, [cameraRef, scene]);

  useFrame(() => {
    if (helperRef.current) {
      helperRef.current.update();
    }
  });

  return null;
}

// Material Updater Component (Runs inside Canvas)
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
              typeof m.uniforms.cameraPosition.value.copy !== "function"
            ) {
              m.uniforms.cameraPosition.value = camera.position.clone();
            } else {
              m.uniforms.cameraPosition.value.copy(camera.position);
            }
          }

          // Sync opacity / uOpacity
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

// Navigation UI Component
const NavButtons = ({ onPrev, onNext }) => {
  return (
    <div className="fixed bottom-6 md:bottom-10 left-0 w-full flex justify-between items-center z-50 pointer-events-none px-6 md:px-10">
      
      {/* Prev */}
      <button
        onClick={onPrev}
        className="pointer-events-auto group relative flex items-center gap-3 px-6 py-3 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 hover:border-cyan-500/50 rounded-full transition-all duration-300"
      >
        <svg className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <div className="flex flex-col items-start">
          <span className="text-[10px] md:text-xs font-mono text-gray-400 uppercase tracking-widest group-hover:text-cyan-300 transition-colors">
            Prev
          </span>
          <span className="hidden md:block text-xs font-bold text-white tracking-widest">
            ZOOM IN
          </span>
        </div>
      </button>

      {/* Next */}
      <button
        onClick={onNext}
        className="pointer-events-auto group relative flex items-center gap-3 px-6 py-3 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 hover:border-cyan-500/50 rounded-full transition-all duration-300"
      >
        <div className="flex flex-col items-end">
          <span className="text-[10px] md:text-xs font-mono text-gray-400 uppercase tracking-widest group-hover:text-cyan-300 transition-colors">
            Next
          </span>
          <span className="hidden md:block text-xs font-bold text-white tracking-widest">
            ZOOM OUT
          </span>
        </div>
        <svg className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

    </div>
  );
};


// --- Main Component ---

function MainCanvas() {
  const cameraRef = useRef();       // main cinematic camera (left)
  const controlsRef = useRef();     // OrbitControls for left view
  const fadeMaterialRef = useRef(); // fade plane material (left)
  // const debugCamRef = useRef();  // debug camera (right) – keeps your old setup
  const warpIntensityRef = useRef(0); 
  const warpDirectionRef = useRef(1);
  
  usePreloadAssets();

  // Navigation Hook
  const {
    zoomOutToNextScene,
    zoomInToPrevScene,
    logs,
  } = useScrollNavigation(cameraRef, controlsRef, fadeMaterialRef, warpIntensityRef, warpDirectionRef);

  // Initial Material Setup
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
              m.uniforms.uOpacity = { value: m.uniforms.opacity.value };
            if (!m.uniforms.cameraPosition)
              m.uniforms.cameraPosition = { value: new THREE.Vector3(0, 0, 0) };

            if (m.uniforms.uOpacity) {
              m.uniforms.uOpacity.value = 0.0;
            }
          }
        });
      });
    };

    patchMaterials();
    const timers = [50, 200, 1000].map((ms) => setTimeout(patchMaterials, ms));
    return () => timers.forEach(clearTimeout);
  };

  return (
    <>
      {/* 1. DOM OVERLAYS (Outside Canvas) */}
      <ScaleOverlay />
      <SceneHUD />
      
      {/* Navigation Buttons linked to Hook */}
      <NavButtons onPrev={zoomInToPrevScene} onNext={zoomOutToNextScene} />

      {/* Log Overlay (Optional/Debug) */}
      {/* <div style={{ position: "fixed", top: 10, right: 10, zIndex: 35, color: "#9eff9e", pointerEvents: "none" }}>
          Camera Log Active
      </div> */}

      {/* 2. MAIN 3D SCENE */}
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

        {/* Fade effect for transitions */}
        <FadePlane ref={fadeMaterialRef} />

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

      {/* 3. DEBUG CANVAS (Optional - Commented Out) */}
      {/* <Canvas
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          width: "50%", 
          height: "100%",
          background: "#111111",
        }}
        dpr={Math.min(2, window.devicePixelRatio || 1)}
      >
        <color attach="background" args={["#111111"]} />
        <PerspectiveCamera makeDefault position={[30, 40, 50]} fov={55} />
        <OrbitControls target={[0, 0, 0]} />
        <axesHelper args={[20]} />
        <gridHelper args={[300, 300]} />
        <CameraFrustumHelper cameraRef={cameraRef} />
      </Canvas> 
      */}
    </>
  );
}

export default MainCanvas;