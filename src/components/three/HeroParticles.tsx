'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Status } from '@/lib/types';

/**
 * The signature moment.
 *
 * One particle per company visited, coloured by its final status. On scroll
 * they migrate from an unordered cloud into six ordered clusters, then collapse
 * into the market-map funnel bar. Nothing is decorative: the cloud is the market
 * before the programme, the clusters are the triage, the bar is the result.
 *
 * The pointer pushes particles aside as it passes, and the camera eases forward
 * as the bar forms, so the sequence resolves rather than simply ending.
 *
 * Drawn as a single instanced mesh, so all 636 particles cost one draw call.
 */

const STATUS_COLORS: Record<Status, string> = {
  Hot: '#05AF52',
  Warm: '#4FBF7F',
  Cold: '#A9DCC0',
  Appointment: '#E0A020',
  Revisit: '#D9772B',
  Invalid: '#8D2635',
};

const ORDER: Status[] = ['Hot', 'Warm', 'Cold', 'Appointment', 'Revisit', 'Invalid'];

/** How far the pointer pushes, and how hard. */
const REPEL_RADIUS = 1.6;
const REPEL_FORCE = 1.15;

/** Deterministic PRNG so the cloud is identical on server and client. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Layouts {
  cloud: Float32Array;
  clusters: Float32Array;
  bar: Float32Array;
  colors: Float32Array;
  count: number;
}

function buildLayouts(counts: Record<Status, number>, total: number): Layouts {
  const rand = mulberry32(636);
  const cloud = new Float32Array(total * 3);
  const clusters = new Float32Array(total * 3);
  const bar = new Float32Array(total * 3);
  const colors = new Float32Array(total * 3);

  const BAR_WIDTH = 11;
  const CLUSTER_SPAN = 10.5;

  let i = 0;
  let cumulative = 0;

  ORDER.forEach((status, s) => {
    const n = counts[status];
    const colour = new THREE.Color(STATUS_COLORS[status]);

    // Cluster centre: six evenly spaced groups across the span.
    const cx = -CLUSTER_SPAN / 2 + (s / (ORDER.length - 1)) * CLUSTER_SPAN;
    // Radius grows with the square root of the count, so area reads as quantity.
    const radius = 0.32 + Math.sqrt(n) * 0.085;

    // Bar segment: width proportional to share of the whole book.
    const x0 = -BAR_WIDTH / 2 + (cumulative / total) * BAR_WIDTH;
    const x1 = -BAR_WIDTH / 2 + ((cumulative + n) / total) * BAR_WIDTH;
    cumulative += n;

    for (let k = 0; k < n; k += 1, i += 1) {
      const o = i * 3;

      // — unordered cloud, held in the upper band so it never crosses the headline
      cloud[o] = (rand() - 0.5) * 15;
      cloud[o + 1] = 1.2 + rand() * 2.4;
      cloud[o + 2] = (rand() - 0.5) * 7;

      // — six ordered clusters (sphere, rejection-free via spherical coords)
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const r = radius * Math.cbrt(rand());
      clusters[o] = cx + r * Math.sin(phi) * Math.cos(theta);
      clusters[o + 1] = r * Math.sin(phi) * Math.sin(theta) - 0.2;
      clusters[o + 2] = r * Math.cos(phi);

      // — the funnel bar
      bar[o] = x0 + rand() * Math.max(0.02, x1 - x0);
      bar[o + 1] = (rand() - 0.5) * 0.78 - 0.2;
      bar[o + 2] = (rand() - 0.5) * 0.3;

      colors[o] = colour.r;
      colors[o + 1] = colour.g;
      colors[o + 2] = colour.b;
    }
  });

  return { cloud, clusters, bar, colors, count: i };
}

export default function HeroParticles({
  counts,
  total,
  progress,
}: {
  counts: Record<Status, number>;
  total: number;
  /** 0 → 1 across the hero's scroll range. Read every frame, never re-renders. */
  progress: React.MutableRefObject<number>;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const { viewport, camera } = useThree();

  const layouts = useMemo(() => buildLayouts(counts, total), [counts, total]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const current = useMemo(() => Float32Array.from(layouts.cloud), [layouts]);
  const pointer = useMemo(() => new THREE.Vector2(), []);

  useLayoutEffect(() => {
    const node = mesh.current;
    if (!node) return;
    node.instanceColor = new THREE.InstancedBufferAttribute(layouts.colors, 3);
    node.instanceColor.needsUpdate = true;
  }, [layouts]);

  useFrame((state, delta) => {
    const node = mesh.current;
    if (!node) return;

    const p = THREE.MathUtils.clamp(progress.current, 0, 1);

    // Two-leg journey: cloud → clusters over the first half, clusters → bar over the second.
    const leg = p < 0.5 ? p / 0.5 : (p - 0.5) / 0.5;
    const eased = leg * leg * (3 - 2 * leg); // smoothstep
    const from = p < 0.5 ? layouts.cloud : layouts.clusters;
    const to = p < 0.5 ? layouts.clusters : layouts.bar;

    // Approach the target rather than snapping, so fast scrolling still reads as motion.
    const k = 1 - Math.exp(-7 * delta);
    const t = state.clock.elapsedTime;

    // Pointer position on the particles' plane, in the group's local space.
    pointer.set(
      (state.pointer.x * viewport.width) / 2,
      (state.pointer.y * viewport.height) / 2 - (group.current?.position.y ?? 0),
    );

    for (let i = 0; i < layouts.count; i += 1) {
      const o = i * 3;
      let tx = from[o] + (to[o] - from[o]) * eased;
      let ty = from[o + 1] + (to[o + 1] - from[o + 1]) * eased;
      const tz = from[o + 2] + (to[o + 2] - from[o + 2]) * eased;

      // The pointer pushes particles aside as it passes.
      const dx = tx - pointer.x;
      const dy = ty - pointer.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < REPEL_RADIUS * REPEL_RADIUS) {
        const d = Math.max(0.12, Math.sqrt(d2));
        const push = ((REPEL_RADIUS - d) / REPEL_RADIUS) * REPEL_FORCE;
        tx += (dx / d) * push;
        ty += (dy / d) * push;
      }

      // A little drift while dispersed; none once the bar has formed.
      const drift = (1 - p) * 0.06;
      current[o] = THREE.MathUtils.lerp(current[o], tx + Math.sin(t * 0.6 + i) * drift, k);
      current[o + 1] = THREE.MathUtils.lerp(current[o + 1], ty + Math.cos(t * 0.5 + i * 1.3) * drift, k);
      current[o + 2] = THREE.MathUtils.lerp(current[o + 2], tz, k);

      dummy.position.set(current[o], current[o + 1], current[o + 2]);
      const scale = 0.055 + (1 - p) * 0.012;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      node.setMatrixAt(i, dummy.matrix);
    }
    node.instanceMatrix.needsUpdate = true;

    // Slow parallax on pointer, and a gentle dolly as the bar resolves.
    if (group.current) {
      const mx = (state.pointer.x * viewport.width) / 26;
      const my = (state.pointer.y * viewport.height) / 26;
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, mx * 0.07, 0.04);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -my * 0.05, 0.04);
    }
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 13 - p * 2.2, 0.05);
  });

  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 5, 6]} intensity={0.9} />
      {/* Clusters and the bar form above the fold once the headline has scrolled away. */}
      <group ref={group} position={[0, 0.8, 0]}>
        <instancedMesh
          ref={mesh}
          args={[undefined, undefined, layouts.count]}
          frustumCulled={false}
        >
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            roughness={0.38}
            metalness={0.05}
            emissiveIntensity={0.22}
            toneMapped={false}
          />
        </instancedMesh>
      </group>
    </>
  );
}
