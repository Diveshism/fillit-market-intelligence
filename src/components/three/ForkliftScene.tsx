'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

/**
 * The forklift moment — MASTER_PROMPT §4.4.
 *
 * A minimal low-poly forklift, built from primitives rather than a downloaded
 * asset so it carries no licence and costs nothing to load. It turns slowly while
 * the line pins: "A forklift cannot drive to a petrol station."
 */
export default function ForkliftScene() {
  const rig = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!rig.current) return;
    rig.current.rotation.y += delta * 0.22;
    rig.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.035;
  });

  const body = '#C91E2C';
  const dark = '#242126';
  const steel = '#41616F';

  return (
    <>
      <ambientLight intensity={0.72} />
      <directionalLight position={[4, 6, 5]} intensity={1.25} castShadow />
      <directionalLight position={[-5, 3, -4]} intensity={0.4} />
      <directionalLight position={[0, 2, -6]} intensity={0.25} />

      <group ref={rig} position={[0, -0.35, 0]} scale={1.05}>
        {/* counterweight and chassis */}
        <mesh position={[-0.55, 0.42, 0]}>
          <boxGeometry args={[1.25, 0.66, 1.1]} />
          <meshStandardMaterial color={body} roughness={0.5} metalness={0.15} />
        </mesh>
        <mesh position={[0.15, 0.3, 0]}>
          <boxGeometry args={[0.85, 0.42, 1.0]} />
          <meshStandardMaterial color={body} roughness={0.5} metalness={0.15} />
        </mesh>

        {/* operator seat and back rest */}
        <mesh position={[-0.42, 0.86, 0]}>
          <boxGeometry args={[0.46, 0.22, 0.6]} />
          <meshStandardMaterial color={dark} roughness={0.8} />
        </mesh>
        <mesh position={[-0.68, 1.06, 0]}>
          <boxGeometry args={[0.16, 0.44, 0.6]} />
          <meshStandardMaterial color={dark} roughness={0.8} />
        </mesh>

        {/* overhead guard */}
        {[
          [-0.92, 0.42],
          [-0.92, -0.42],
          [-0.1, 0.42],
          [-0.1, -0.42],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 1.32, z]}>
            <boxGeometry args={[0.07, 1.0, 0.07]} />
            <meshStandardMaterial color={dark} roughness={0.6} metalness={0.3} />
          </mesh>
        ))}
        <mesh position={[-0.5, 1.84, 0]}>
          <boxGeometry args={[1.0, 0.07, 1.0]} />
          <meshStandardMaterial color={dark} roughness={0.6} metalness={0.3} />
        </mesh>

        {/* mast */}
        {[-0.22, 0.22].map((z) => (
          <mesh key={z} position={[0.62, 1.0, z]}>
            <boxGeometry args={[0.1, 2.0, 0.12]} />
            <meshStandardMaterial color={steel} roughness={0.42} metalness={0.45} />
          </mesh>
        ))}
        <mesh position={[0.62, 1.95, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.56]} />
          <meshStandardMaterial color={steel} roughness={0.42} metalness={0.45} />
        </mesh>

        {/* carriage and forks */}
        <mesh position={[0.68, 0.5, 0]}>
          <boxGeometry args={[0.08, 0.5, 0.62]} />
          <meshStandardMaterial color={steel} roughness={0.42} metalness={0.45} />
        </mesh>
        {[-0.2, 0.2].map((z) => (
          <group key={z}>
            <mesh position={[0.95, 0.28, z]}>
              <boxGeometry args={[0.62, 0.05, 0.13]} />
              <meshStandardMaterial color="#8d8d8d" roughness={0.35} metalness={0.7} />
            </mesh>
            <mesh position={[0.68, 0.38, z]}>
              <boxGeometry args={[0.06, 0.24, 0.13]} />
              <meshStandardMaterial color="#8d8d8d" roughness={0.35} metalness={0.7} />
            </mesh>
          </group>
        ))}

        {/* wheels */}
        {[
          [0.34, 0.5],
          [0.34, -0.5],
          [-0.86, 0.44],
          [-0.86, -0.44],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.2, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.17, 18]} />
            <meshStandardMaterial color={dark} roughness={0.88} />
          </mesh>
        ))}

        {/* ground shadow disc */}
        <mesh position={[-0.2, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.5, 32]} />
          <meshBasicMaterial color="#242126" transparent opacity={0.07} />
        </mesh>
      </group>
    </>
  );
}
