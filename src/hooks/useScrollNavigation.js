import { useEffect } from 'react'
import { useSceneStore } from './useSceneStore'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollNavigation(cameraRef, fadeMaterialRef) {
  const totalScrollHeight = useSceneStore((state) => state.totalScrollHeight)
  const setCurrentScale = useSceneStore((state) => state.setCurrentScale)

  useEffect(() => {
    document.body.style.height = totalScrollHeight

    let tl = null
    let rafId = null

    const init = () => {
      if (!cameraRef.current || !fadeMaterialRef.current) {
        rafId = requestAnimationFrame(init)
        return
      }

      const camera = cameraRef.current
      const fadeMaterial = fadeMaterialRef.current

      if (!fadeMaterial.uniforms) {
        fadeMaterial.uniforms = { uOpacity: { value: 1.0 } }
      }
      if (!fadeMaterial.uniforms.uOpacity) {
        fadeMaterial.uniforms.uOpacity = { value: 1.0 }
      }

      gsap.set(fadeMaterial.uniforms.uOpacity, { value: 0.0 })

      tl = gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          ease: 'none',
        },
      })

      // --- 1. Atom Scene ---
      tl.addLabel('atom')
      tl.add(() => setCurrentScale('atom'), 'atom')
      tl.from(
        camera.position,
        {y: 0, z: 5, duration: 1, ease: 'power2.inOut' },
        'atom'
      )
      tl.from(
        camera.rotation,
        { x: 0, y: 0, z: 0, duration: 1, ease: 'power2.inOut' },
        'atom'
      )

      // --- Transition to DNA ---
      tl.addLabel('toDna')
      tl.to(
        fadeMaterial.uniforms.uOpacity,
        { value: 1.0, duration: 0.5, ease: 'power2.in' },
        'toDna'
      )
      tl.set(camera.position, { x: 0, y: 0, z: 15 }, 'toDna+=0.5')
      tl.set(
        camera.rotation,
        { x: Math.PI * 0.25, y: 0, z: 0 },
        'toDna+=0.5'
      )
      tl.to(
        fadeMaterial.uniforms.uOpacity,
        { value: 0.0, duration: 0.5, ease: 'power2.out' },
        'toDna+=0.5'
      )

      // --- 2. DNA Scene ---
      tl.addLabel('dna')
      tl.add(() => setCurrentScale('dna'), 'dna')
      tl.from(
        camera.position,
        { y: 5, z: 10, duration: 1.5, ease: 'power2.inOut' },
        'dna'
      )
      tl.from(
        camera.rotation,
        { x: Math.PI * 0.5, duration: 1.5, ease: 'power2.inOut' },
        'dna'
      )

      // --- Transition to Cell ---
      tl.addLabel('toCell')
      tl.to(
        fadeMaterial.uniforms.uOpacity,
        { value: 1.0, duration: 0.5, ease: 'power2.in' },
        'toCell'
      )
      tl.set(camera.position, { x: 0, y: 0, z: 15 }, 'toCell+=0.5')
      tl.set(
        camera.rotation,
        { x: 0, y: 0, z: 0 },
        'toCell+=0.5'
      )
      tl.to(
        fadeMaterial.uniforms.uOpacity,
        { value: 0.0, duration: 0.5, ease: 'power2.out' },
        'toCell+=0.5'
      )

      // --- 3. Cell Scene ---
      tl.addLabel('cell')
      tl.add(() => setCurrentScale('cell'), 'cell')
      tl.from(
        camera.position,
        { z: 10, duration: 1.5, ease: 'power2.inOut' },
        'cell'
      )
      tl.from(
        camera.rotation,
        { y: Math.PI * 0.5, duration: 1.5, ease: 'power2.inOut' },
        'cell'
      )

      // --- Transition to Earth ---
      tl.addLabel('toEarth')
      tl.to(
        fadeMaterial.uniforms.uOpacity,
        { value: 1.0, duration: 0.5, ease: 'power2.in' },
        'toEarth'
      )
      tl.set(camera.position, { x: 0, y: 0, z: 15 }, 'toEarth+=0.5')
      tl.to(
        fadeMaterial.uniforms.uOpacity,
        { value: 0.0, duration: 0.5, ease: 'power2.out' },
        'toEarth+=0.5'
      )

	  // --- 4. Earth Scene ---
	  tl.addLabel('earth')
	  tl.add(() => setCurrentScale('earth'), 'earth')

	  // 1) Start the Earth scene facing BACK (0 rad)
	  tl.set(camera.rotation, { x: 0, y: 0, z: 0 }, 'earth')

	  // 2) Zoom effect (same as yours)
	  tl.from(
		camera.position,
		{ z: 8, duration: 1.5, ease: 'power2.inOut' },
	    'earth'
	  )

	  tl.fromTo(
		camera.rotation,
		{ x: 0, y: Math.PI * 0.5, z: 0 },      // start at 180°
		{ y: 0, duration: 2.5, ease: 'power2.inOut' },  // end at 0°
	    'earth'
	  )

      // --- Transition to Solar System ---
      tl.addLabel('toSolar')
      tl.to(
        camera.position,
        { z: 100, duration: 1, ease: 'power4.in' },
        'toSolar'
      )
      tl.to(
        fadeMaterial.uniforms.uOpacity,
        { value: 1.0, duration: 0.5, ease: 'power2.in' },
        'toSolar+=0.5'
      )
      tl.set(
        camera.position,
        { x: 0, y: 50, z: 50 },
        'toSolar+=1.0'
      )
      tl.set(
        camera.rotation,
        { x: -Math.PI * 0.25, y: 0, z: 0 },
        'toSolar+=1.0'
      )
      tl.to(
        fadeMaterial.uniforms.uOpacity,
        { value: 0.0, duration: 0.5, ease: 'power2.out' },
        'toSolar+=1.0'
      )

      // --- 5. Solar System ---
      tl.addLabel('solar')
      tl.add(() => setCurrentScale('solar'), 'solar')
      tl.from(
        camera.position,
        { z: 30, duration: 1.5, ease: 'power2.inOut' },
        'solar'
      )

      // --- Transition to Galaxy ---
      tl.addLabel('toGalaxy')
      tl.to(
        camera.position,
        { z: 500, duration: 1, ease: 'power4.in' },
        'toGalaxy'
      )
      tl.to(
        fadeMaterial.uniforms.uOpacity,
        { value: 1.0, duration: 0.5, ease: 'power2.in' },
        'toGalaxy+=0.5'
      )
      tl.set(
        camera.position,
        { x: 0, y: 15, z: 40 },
        'toGalaxy+=1.0'
      )
      tl.set(
        camera.rotation,
        { x: 0, y: 0, z: 0 },
        'toGalaxy+=1.0'
      )
      tl.to(
        fadeMaterial.uniforms.uOpacity,
        { value: 0.0, duration: 0.5, ease: 'power2.out' },
        'toGalaxy+=1.0'
      )

      // --- 6. Galaxy Scene ---
      tl.addLabel('galaxy')
      tl.add(() => setCurrentScale('galaxy'), 'galaxy')
      tl.from(
        camera.position,
        { z: 20, duration: 1.5, ease: 'power2.inOut' },
        'galaxy'
      )
      tl.from(
        camera.rotation,
        { x: Math.PI * 0.1, duration: 1.5, ease: 'power2.inOut' },
        'galaxy'
      )

      // --- Transition to Universe ---
      tl.addLabel('toUniverse')
      tl.to(
        camera.position,
        { z: 100, duration: 1, ease: 'power4.in' },
        'toUniverse'
      )
      tl.to(
        fadeMaterial.uniforms.uOpacity,
        { value: 1.0, duration: 0.5, ease: 'power2.in' },
        'toUniverse+=0.5'
      )
      tl.set(
        camera.position,
        { x: 0, y: 0, z: 10 },
        'toUniverse+=1.0'
      )
      tl.set(
        camera.rotation,
        { x: 0, y: 0, z: 0 },
        'toUniverse+=1.0'
      )
      tl.to(
        fadeMaterial.uniforms.uOpacity,
        { value: 0.0, duration: 0.5, ease: 'power2.out' },
        'toUniverse+=1.0'
      )

      // --- 7. Universe Scene ---
      tl.addLabel('universe')
      tl.add(() => setCurrentScale('universe'), 'universe')
      tl.from(
        camera.position,
        { z: 5, duration: 1.5, ease: 'power2.inOut' },
        'universe'
      )
      tl.from(
        camera.rotation,
        { y: Math.PI * 0.5, duration: 1.5, ease: 'power2.inOut' },
        'universe'
      )
    }

    init()

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      ScrollTrigger.killAll()
      if (tl) tl.kill()
      document.body.style.height = ''
    }
  }, [cameraRef, fadeMaterialRef, totalScrollHeight, setCurrentScale])
}