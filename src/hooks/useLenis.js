import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import Lenis from "@studio-freight/lenis";

export function useLenis() {
  const lenisRef = useRef(null);

  useEffect(() => {
    lenisRef.current = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothTouch: true,
    });

    return () => {
      lenisRef.current?.destroy();
    };
  }, []);

  useFrame((_, delta) => {
    lenisRef.current?.raf(delta * 1000);
  });
}
