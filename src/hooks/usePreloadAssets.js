// src/hooks/usePreloadAssets.js
import { useEffect } from "react";
import { useTexture } from "@react-three/drei";

const BIG_TEXTURES = [
  // EarthScene
  "/textures/earth_day_2.jpg",
  "/textures/earth_night_2.jpg",
  "/textures/earth_clouds_2.jpg",
  "/textures/moon.jpg",

  // SolarScene planets
  "/textures/mercury.jpg",
  "/textures/venus_surface.jpg",
  "/textures/earth_day.jpg",
  "/textures/mars.jpg",
  "/textures/jupiter.jpg",
  "/textures/saturn.jpg",
  "/textures/uranus.jpg",
  "/textures/neptune.jpg",
  "/textures/earth_specular_map.jpg",
  "/textures/saturn_ring_alpha.png",
  "/textures/earth_clouds.jpg",

  // Star sprite
  "/textures/star_particle.png",
];

export function usePreloadAssets() {
  useEffect(() => {
    // drei gives us a static preload helper on useTexture
    useTexture.preload(BIG_TEXTURES);
  }, []);
}
