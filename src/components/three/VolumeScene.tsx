'use client';

import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

/**
 * The finding that changes the priority list, made physical.
 *
 * Three tanks, one per status, filled to the measured monthly litres each holds.
 * The Cold tank is the tallest by a wide margin — that is the whole argument, and
 * it reads on sight rather than from a caption. Heights are exactly proportional:
 * no scaling trick, because the shape of the number is the point.
 *
 * The single largest account is excluded, as it is everywhere on the site.
 */

const TANKS = [
  { key: 'Hot', colour: '#2E7D4F', x: -1.75 },
  { key: 'Warm', colour: '#7BA05B', x: 0 },
  { key: 'Cold', colour: '#B8C4A8', x: 1.75 },
] as const;

const MAX_HEIGHT = 3.2;
const RADIUS = 0.62;

function Tank({
  litres,
  max,
  colour,
  x,
  label,
  fill,
  emphasis,
}: {
  litres: number;
  max: number;
  colour: string;
  x: number;
  label: string;
  fill: number;
  emphasis: boolean;
}) {
  const body = useRef<THREE.Mesh>(null);
  const target = (litres / max) * MAX_HEIGHT;

  useFrame((_, delta) => {
    const node = body.current;
    if (!node) return;
    const k = 1 - Math.exp(-6 * delta);
    const h = THREE.MathUtils.lerp(node.scale.y, Math.max(0.001, target * fill), k);
    node.scale.y = h;
    node.position.y = h / 2;
  });

  return (
    <group position={[x, -MAX_HEIGHT / 2, 0]}>
      <mesh ref={body} position={[0, 0, 0]}>
        <cylinderGeometry args={[RADIUS * 0.95, RADIUS * 0.95, 1, 36]} />
        <meshStandardMaterial
          color={colour}
          roughness={0.34}
          metalness={0.08}
          emissive={colour}
          emissiveIntensity={emphasis ? 0.14 : 0}
        />
      </mesh>

      {/* Tank wall, drawn to the full scale so the empty headroom is visible. */}
      <mesh position={[0, MAX_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[RADIUS, RADIUS, MAX_HEIGHT, 36, 1, true]} />
        <meshStandardMaterial
          color="#D8D3CC"
          transparent
          opacity={0.2}
          roughness={0.1}
          metalness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, RADIUS, 36]} />
        <meshStandardMaterial color="#D8D3CC" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      <Text position={[0, -0.32, 0]} fontSize={0.2} color="#3D4650" anchorX="center" anchorY="middle">
        {label}
      </Text>
    </group>
  );
}

export default function VolumeScene({
  hot,
  warm,
  cold,
  fill = 1,
}: {
  hot: number;
  warm: number;
  cold: number;
  /** 0 → 1, drives the pour on scroll. */
  fill?: number;
}) {
  const max = Math.max(hot, warm, cold);
  const values = { Hot: hot, Warm: warm, Cold: cold } as const;

  return (
    <>
      <ambientLight intensity={0.82} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} />
      <directionalLight position={[-4, 2, -4]} intensity={0.35} />

      <group position={[0, 0.35, 0]} rotation={[0, -0.22, 0]}>
        {TANKS.map((t) => (
          <Tank
            key={t.key}
            litres={values[t.key]}
            max={max}
            colour={t.colour}
            x={t.x}
            label={t.key}
            fill={fill}
            emphasis={t.key === 'Cold'}
          />
        ))}
      </group>
    </>
  );
}
