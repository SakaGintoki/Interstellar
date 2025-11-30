// src/hooks/useScrollNavigation.js
import { useCallback, useState } from "react";
import { useSceneStore } from "./useSceneStore";
import { gsap } from "gsap";
import { SCENE_SEQUENCE, SCENE_CHECKPOINTS } from "./sceneCheckpoints";

export function useScrollNavigation(
  cameraRef,
  controlsRef,
  fadeMaterialRef,
  warpRef,
  warpDirectionRef
) {
  const currentScale = useSceneStore((state) => state.currentScale);
  const setCurrentScale = useSceneStore((state) => state.setCurrentScale);

  // Scene → "representative size" (meters)
  const SCENE_SCALES_METERS = {
    atom: 3e-10,
    dna: 3e-9,
    cell: 3e-6,
    earth: 1.27e7,
    solar: 1e11,
    galaxy: 1e20,
    universe: 1e26,
  };

  const SCENE_EXPONENTS = Object.fromEntries(
    Object.entries(SCENE_SCALES_METERS).map(([k, v]) => [
      k,
      Math.log10(v),
    ])
  );

  const [logs, setLogs] = useState([]);
  const scaleExp = useSceneStore((state) => state.scaleExp);
  const setScaleExp = useSceneStore((state) => state.setScaleExp);

  const pushLog = useCallback((label, from, to) => {
    setLogs((prev) =>
      [
        {
          id: Date.now() + Math.random(),
          label,
          from: [...from],
          to: [...to],
        },
        ...prev,
      ].slice(0, 30)
    );
  }, []);

  // 🔸 ASYNC UI SCALE ANIMATION (no GSAP, no timeline)
  const animateScale = useCallback(
    (fromKey, toKey, durationSec = 1.4) => {
      const fromExp =
        SCENE_EXPONENTS[fromKey] ??
        scaleExp ??
        SCENE_EXPONENTS.atom;
      const toExp = SCENE_EXPONENTS[toKey] ?? fromExp;

      let start = null;
      const delta = toExp - fromExp;

      function step(timestamp) {
        if (start === null) start = timestamp;
        const t = (timestamp - start) / (durationSec * 1000);

        if (t >= 1) {
          setScaleExp(toExp);
          return;
        }

        // smoothstep-ish easing
        const eased = t * t * (3 - 2 * t);
        setScaleExp(fromExp + delta * eased);
        requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    },
    [SCENE_EXPONENTS, scaleExp, setScaleExp]
  );

  // -------- focus helper ----------
  const focusScene = useCallback(
    (sceneKey, { immediate = false } = {}) => {
      const cam = cameraRef.current;
      const controls = controlsRef?.current;
      if (!cam) return;

      const cp = SCENE_CHECKPOINTS[sceneKey];
      if (!cp) return;

      const [px, py, pz] = cp.position;
      const [tx, ty, tz] = cp.target;

      pushLog(
        `FOCUS ${sceneKey}`,
        [cam.position.x, cam.position.y, cam.position.z],
        [px, py, pz]
      );

      if (controls) {
        controls.minDistance = cp.minDistance ?? 1;
        controls.maxDistance = cp.maxDistance ?? 1000;
      }

      if (immediate) {
        cam.position.set(px, py, pz);
        if (controls) {
          controls.target.set(tx, ty, tz);
          controls.update();
        } else {
          cam.lookAt(tx, ty, tz);
        }
        return;
      }

      const tl = gsap.timeline();
      tl.to(
        cam.position,
        {
          x: px,
          y: py,
          z: pz,
          duration: 1.0,
          ease: "power2.inOut",
        },
        0
      );

      if (controls) {
        const target = {
          x: controls.target.x,
          y: controls.target.y,
          z: controls.target.z,
        };
        tl.to(
          target,
          {
            x: tx,
            y: ty,
            z: tz,
            duration: 1.0,
            ease: "power2.inOut",
            onUpdate: () => {
              controls.target.set(target.x, target.y, target.z);
              controls.update();
            },
          },
          0
        );
      } else {
        tl.call(() => cam.lookAt(tx, ty, tz), [], 0.9);
      }

      return tl;
    },
    [cameraRef, controlsRef, pushLog]
  );

  // -------- sequence helpers ----------
  const getNextSceneKey = useCallback(() => {
    const idx = SCENE_SEQUENCE.indexOf(currentScale || "atom");
    if (idx === -1) return "dna";
    if (idx >= SCENE_SEQUENCE.length - 1) return null;
    return SCENE_SEQUENCE[idx + 1];
  }, [currentScale]);

  const getPrevSceneKey = useCallback(() => {
    const idx = SCENE_SEQUENCE.indexOf(currentScale || "atom");
    if (idx <= 0) return null;
    return SCENE_SEQUENCE[idx - 1];
  }, [currentScale]);

  // -------- zoom OUT to next scene ----------
  const zoomOutToNextScene = useCallback(() => {
    const cam = cameraRef.current;
    const controls = controlsRef?.current;
    const fadeMat = fadeMaterialRef?.current;
    const nextScene = getNextSceneKey();
    if (!cam || !nextScene) return;

    if (warpDirectionRef) warpDirectionRef.current = 1;

    const cpCurrent = SCENE_CHECKPOINTS[currentScale];
    const cpNext = SCENE_CHECKPOINTS[nextScene];
    if (!cpCurrent || !cpNext) return;

    const fadeUniform =
      fadeMat &&
      fadeMat.uniforms &&
      fadeMat.uniforms.uOpacity
        ? fadeMat.uniforms.uOpacity
        : null;

    let prevMin = null;
    let prevMax = null;
    if (controls) {
      prevMin = controls.minDistance;
      prevMax = controls.maxDistance;
      controls.minDistance = 0.1;
      controls.maxDistance = 10000;
      controls.enabled = false;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        if (controls) {
          controls.minDistance =
            cpNext.minDistance ?? (prevMin ?? 1);
          controls.maxDistance =
            cpNext.maxDistance ?? (prevMax ?? 1000);
          controls.enabled = true;
        }
        if (warpRef) warpRef.current = 0;
      },
    });

    const focusTl = focusScene(currentScale, { immediate: false });
    if (focusTl) tl.add(focusTl);

    const [cx, cy, cz] = cpCurrent.position;
    const [nx, ny, nz] = cpNext.position;

    const farOut1 = { x: cx, y: cy, z: cz + 1000 };
    const farOut2 = { x: nx, y: ny, z: nz - 1000 };

    pushLog(
      `OUT ${currentScale} -> far1`,
      [cx, cy, cz],
      [farOut1.x, farOut1.y, farOut1.z]
    );

    // --- Warp OUT starts here ---
    tl.addLabel("warpOutStart");

    // 🔹 Start SCALE ASYNC exactly when warp starts (no blocking)
    tl.add(
      () => {
        animateScale(currentScale, nextScene, 1.6);
      },
      "warpOutStart"
    );

    // cp → far1
    tl.to(
      cam.position,
      {
        x: farOut1.x,
        y: farOut1.y,
        z: farOut1.z,
        duration: 1.0,
        ease: "power3.in",
      },
      "warpOutStart"
    );

    // fade + warp lines up
    if (fadeUniform) {
      tl.to(
        fadeUniform,
        { value: 1.0, duration: 0.9, ease: "power2.in" },
        "warpOutStart"
      );
    }
    if (warpRef) {
      tl.to(
        warpRef,
        { current: 1.0, duration: 0.6, ease: "power2.in" },
        "warpOutStart"
      );
    }

    // Teleport to farOut2
    tl.add(() => {
      setCurrentScale(nextScene);
      cam.position.set(farOut2.x, farOut2.y, farOut2.z);
      pushLog(
        "TELEPORT far1 -> far2",
        [farOut1.x, farOut1.y, farOut1.z],
        [cam.position.x, cam.position.y, cam.position.z]
      );

      if (controls) {
        controls.target.set(0, 0, 0);
        controls.update();
      } else {
        cam.lookAt(0, 0, 0);
      }
    });

    const [tx, ty, tz] = cpNext.target;

    pushLog(
      `OUT far2 -> ${nextScene}`,
      [farOut2.x, farOut2.y, farOut2.z],
      [nx, ny, nz]
    );

    // far2 → cpNext
    tl.to(cam.position, {
      x: nx,
      y: ny,
      z: nz,
      duration: 1.2,
      ease: "power3.out",
    });

    if (controls) {
      const target = {
        x: controls.target.x,
        y: controls.target.y,
        z: controls.target.z,
      };
      tl.to(
        target,
        {
          x: tx,
          y: ty,
          z: tz,
          duration: 1.5,
          ease: "power3.out",
          onUpdate: () => {
            controls.target.set(target.x, target.y, target.z);
            controls.update();
          },
        },
        "<"
      );
    } else {
      tl.call(() => cam.lookAt(tx, ty, tz), [], "-=0.2");
    }

    // fade + warp down
    if (fadeUniform) {
      tl.to(
        fadeUniform,
        { value: 0.0, duration: 0.8, ease: "power2.out" },
        "-=0.8"
      );
    }
    if (warpRef) {
      tl.to(
        warpRef,
        { current: 0.0, duration: 0.6, ease: "power2.out" },
        "-=1.0"
      );
    }
  }, [
    cameraRef,
    controlsRef,
    fadeMaterialRef,
    warpRef,
    currentScale,
    getNextSceneKey,
    focusScene,
    setCurrentScale,
    pushLog,
    animateScale,
  ]);

  // -------- zoom IN to previous scene ----------
  const zoomInToPrevScene = useCallback(() => {
    const cam = cameraRef.current;
    const controls = controlsRef?.current;
    const fadeMat = fadeMaterialRef?.current;
    const prevScene = getPrevSceneKey();
    if (!cam || !prevScene) return;

    if (warpDirectionRef) warpDirectionRef.current = -1;

    const cpCurrent = SCENE_CHECKPOINTS[currentScale];
    const cpPrev = SCENE_CHECKPOINTS[prevScene];
    if (!cpCurrent || !cpPrev) return;

    const fadeUniform =
      fadeMat &&
      fadeMat.uniforms &&
      fadeMat.uniforms.uOpacity
        ? fadeMat.uniforms.uOpacity
        : null;

    let prevMin = null;
    let prevMax = null;
    if (controls) {
      prevMin = controls.minDistance;
      prevMax = controls.maxDistance;
      controls.minDistance = 0.1;
      controls.maxDistance = 10000;
      controls.enabled = false;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        if (controls) {
          controls.minDistance =
            cpPrev.minDistance ?? (prevMin ?? 1);
          controls.maxDistance =
            cpPrev.maxDistance ?? (prevMax ?? 1000);
          controls.enabled = true;
        }
        if (warpRef) warpRef.current = 0;
      },
    });

    const focusTl = focusScene(currentScale, { immediate: false });
    if (focusTl) tl.add(focusTl);

    const [cx, cy, cz] = cpCurrent.position;
    const [px, py, pz] = cpPrev.position;

    const farOut1 = { x: cx, y: cy, z: cz - 1000 };
    const farOut2 = { x: px, y: py, z: pz + 1000 };

    pushLog(
      `IN ${currentScale} -> far1`,
      [cx, cy, cz],
      [farOut1.x, farOut1.y, farOut1.z]
    );

    // --- Warp IN begins (mirror of OUT) ---
    tl.addLabel("warpInStart");

    // 🔹 Start scale animation async at same warp start
    tl.add(
      () => {
        animateScale(currentScale, prevScene, 1.6);
      },
      "warpInStart"
    );

    // cp → far1 (reverse)
    tl.to(
      cam.position,
      {
        x: farOut1.x,
        y: farOut1.y,
        z: farOut1.z,
        duration: 1.0,
        ease: "power3.in",
      },
      "warpInStart"
    );

    if (fadeUniform) {
      tl.to(
        fadeUniform,
        { value: 1.0, duration: 0.9, ease: "power2.in" },
        "warpInStart"
      );
    }
    if (warpRef) {
      tl.to(
        warpRef,
        { current: 1.0, duration: 0.6, ease: "power2.in" },
        "warpInStart"
      );
    }

    // teleport at farOut peak
    tl.add(() => {
      setCurrentScale(prevScene);
      cam.position.set(farOut2.x, farOut2.y, farOut2.z);
      pushLog(
        "TELEPORT far1 -> far2",
        [farOut1.x, farOut1.y, farOut1.z],
        [cam.position.x, cam.position.y, cam.position.z]
      );

      if (controls) {
        controls.target.set(0, 0, 0);
        controls.update();
      } else {
        cam.lookAt(0, 0, 0);
      }
    });

    const [tx, ty, tz] = cpPrev.target;

    pushLog(
      `IN far2 -> ${prevScene}`,
      [farOut2.x, farOut2.y, farOut2.z],
      [px, py, pz]
    );

    // far2 → cpPrev
    tl.to(cam.position, {
      x: px,
      y: py,
      z: pz,
      duration: 1.2,
      ease: "power3.out",
    });

    if (controls) {
      const target = {
        x: controls.target.x,
        y: controls.target.y,
        z: controls.target.z,
      };
      tl.to(
        target,
        {
          x: tx,
          y: ty,
          z: tz,
          duration: 1.2,
          ease: "power3.out",
          onUpdate: () => {
            controls.target.set(target.x, target.y, target.z);
            controls.update();
          },
        },
        "<"
      );
    } else {
      tl.call(() => cam.lookAt(tx, ty, tz), [], "-=0.2");
    }

    if (fadeUniform) {
      tl.to(
        fadeUniform,
        { value: 0.0, duration: 0.8, ease: "power2.out" },
        "-=0.8"
      );
    }
    if (warpRef) {
      tl.to(
        warpRef,
        { current: 0.0, duration: 0.6, ease: "power2.out" },
        "-=1.0"
      );
    }
  }, [
    cameraRef,
    controlsRef,
    fadeMaterialRef,
    warpRef,
    currentScale,
    getPrevSceneKey,
    focusScene,
    setCurrentScale,
    pushLog,
    animateScale,
  ]);

  return {
    zoomOutToNextScene,
    zoomInToPrevScene,
    focusScene,
    logs,
  };
}