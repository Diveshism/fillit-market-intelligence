'use client';

import { Html, OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { SectorRow } from '@/lib/types';
import { num, pct } from '@/lib/format';

/**
 * Effort and yield as one solid, per industry.
 *
 * Each block's footprint is the share of visits that industry took, and its
 * height is the green rate it returned. Contracting is a broad, flat slab;
 * metals is a narrow tower. The comparison a 2D bar chart has to make twice,
 * this makes once.
 *
 * Footprint uses the square root of the company count so a 209-company industry
 * sits beside a 5-company one without erasing it; the ordering is preserved.
 */

const HEIGHT_SCALE = 3.5;
const WIDTH_SCALE = 0.115;
const GAP = 0.07;
const DEPTH = 0.62;

function Block({
  sector,
  x,
  width,
  average,
  active,
  onHover,
  onSelect,
  index,
}: {
  sector: SectorRow;
  x: number;
  width: number;
  average: number;
  active: boolean;
  onHover: (s: SectorRow | null) => void;
  onSelect: (s: SectorRow) => void;
  index: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const started = useRef<number | null>(null);
  const target = (sector.green_rate / 100) * HEIGHT_SCALE;

  const colour = useMemo(() => {
    const strong = sector.green_rate >= average;
    return new THREE.Color(strong ? '#05AF52' : '#6B7076');
  }, [sector.green_rate, average]);

  useFrame((state, delta) => {
    const node = mesh.current;
    if (!node) return;
    if (started.current === null) started.current = state.clock.elapsedTime;

    // Grow out of the baseline, staggered left to right.
    const t = state.clock.elapsedTime - started.current - index * 0.07;
    const p = THREE.MathUtils.clamp(t / 0.9, 0, 1);
    const eased = 1 - Math.pow(1 - p, 3);

    const lift = active ? 1.06 : 1;
    const k = 1 - Math.exp(-9 * delta);
    const h = Math.max(0.001, target * eased * lift);

    node.scale.y = THREE.MathUtils.lerp(node.scale.y, h, k);
    node.position.y = node.scale.y / 2;
  });

  return (
    <group position={[x, 0, 0]}>
      <mesh
        ref={mesh}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(sector);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = '';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(sector);
        }}
        castShadow
      >
        <boxGeometry args={[width, 1, DEPTH]} />
        <meshStandardMaterial
          color={colour}
          emissive={colour}
          emissiveIntensity={active ? 0.32 : 0.04}
          roughness={0.46}
          metalness={0.08}
        />
      </mesh>

      {active && (
        <Html position={[0, target + 0.45, 0]} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <div className="w-52 border border-hairline bg-paper/95 p-3 shadow-sm">
            <p className="font-display text-[0.8125rem] font-600 leading-tight text-ink">
              {sector.sector}
            </p>
            <dl className="mt-2 space-y-1 text-[0.6875rem]">
              <div className="flex justify-between gap-3">
                <dt className="text-graphite">Companies visited</dt>
                <dd className="tnum font-600 text-ink">{num(sector.companies)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-graphite">Green rate</dt>
                <dd className="tnum font-600" style={{ color: `#${colour.getHexString()}` }}>
                  {pct(sector.green_rate, 1)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-graphite">Hot · Warm · Cold</dt>
                <dd className="tnum text-graphite">{sector.hot} · {sector.warm} · {sector.cold}</dd>
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

export default function SectorBars({
  sectors,
  average,
  activeSector,
  onHover,
  onSelect,
}: {
  sectors: SectorRow[];
  average: number;
  activeSector: string | null;
  onHover: (s: SectorRow | null) => void;
  onSelect: (s: SectorRow) => void;
}) {
  const laid = useMemo(() => {
    const widths = sectors.map((s) => Math.sqrt(s.companies) * WIDTH_SCALE);
    const total = widths.reduce((t, w) => t + w, 0) + GAP * (sectors.length - 1);
    let cursor = -total / 2;
    return sectors.map((sector, i) => {
      const width = widths[i];
      const x = cursor + width / 2;
      cursor += width + GAP;
      return { sector, x, width };
    });
  }, [sectors]);

  const averageY = (average / 100) * HEIGHT_SCALE;
  const span = laid.reduce((t, l) => t + l.width, 0) + GAP * (laid.length - 1) + 0.5;

  return (
    <>
      <color attach="background" args={['#FFFFFF']} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 7, 5]} intensity={1.15} castShadow />
      <directionalLight position={[-5, 3, -4]} intensity={0.32} />

      <group position={[0, -1.15, 0]}>
        {laid.map((l, i) => (
          <Block
            key={l.sector.sector}
            sector={l.sector}
            x={l.x}
            width={l.width}
            average={average}
            active={activeSector === l.sector.sector}
            onHover={onHover}
            onSelect={onSelect}
            index={i}
          />
        ))}

        {/* One baseline, no gridlines. */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.004, 0]}>
          <planeGeometry args={[span, DEPTH + 0.5]} />
          <meshBasicMaterial color="#E3E3E3" transparent opacity={0.4} />
        </mesh>

        {/* The programme-wide green rate, as a single reference line. */}
        <mesh position={[0, averageY, DEPTH / 2 + 0.02]}>
          <boxGeometry args={[span, 0.012, 0.012]} />
          <meshBasicMaterial color="#8D2635" />
        </mesh>
      </group>

      <OrbitControls
        enablePan={false}
        target={[0, 0.35, 0]}
        minDistance={4}
        maxDistance={12}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2.15}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}
