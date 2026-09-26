'use client';

import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * One cube, one company — a 3D unit chart of the two lead sources.
 *
 * The 2D columns beside this show the rates. This shows the actual thing: the 500
 * addresses we were handed against the 136 we found, every one of them placed and
 * coloured by what it turned into. Both blocks use the same cube at the same pitch
 * and the same 2:1 aspect, so area reads as quantity: the planned block is nearly
 * four times the size and mostly red, the self-generated block small and mostly
 * green.
 *
 * Cubes are sorted so outcomes form horizontal bands, and rise into place from
 * below with a stagger, so the blocks assemble rather than appear.
 */

const GREEN = '#05AF52';
const OTHER = '#C6C6C6';
const DEAD = '#8D2635';

const CUBE = 0.15;
const PITCH = 0.185;

interface Block {
  label: string;
  columns: number;
  green: number;
  other: number;
  dead: number;
}

function buildBlock(block: Block, originX: number) {
  const total = block.green + block.other + block.dead;
  const positions: [number, number, number][] = [];
  const colours: THREE.Color[] = [];

  const green = new THREE.Color(GREEN);
  const other = new THREE.Color(OTHER);
  const dead = new THREE.Color(DEAD);

  for (let i = 0; i < total; i += 1) {
    const col = i % block.columns;
    const row = Math.floor(i / block.columns);
    positions.push([originX + col * PITCH, row * PITCH, 0]);
    colours.push(i < block.green ? green : i < block.green + block.other ? other : dead);
  }

  return { positions, colours, total, rows: Math.ceil(total / block.columns) };
}

function Cubes({
  block,
  originX,
  delayOffset,
}: {
  block: Block;
  originX: number;
  delayOffset: number;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const started = useRef<number | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const { positions, colours, total, rows } = useMemo(
    () => buildBlock(block, originX),
    [block, originX],
  );

  useFrame((state) => {
    const node = mesh.current;
    if (!node) return;
    if (started.current === null) started.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - started.current;

    if (!node.instanceColor) {
      const array = new Float32Array(total * 3);
      colours.forEach((c, i) => {
        array[i * 3] = c.r;
        array[i * 3 + 1] = c.g;
        array[i * 3 + 2] = c.b;
      });
      node.instanceColor = new THREE.InstancedBufferAttribute(array, 3);
    }

    for (let i = 0; i < total; i += 1) {
      const [x, y, z] = positions[i];
      // Each cube waits its turn, then eases up into place.
      const delay = delayOffset + (i / total) * 1.1;
      const p = THREE.MathUtils.clamp((t - delay) / 0.75, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);

      dummy.position.set(x, y * eased - (1 - eased) * 0.9, z);
      dummy.scale.setScalar(CUBE * eased);
      dummy.updateMatrix();
      node.setMatrixAt(i, dummy.matrix);
    }

    node.instanceMatrix.needsUpdate = true;
    if (node.instanceColor) node.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={mesh} args={[undefined, undefined, total]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.5} metalness={0.06} toneMapped={false} />
      </instancedMesh>

      <Text
        position={[originX + ((block.columns - 1) * PITCH) / 2, -0.42, 0]}
        fontSize={0.19}
        color="#1A1A1A"
        anchorX="center"
        anchorY="middle"
      >
        {block.label}
      </Text>
      <Text
        position={[originX + ((block.columns - 1) * PITCH) / 2, -0.68, 0]}
        fontSize={0.14}
        color="#5C5C5C"
        anchorX="center"
        anchorY="middle"
      >
        {`${block.green + block.other + block.dead} companies`}
      </Text>
    </group>
  );
}

interface Split {
  green: number;
  other: number;
  dead: number;
}

export default function LeadUnitChart({ self, planned }: { self: Split; planned: Split }) {
  // Columns are derived, not fixed, so the blocks stay square-ish and comparable
  // whatever the counts become: width ≈ 2 × height for both.
  const cols = (s: Split) => Math.round(Math.sqrt((s.green + s.other + s.dead) * 2));
  const selfBlock: Block = { label: 'Self-generated', columns: cols(self), ...self };
  const plannedBlock: Block = { label: 'The planned list', columns: cols(planned), ...planned };

  // Bottom-aligned, side by side, at the same cube size — so the size
  // difference between the two blocks is the true one.
  const selfWidth = (selfBlock.columns - 1) * PITCH;
  const plannedWidth = (plannedBlock.columns - 1) * PITCH;
  const gap = 0.7;
  const totalWidth = selfWidth + gap + plannedWidth;
  const startX = -totalWidth / 2;

  const rig = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!rig.current) return;
    // A slight tilt that follows the pointer, so the blocks read as solid.
    rig.current.rotation.y = THREE.MathUtils.lerp(rig.current.rotation.y, state.pointer.x * 0.22, 0.05);
    rig.current.rotation.x = THREE.MathUtils.lerp(rig.current.rotation.x, -0.12 + state.pointer.y * 0.1, 0.05);
  });

  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 6, 6]} intensity={1.1} />
      <directionalLight position={[-4, 2, -3]} intensity={0.3} />

      <group ref={rig} position={[0, -1.1, 0]}>
        <Cubes block={selfBlock} originX={startX} delayOffset={0.1} />
        <Cubes block={plannedBlock} originX={startX + selfWidth + gap} delayOffset={0.45} />
      </group>
    </>
  );
}
