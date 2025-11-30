import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, CameraHelper } from "@react-three/drei";
import * as THREE from "three";

function DebugView({ mainCamera }) {
  const debugCam = useRef();
  const helper = useRef();
  const { gl, scene, size } = useThree();

  useFrame(() => {
    debugCam.current.lookAt(0, 0, 0);
    helper.current.update();
  });

  return (
    <>
      {/* Second camera */}
      <perspectiveCamera
        ref={debugCam}
        position={[0, 50, 0]}     // <- Bird’s-eye view
        fov={50}
      />

      {/* Orbit controls for the debug camera */}
      <OrbitControls camera={debugCam.current} />

      {/* Helper that shows the main camera direction + frustum */}
      <primitive object={new THREE.CameraHelper(mainCamera)} ref={helper} />

      {/* Mini viewport */}
      <mesh>
        <meshBasicMaterial />
      </mesh>
    </>
  );
}

export default DebugView;
