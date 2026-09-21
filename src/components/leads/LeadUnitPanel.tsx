'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { useSceneGate } from '@/components/three/useSceneGate';
import SceneShell from '@/components/three/SceneShell';
import { num } from '@/lib/format';

const LeadUnitChart = dynamic(() => import('@/components/three/LeadUnitChart'), { ssr: false });

interface Split {
  green: number;
  other: number;
  dead: number;
}

export default function LeadUnitPanel({ self, planned }: { self: Split; planned: Split }) {
  const holder = useRef<HTMLDivElement>(null);
  const { show3d } = useSceneGate(holder);

  return (
    <figure>
      <div ref={holder} className="relative h-[20rem] w-full overflow-hidden border border-hairline bg-white/40 md:h-[26rem]">
        {show3d ? (
          <SceneShell
            label="Every company, one cube"
            camera={{ position: [0, 0.6, 8.4], fov: 42 }}
            fallback={<Fallback self={self} planned={planned} />}
          >
            <LeadUnitChart self={self} planned={planned} />
          </SceneShell>
        ) : (
          <Fallback self={self} planned={planned} />
        )}
      </div>

      <figcaption className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        <Key colour="#2E7D4F" label="Green — confirmed diesel user" />
        <Key colour="#C9B89C" label="Blocked or unresolved" />
        <Key colour="#B33A3A" label="Dead end" />
        <span className="source-line ml-auto">One cube is one company.</span>
      </figcaption>
    </figure>
  );
}

function Key({ colour, label }: { colour: string; label: string }) {
  return (
    <span className="flex items-center gap-2 text-[0.75rem] text-graphite">
      <span aria-hidden className="inline-block h-2.5 w-2.5" style={{ backgroundColor: colour }} />
      {label}
    </span>
  );
}

/** 2D fallback — the same two blocks, as stacked proportion bars. */
function Fallback({ self, planned }: { self: Split; planned: Split }) {
  const rows = [
    { label: 'Self-generated', split: self },
    { label: 'The planned list', split: planned },
  ];
  const max = Math.max(
    self.green + self.other + self.dead,
    planned.green + planned.other + planned.dead,
  );

  return (
    <div className="flex h-full flex-col justify-center gap-8 p-6">
      {rows.map((r) => {
        const total = r.split.green + r.split.other + r.split.dead;
        return (
          <div key={r.label}>
            <div className="flex items-baseline justify-between">
              <span className="text-[0.875rem] font-600 text-ink">{r.label}</span>
              <span className="tnum text-[0.875rem] text-graphite">{num(total)} companies</span>
            </div>
            <div className="mt-2 flex h-8" style={{ width: `${(total / max) * 100}%` }}>
              <span style={{ width: `${(r.split.green / total) * 100}%`, backgroundColor: '#2E7D4F' }} />
              <span style={{ width: `${(r.split.other / total) * 100}%`, backgroundColor: '#C9B89C' }} />
              <span style={{ width: `${(r.split.dead / total) * 100}%`, backgroundColor: '#B33A3A' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
