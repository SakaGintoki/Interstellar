import React, { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Tube } from '@react-three/drei'
import * as THREE from 'three'

const STRAND_COUNT = 250 
const STRAND_LENGTH = 100 
const HELIX_RADIUS = 0.8
const HELIX_TURNS = 10
const TUBE_RADIUS = 0.05 
const BASE_RADIUS = 0.05 
const BOND_RADIUS = 0.02

const sphereGeometry = new THREE.SphereGeometry(BASE_RADIUS, 16, 16);
const cylinderGeometry = new THREE.CylinderGeometry(BOND_RADIUS, BOND_RADIUS, 1, 8);


function DnaScene() {
  const dnaGroupRef = useRef() 
  const basesRef = useRef()    
  const bondsRef = useRef()    
  const dummy = useMemo(() => new THREE.Object3D(), []) 

  const curve = useMemo(() => {
    class HelixCurve extends THREE.Curve {
      getPoint(t) {
        const s = t * STRAND_LENGTH - STRAND_LENGTH / 2 
        const angle = t * Math.PI * 2 * HELIX_TURNS 
        const x = Math.cos(angle) * HELIX_RADIUS
        const y = s
        const z = Math.sin(angle) * HELIX_RADIUS
        return new THREE.Vector3(x, y, z)
      }
    }
    return new HelixCurve()
  }, []) 

  const curveOffset = useMemo(() => {
    class OffsetHelixCurve extends THREE.Curve {
      getPoint(t) {
        const s = t * STRAND_LENGTH - STRAND_LENGTH / 2;
        const angle = (t * Math.PI * 2 * HELIX_TURNS) + Math.PI; 
        const x = Math.cos(angle) * HELIX_RADIUS;
        const y = s;
        const z = Math.sin(angle) * HELIX_RADIUS;
        return new THREE.Vector3(x, y, z);
      }
    }
    return new OffsetHelixCurve()
  }, [])

  const dnaElementData = useMemo(() => {
    const bases = [];
    const bonds = [];

    const pairs = [
      { c1: new THREE.Color(0xe63946), c2: new THREE.Color(0x457b9d) }, // Merah - Biru
      { c1: new THREE.Color(0x2a9d8f), c2: new THREE.Color(0xf4a261) }  // Hijau - Oranye/Kuning
    ];

    for (let i = 0; i < STRAND_COUNT; i++) {
      const t = i / (STRAND_COUNT - 1); 

      const p1 = curve.getPoint(t);
      const p2 = curveOffset.getPoint(t);

      
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      
      let color1, color2;
      if (Math.random() > 0.5) {
        color1 = pair.c1;
        color2 = pair.c2;
      } else {
        color1 = pair.c2;
        color2 = pair.c1;
      }
      
      bases.push({ position: p1, color: color1 });
      bases.push({ position: p2, color: color2 });

      const mid = p1.clone().lerp(p2, 0.5); 
      const bondLength = p1.distanceTo(p2); 

      dummy.position.copy(mid);
      dummy.lookAt(p2); 
      dummy.rotateX(Math.PI / 2); 
      dummy.scale.set(1, 1.5, bondLength); 
      dummy.updateMatrix();

      bonds.push({ matrix: dummy.matrix.clone(), color: new THREE.Color(0x333333) }); 
    }
    return { bases, bonds };
  }, [curve, curveOffset, dummy]);

  useEffect(() => {
    const basesMesh = basesRef.current;
    if (basesMesh) {
      const baseColorArray = new Float32Array(dnaElementData.bases.length * 3);
      dnaElementData.bases.forEach((data, i) => {
        dummy.position.copy(data.position);
        dummy.rotation.set(0, 0, 0); 
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        basesMesh.setMatrixAt(i, dummy.matrix);
        data.color.toArray(baseColorArray, i * 3);
      });
      basesMesh.instanceMatrix.needsUpdate = true;
      basesMesh.geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(baseColorArray, 3));
      basesMesh.geometry.attributes.instanceColor.needsUpdate = true;
    }

    const bondsMesh = bondsRef.current;
    if (bondsMesh) {
      const bondColorArray = new Float32Array(dnaElementData.bonds.length * 3);
      dnaElementData.bonds.forEach((data, i) => {
        bondsMesh.setMatrixAt(i, data.matrix);
        data.color.toArray(bondColorArray, i * 3);
      });
      bondsMesh.instanceMatrix.needsUpdate = true;
      bondsMesh.geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(bondColorArray, 3));
      bondsMesh.geometry.attributes.instanceColor.needsUpdate = true;
    }

  }, [dnaElementData]); 

  useFrame((state, delta) => {
    if (dnaGroupRef.current) {
      dnaGroupRef.current.rotation.y += delta * 0.1;
      dnaGroupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.05;
    }
  });

  return (
    <group ref={dnaGroupRef}>
      <ambientLight intensity={0.8} /> 
      <directionalLight position={[10, 20, 10]} intensity={2.5} color={0xffeedd} /> 
      <directionalLight position={[-10, -20, -10]} intensity={1.5} color={0xccddff} /> 
      <pointLight position={[0, STRAND_LENGTH / 2, HELIX_RADIUS * 3]} intensity={0.5} color={0xffffff} distance={10} />


      {/* STRANDS GULA-FOSFAT (Tube) (TIDAK BERUBAH) */}
<Tube args={[curve, STRAND_COUNT * 2, TUBE_RADIUS, 8, false]}>
          <meshStandardMaterial
        color="#ed672b"
          roughness={0.7}
          metalness={0.1}
          transparent
          opacity={0.8}
        />
      </Tube>
      <Tube args={[curveOffset, STRAND_COUNT * 2, TUBE_RADIUS, 8, false]}> 
        <meshStandardMaterial
        color="#0d92a3"
          roughness={0.7}
          metalness={0.1}
          transparent
          opacity={0.8}
        />
      </Tube>
      <instancedMesh ref={basesRef} args={[sphereGeometry, null, dnaElementData.bases.length]}>
        <meshStandardMaterial
        color="#39ffff"
          roughness={0.3}
          metalness={0.0}
          emissiveIntensity={0.2} 
        />
      </instancedMesh>

      <instancedMesh ref={bondsRef} args={[cylinderGeometry, null, dnaElementData.bonds.length]}>
        <meshStandardMaterial
          color="#b4598c"
          roughness={0.7}
          metalness={0.1}
        />
      </instancedMesh>
    </group>
  )
}

export default DnaScene