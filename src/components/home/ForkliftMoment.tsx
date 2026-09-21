'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRef } from 'react';
import { useSceneGate } from '@/components/three/useSceneGate';
import SceneShell from '@/components/three/SceneShell';
import { num } from '@/lib/format';

const ForkliftScene = dynamic(() => import('@/components/three/ForkliftScene'), { ssr: false });

/**
 * Deck slide 16 — the largest single group of all.
 * 66 companies raised equipment, generator or forklift refuelling, and none of
 * that equipment can be driven to a pump.
 */
export default function ForkliftMoment({
  companies,
  hot,
  warm,
  cold,
}: {
  companies: number;
  hot: number;
  warm: number;
  cold: number;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const { show3d } = useSceneGate(holder);

  return (
    <section className="on-ink">
      <div className="shell grid items-center gap-10 py-20 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:py-28">
        <div>
          <p className="eyebrow eyebrow-rule">The largest opening of all</p>
          <h2 className="display mt-7 max-w-lg text-[clamp(1.85rem,4.2vw,3rem)] text-paper">
            None of this equipment can be driven to a pump.
          </h2>
          <p className="mt-7 max-w-lg text-[1.0625rem] leading-relaxed text-paper/75">
            {num(companies)} companies raised forklift, generator or machinery refuelling — the
            biggest pain-point group in the entire book, and the one no station network can serve.
            It is a proposition competitors structurally cannot copy.
          </p>

          <dl className="mt-10 flex gap-10">
            <div>
              <dt className="eyebrow">Companies</dt>
              <dd className="display tnum mt-2.5 text-[2.5rem] leading-none text-paper">{num(companies)}</dd>
            </div>
            <div>
              <dt className="eyebrow">Hot</dt>
              <dd className="display tnum mt-2.5 text-[2.5rem] leading-none text-red">{num(hot)}</dd>
            </div>
            <div>
              <dt className="eyebrow">Warm</dt>
              <dd className="display tnum mt-2.5 text-[2.5rem] leading-none text-paper">{num(warm)}</dd>
            </div>
            <div>
              <dt className="eyebrow">Cold</dt>
              <dd className="display tnum mt-2.5 text-[2.5rem] leading-none text-paper/60">{num(cold)}</dd>
            </div>
          </dl>

          <Link
            href="/pain-points"
            className="mt-10 inline-flex items-center gap-2 text-[0.75rem] font-600 uppercase tracking-[0.1em] text-paper underline decoration-red decoration-2 underline-offset-[6px]"
          >
            What customers actually told us <span aria-hidden>→</span>
          </Link>
        </div>

        <div ref={holder} className="relative h-[20rem] w-full md:h-[26rem]">
          {show3d ? (
            <SceneShell
              label="Forklift"
              camera={{ position: [4.2, 2.4, 4.6], fov: 40 }}
              fallback={<ForkliftFallback />}
            >
              <ForkliftScene />
            </SceneShell>
          ) : (
            <ForkliftFallback />
          )}
        </div>
      </div>
    </section>
  );
}

/** Shown on small screens, under reduced motion, or if WebGL never comes up. */
function ForkliftFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="max-w-xs text-center text-[0.9375rem] leading-relaxed text-paper/55">
        A forklift refuels where it works. There is no pump it can reach.
      </p>
    </div>
  );
}
