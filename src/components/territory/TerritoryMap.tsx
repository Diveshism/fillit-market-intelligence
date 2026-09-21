'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import type { ZoneRow } from '@/lib/types';
import { useSceneGate } from '@/components/three/useSceneGate';
import SceneShell from '@/components/three/SceneShell';
import { num, pct } from '@/lib/format';

const TerritoryScene = dynamic(() => import('@/components/three/TerritoryScene'), { ssr: false });

export default function TerritoryMap({ zones }: { zones: ZoneRow[] }) {
  const holder = useRef<HTMLDivElement>(null);
  const { show3d } = useSceneGate(holder);
  const [active, setActive] = useState<string | null>(null);
  const router = useRouter();

  const open = (z: ZoneRow) => router.push(`/companies?zone=${encodeURIComponent(z.zone)}`);

  const ranked = [...zones].sort((a, b) => b.green_rate - a.green_rate);
  const maxRate = Math.max(...zones.map((z) => z.green_rate));

  return (
    <div className="grid gap-10 lg:grid-cols-[1.45fr_1fr] lg:gap-14">
      <div
        ref={holder}
        className="relative h-[24rem] w-full overflow-hidden border border-hairline bg-paper md:h-[32rem]"
      >
        {show3d ? (
          <SceneShell
            label="UAE territory"
            camera={{ position: [3.2, 7.4, 7.6], fov: 40 }}
            shadows
            frameloop="always"
            fallback={<FallbackMap zones={ranked} maxRate={maxRate} onSelect={open} />}
          >
            <TerritoryScene
              zones={zones}
              activeZone={active}
              onHover={(z) => setActive(z?.zone ?? null)}
              onSelect={open}
            />
          </SceneShell>
        ) : (
          <FallbackMap zones={ranked} maxRate={maxRate} onSelect={open} />
        )}

        {show3d && (
          <p className="pointer-events-none absolute bottom-3 left-4 text-[0.6875rem] uppercase tracking-[0.08em] text-graphite/70">
            Drag to orbit · scroll to zoom · select a zone to open its companies
          </p>
        )}
      </div>

      {/* Ranked panel — doubles as the accessible table of the same data. */}
      <div>
        <div className="flex items-baseline justify-between gap-4 border-b border-hairline pb-2">
          <p className="eyebrow">Areas covered</p>
          <div className="flex gap-5">
            <span className="eyebrow">Green</span>
            <span className="eyebrow">Companies</span>
          </div>
        </div>

        <ul>
          {ranked.map((z) => {
            const on = active === z.zone;
            return (
              <li key={z.zone}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(z.zone)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(z.zone)}
                  onBlur={() => setActive(null)}
                  onClick={() => open(z)}
                  className={`flex w-full items-center justify-between gap-4 border-b border-hairline/60 py-2.5 text-left transition-colors ${
                    on ? 'bg-red-wash' : ''
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      aria-hidden
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: ramp(z.green_rate, maxRate) }}
                    />
                    <span className="truncate text-[0.875rem] text-ink">{z.zone}</span>
                  </span>
                  <span className="flex shrink-0 gap-5">
                    <span
                      className="tnum w-14 text-right text-[0.875rem] font-600"
                      style={{ color: ramp(z.green_rate, maxRate) }}
                      data-numeric
                    >
                      {pct(z.green_rate, 1)}
                    </span>
                    <span className="tnum w-10 text-right text-[0.875rem] text-graphite" data-numeric>
                      {num(z.companies)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <ul className="mt-6 space-y-2 text-[0.75rem] text-graphite">
          <li className="flex items-center gap-2.5">
            <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full bg-[#2E7D4F]" />
            Higher green rate
          </li>
          <li className="flex items-center gap-2.5">
            <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full bg-steel" />
            Lower green rate
          </li>
          <li className="pt-1">Pillar height = companies visited.</li>
        </ul>
      </div>
    </div>
  );
}

function ramp(rate: number, max: number): string {
  const t = max > 0 ? Math.min(1, rate / max) : 0;
  const from = [65, 97, 111];
  const to = [46, 125, 79];
  const c = from.map((v, i) => Math.round(v + (to[i] - v) * t));
  return `rgb(${c.join(',')})`;
}

/** 2D fallback for small screens and reduced-motion visitors. */
function FallbackMap({
  zones,
  maxRate,
  onSelect,
}: {
  zones: ZoneRow[];
  maxRate: number;
  onSelect: (z: ZoneRow) => void;
}) {
  const maxN = Math.max(...zones.map((z) => z.companies));
  return (
    <div className="h-full overflow-y-auto p-5">
      <p className="eyebrow mb-4">Areas by companies visited</p>
      <ul className="space-y-3">
        {[...zones].sort((a, b) => b.companies - a.companies).map((z) => (
          <li key={z.zone}>
            <button
              type="button"
              onClick={() => onSelect(z)}
              className="block w-full text-left"
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-[0.8125rem] text-ink">{z.zone}</span>
                <span className="tnum shrink-0 text-[0.8125rem] font-600" style={{ color: ramp(z.green_rate, maxRate) }}>
                  {pct(z.green_rate, 1)}
                </span>
              </span>
              <span className="mt-1.5 block h-2.5 w-full bg-hairline/40">
                <span
                  className="block h-full"
                  style={{ width: `${(z.companies / maxN) * 100}%`, backgroundColor: ramp(z.green_rate, maxRate) }}
                />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
