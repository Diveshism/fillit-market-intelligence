'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import { useRef, useState } from 'react';
import { useSceneGate } from '@/components/three/useSceneGate';
import SceneShell from '@/components/three/SceneShell';
import { ConfidenceBadge } from '@/components/ui/Badges';
import CountUp from '@/components/ui/CountUp';
import { num, pct } from '@/lib/format';
import type { Volume } from '@/lib/types';

const VolumeScene = dynamic(() => import('@/components/three/VolumeScene'), { ssr: false });

export default function VolumePanel({
  volume,
  averages,
}: {
  volume: Volume;
  averages: { hot: number; warm: number; cold: number };
}) {
  const holder = useRef<HTMLDivElement>(null);
  const { show3d } = useSceneGate(holder);
  const [fill, setFill] = useState(0);

  const { scrollYProgress } = useScroll({ target: holder, offset: ['start end', 'center center'] });
  useMotionValueEvent(scrollYProgress, 'change', (v) => setFill(Math.min(1, v * 1.15)));

  const multiple = averages.hot > 0 ? averages.cold / averages.hot : 0;

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
      <div ref={holder} className="relative h-[22rem] w-full overflow-hidden md:h-[28rem]">
        {show3d ? (
          <SceneShell
            label="Measured volume"
            camera={{ position: [0, 0.4, 7.6], fov: 40 }}
            fallback={<FallbackBars volume={volume} />}
          >
            <VolumeScene hot={volume.hot} warm={volume.warm} cold={volume.cold} fill={fill} />
          </SceneShell>
        ) : (
          <FallbackBars volume={volume} />
        )}
      </div>

      <div className="self-center">
        <div className="flex items-start justify-between gap-6">
          <p className="eyebrow eyebrow-rule">The finding that changes the priority list</p>
          <ConfidenceBadge level="VERIFIED" />
        </div>

        <h2 className="display mt-7 text-[clamp(1.75rem,3.6vw,2.75rem)]">
          <CountUp to={volume.cold_share_pct} decimals={0} suffix="%" /> of measured diesel sits in
          companies we scored Cold.
        </h2>

        <p className="mt-6 max-w-lg text-[1.0625rem] leading-relaxed text-graphite">
          Our own lead scoring was pointing at the wrong companies. Across the{' '}
          {num(volume.companies_with_volume - 1)} companies whose consumption converts to litres per
          month, the average Cold company uses{' '}
          <span className="tnum font-600 text-ink">{num(Math.round(averages.cold))} L</span> a month —{' '}
          <span className="font-600 text-ink">{multiple.toFixed(1)}×</span> a Hot one.
        </p>

        <dl className="mt-8 grid grid-cols-3 gap-6 border-t border-hairline pt-6">
          {([
            ['Hot', volume.hot, averages.hot, '#2E7D4F'],
            ['Warm', volume.warm, averages.warm, '#7BA05B'],
            ['Cold', volume.cold, averages.cold, '#8FA37C'],
          ] as const).map(([label, litres, avg, colour]) => (
            <div key={label}>
              <dt className="eyebrow" style={{ color: colour }}>{label}</dt>
              <dd className="tnum mt-2 font-display text-[1.375rem] font-600 tracking-display text-ink">
                {num(litres)}
              </dd>
              <p className="source-line mt-1">
                {pct((litres / volume.measured_excl_largest) * 100, 1)} · avg {num(Math.round(avg))} L
              </p>
            </div>
          ))}
        </dl>

        <div className="mt-8 border-l-2 border-red bg-red-wash p-5">
          <p className="text-[0.9375rem] leading-relaxed text-ink">
            {volume.largest_account} is excluded from every figure above. At{' '}
            <span className="tnum font-600">{num(volume.largest_account_lpm)} L</span> a month it alone
            would outweigh everything else combined.
          </p>
        </div>

        <Link
          href="/volume"
          className="mt-8 inline-flex items-center gap-2 text-[0.75rem] font-600 uppercase tracking-[0.1em] text-ink underline decoration-red decoration-2 underline-offset-[6px]"
        >
          See the ranked accounts <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

/** 2D fallback — the same three measured pools. */
function FallbackBars({ volume }: { volume: Volume }) {
  const max = Math.max(volume.hot, volume.warm, volume.cold);
  const rows = [
    { label: 'Hot', value: volume.hot, colour: '#2E7D4F' },
    { label: 'Warm', value: volume.warm, colour: '#7BA05B' },
    { label: 'Cold', value: volume.cold, colour: '#B8C4A8' },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-6 p-6">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex items-baseline justify-between">
            <span className="text-[0.875rem] font-600 text-ink">{r.label}</span>
            <span className="tnum text-[0.875rem] text-graphite">{num(r.value)} L</span>
          </div>
          <div className="mt-2 h-6 w-full bg-hairline/40">
            <div className="h-full" style={{ width: `${(r.value / max) * 100}%`, backgroundColor: r.colour }} />
          </div>
        </div>
      ))}
    </div>
  );
}
