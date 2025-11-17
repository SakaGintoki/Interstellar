import React, { forwardRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";

const FadeShader = {
  uniforms: {
    uOpacity: { value: 1.0 },
    opacity: { value: 1.0 },
  },
  vertexShader: `
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;
    uniform float uOpacity;
    uniform float opacity;
    void main() {
      gl_FragColor = vec4(0.0, 0.0, 0.0, uOpacity);
    }
  `,
};

const FadePlane = forwardRef((props, ref) => {
  const uniforms = useMemo(() => {
    return {
      uOpacity: { value: FadeShader.uniforms.uOpacity.value },
      opacity: { value: FadeShader.uniforms.opacity.value },
    };
  }, []);

  useFrame(() => {
    uniforms.opacity.value = uniforms.uOpacity.value;
  });

  return (
    <mesh renderOrder={999}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={new Float32Array([
            -1, -1, 0,
            3, -1, 0,
            -1, 3, 0,
          ])}
          itemSize={3}
          count={3}
        />
      </bufferGeometry>

      <shaderMaterial
        ref={ref}
        uniforms={uniforms}
        vertexShader={FadeShader.vertexShader}
        fragmentShader={FadeShader.fragmentShader}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
});

export default FadePlane;