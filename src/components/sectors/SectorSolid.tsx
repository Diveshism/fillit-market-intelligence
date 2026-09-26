'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import type { SectorRow } from '@/lib/types';
import { useSceneGate } from '@/components/three/useSceneGate';
import SceneShell from '@/components/three/SceneShell';
import { GrowBar } from '@/components/ui/motion';
import { num, pct } from '@/lib/format';

const SectorBars = dynamic(() => import('@/components/three/SectorBars'), { ssr: false });

export default function SectorSolid({
  sectors,
  average,
}: {
  sectors: SectorRow[];
  average: number;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const { show3d } = useSceneGate(holder);
  const [active, setActive] = useState<string | null>(null);
  const router = useRouter();

  const open = (s: SectorRow) => router.push(`/companies?sector=${encodeURIComponent(s.sector)}`);

  return (
    <figure>
      <div
        ref={holder}
        className="relative h-[22rem] w-full overflow-hidden border border-hairline bg-paper md:h-[28rem]"
      >
        {show3d ? (
          <SceneShell
            label="Effort and yield"
            camera={{ position: [0.35, 1.7, 5.6], fov: 40 }}
            shadows
            frameloop="always"
            fallback={<Fallback sectors={sectors} average={average} onSelect={open} />}
          >
            <SectorBars
              sectors={sectors}
              average={average}
              activeSector={active}
              onHover={(s) => setActive(s?.sector ?? null)}
              onSelect={open}
            />
          </SceneShell>
        ) : (
          <Fallback sectors={sectors} average={average} onSelect={open} />
        )}

        {show3d && (
          <p className="pointer-events-none absolute bottom-3 left-4 text-[0.6875rem] uppercase tracking-[0.08em] text-graphite/70">
            Drag to orbit · hover a block · select to open its companies
          </p>
        )}
      </div>

      <figcaption className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.75rem] text-graphite">
        <span>Block width = companies visited.</span>
        <span>Height = green rate.</span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="inline-block h-[2px] w-5 bg-red" />
          Programme average, {pct(average, 1)}
        </span>
      </figcaption>
    </figure>
  );
}

/** 2D fallback — the same two measures, side by side. */
function Fallback({
  sectors,
  average,
  onSelect,
}: {
  sectors: SectorRow[];
  average: number;
  onSelect: (s: SectorRow) => void;
}) {
  const maxGreen = Math.max(...sectors.map((s) => s.green_rate));
  const maxCompanies = Math.max(...sectors.map((s) => s.companies));

  return (
    <div className="h-full overflow-y-auto p-5">
      <p className="eyebrow mb-4">Green rate by industry</p>
      <ul className="space-y-3">
        {sectors.map((s) => (
          <li key={s.sector}>
            <button type="button" onClick={() => onSelect(s)} className="block w-full text-left">
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-[0.8125rem] text-ink">{s.sector}</span>
                <span
                  className="tnum shrink-0 text-[0.8125rem] font-600"
                  style={{ color: s.green_rate >= average ? '#05AF52' : '#6B7076' }}
                >
                  {pct(s.green_rate, 1)}
                </span>
              </span>
              <GrowBar
                className="mt-1.5"
                height={10}
                value={(s.green_rate / maxGreen) * 100}
                color={s.green_rate >= average ? '#05AF52' : '#6B7076'}
              />
              <span className="source-line mt-1 block">
                {num(s.companies)} visited · {pct((s.companies / maxCompanies) * 100, 0)} of the
                largest industry
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
