'use client';

import { Html, OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import geo from '@/data/uae_emirates.json';
import type { ZoneRow } from '@/lib/types';
import { num, pct } from '@/lib/format';

/* ------------------------------------------------------------------ *
 * Projection
 *
 * Equirectangular, centred on the researched corridor, with longitude
 * scaled by cos(latitude) so the emirates keep their true proportions.
 * ------------------------------------------------------------------ */

const CENTRE = { lng: 54.2, lat: 24.6 };
const SCALE = 2.15;
const COS = Math.cos((CENTRE.lat * Math.PI) / 180);

function project(lng: number, lat: number): [number, number] {
  return [(lng - CENTRE.lng) * COS * SCALE, (lat - CENTRE.lat) * SCALE];
}

/** Green rate → colour. Steel at zero, brand green at the top rate. */
const LOW = new THREE.Color('#6B7076');
const HIGH = new THREE.Color('#05AF52');

function rateColor(rate: number, maxRate: number): THREE.Color {
  const t = maxRate > 0 ? Math.min(1, rate / maxRate) : 0;
  return LOW.clone().lerp(HIGH, t);
}

/* ------------------------------------------------------------------ *
 * Emirate slabs
 * ------------------------------------------------------------------ */

type Ring = [number, number][];
interface Feature {
  properties: { name: string; covered?: boolean; neutral?: boolean };
  geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: number[][][] | number[][][][] };
}

function shapesFor(feature: Feature): THREE.Shape[] {
  const polygons: Ring[][] =
    feature.geometry.type === 'Polygon'
      ? [feature.geometry.coordinates as unknown as Ring[]]
      : (feature.geometry.coordinates as unknown as Ring[][]);

  return polygons.map((rings) => {
    const [outer, ...holes] = rings;
    const shape = new THREE.Shape();
    outer.forEach(([lng, lat], i) => {
      const [x, y] = project(lng, lat);
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
    for (const hole of holes) {
      const path = new THREE.Path();
      hole.forEach(([lng, lat], i) => {
        const [x, y] = project(lng, lat);
        if (i === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      });
      shape.holes.push(path);
    }
    return shape;
  });
}

function Emirates() {
  const features = (geo as unknown as { features: Feature[] }).features;

  const slabs = useMemo(
    () =>
      features
        .filter((f) => !f.properties.neutral)
        .map((f) => ({
          name: f.properties.name,
          covered: Boolean(f.properties.covered),
          geometry: new THREE.ExtrudeGeometry(shapesFor(f), {
            depth: f.properties.covered ? 0.19 : 0.1,
            bevelEnabled: false,
            curveSegments: 1,
          }),
        })),
    [features],
  );

  // Extruded geometries are not reference-counted by R3F; dispose them by hand.
  useEffect(() => () => slabs.forEach((s) => s.geometry.dispose()), [slabs]);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {slabs.map((slab) => (
        <mesh key={slab.name} geometry={slab.geometry} receiveShadow castShadow>
          <meshStandardMaterial
            color={slab.covered ? '#EDEDED' : '#E3E3E3'}
            roughness={0.94}
            metalness={0}
            polygonOffset
            polygonOffsetFactor={1}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * Zone pillars
 * ------------------------------------------------------------------ */

function Pillar({
  zone,
  maxN,
  maxRate,
  active,
  onHover,
  onSelect,
}: {
  zone: ZoneRow;
  maxN: number;
  maxRate: number;
  active: boolean;
  onHover: (z: ZoneRow | null) => void;
  onSelect: (z: ZoneRow) => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const [x, y] = project(zone.lng as number, zone.lat as number);

  // Height encodes companies visited. Square-rooted so a 3-company area stays
  // visible next to an 88-company one, while the ordering is preserved exactly.
  const height = 0.25 + (Math.sqrt(zone.companies) / Math.sqrt(maxN)) * 2.35;
  const color = useMemo(() => rateColor(zone.green_rate, maxRate), [zone.green_rate, maxRate]);

  useFrame((state, delta) => {
    const node = mesh.current;
    if (!node) return;
    const target = active ? 1.28 : 1;
    const k = 1 - Math.exp(-10 * delta);
    node.scale.x = THREE.MathUtils.lerp(node.scale.x, target, k);
    node.scale.z = THREE.MathUtils.lerp(node.scale.z, target, k);
    // The strongest zone breathes very slightly, to draw the eye first.
    if (zone.tier === 'work' && !active) {
      node.position.y = height / 2 + Math.sin(state.clock.elapsedTime * 1.6) * 0.012;
    }
  });

  return (
    <group position={[x, 0, -y]}>
      <mesh
        ref={mesh}
        position={[0, height / 2, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(zone);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = '';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(zone);
        }}
        castShadow
      >
        <cylinderGeometry args={[0.085, 0.085, height, 14]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 0.55 : 0.2}
          roughness={0.35}
          metalness={0.12}
        />
      </mesh>

      {/* Footprint ring, sized by companies visited. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.205, 0]}>
        <ringGeometry args={[0.1, 0.1 + (zone.companies / maxN) * 0.42, 24]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.55 : 0.28} side={THREE.DoubleSide} />
      </mesh>

      {active && (
        <Html
          position={[0, height + 0.32, 0]}
          center
          distanceFactor={9}
          zIndexRange={[20, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="w-52 border border-hairline bg-paper/97 p-3 shadow-sm">
            <p className="font-display text-[0.8125rem] font-600 leading-tight text-ink">
              {zone.zone}
            </p>
            <dl className="mt-2 space-y-1 text-[0.6875rem]">
              <div className="flex justify-between gap-3">
                <dt className="text-graphite">Companies visited</dt>
                <dd className="tnum font-600 text-ink">{num(zone.companies)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-graphite">Green rate</dt>
                <dd className="tnum font-600" style={{ color: `#${color.getHexString()}` }}>
                  {pct(zone.green_rate, 1)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-graphite">Blocked</dt>
                <dd className="tnum text-graphite">{num(zone.appointment)}</dd>
              </div>
            </dl>
            <p className="mt-2 border-t border-hairline pt-1.5 text-[0.625rem] uppercase tracking-[0.08em] text-graphite">
              Select to open the companies
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */

export default function TerritoryScene({
  zones,
  activeZone,
  onHover,
  onSelect,
}: {
  zones: ZoneRow[];
  activeZone: string | null;
  onHover: (z: ZoneRow | null) => void;
  onSelect: (z: ZoneRow) => void;
}) {
  const maxN = Math.max(...zones.map((z) => z.companies));
  const maxRate = Math.max(...zones.map((z) => z.green_rate));

  return (
    <>
      <color attach="background" args={['#FFFFFF']} />
      <fog attach="fog" args={['#FFFFFF', 14, 30]} />

      <ambientLight intensity={0.78} />
      <directionalLight position={[5, 9, 6]} intensity={1.15} castShadow />
      <directionalLight position={[-6, 4, -5]} intensity={0.3} />

      <Emirates />

      {zones.filter((z) => z.lat !== null && z.lng !== null).map((z) => (
        <Pillar
          key={z.zone}
          zone={z}
          maxN={maxN}
          maxRate={maxRate}
          active={activeZone === z.zone}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={16}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2.35}
        enableDamping
        dampingFactor={0.08}
        target={[1.4, 0, -1.2]}
      />
    </>
  );
}
