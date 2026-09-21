'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useRef } from 'react';
import { useSceneGate } from '@/components/three/useSceneGate';
import SceneShell from '@/components/three/SceneShell';
import { HERO } from '@/lib/content';
import { STATUS_ORDER, STATUS_COLOR, STATUS_COUNT } from '@/lib/data';
import { num } from '@/lib/format';

const HeroParticles = dynamic(() => import('@/components/three/HeroParticles'), { ssr: false });

export default function Hero({
  total,
  headline,
}: {
  total: number;
  headline: { value: number; label: string }[];
}) {
  const section = useRef<HTMLElement>(null);
  const { show3d } = useSceneGate(section);

  // Scroll progress drives the particle migration without re-rendering React.
  const progress = useRef(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end start'] });
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    progress.current = v;
  });

  return (
    <section ref={section} className="relative isolate min-h-[100svh] overflow-hidden bg-ink">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/photos/01_warehouse_forklift_arrival.jpeg"
          alt="Walking into a warehouse in the industrial belt during a field visit, a forklift and stacked pallets ahead."
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgb(36 33 38 / 0.98) 18%, rgb(36 33 38 / 0.88) 48%, rgb(36 33 38 / 0.68) 100%)',
          }}
        />
      </div>

      {show3d && (
        <div className="absolute inset-0 -z-[5]" aria-hidden>
          <SceneShell label="Market map" camera={{ position: [0, 0, 13], fov: 46 }} frameloop="always">
            <HeroParticles counts={STATUS_COUNT} total={total} progress={progress} />
          </SceneShell>
        </div>
      )}

      <div className="shell relative flex min-h-[100svh] flex-col justify-end pb-16 pt-28 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-paper/65">
            {HERO.eyebrow}
          </p>

          <h1 className="display mt-7 text-[clamp(2.25rem,7vw,5.25rem)] text-paper">
            <span className="block">{HERO.lines[0]}</span>
            <span className="block text-paper/45">{HERO.lines[1]}</span>
            <span className="block">{HERO.lines[2]}</span>
          </h1>

          <dl className="mt-12 flex flex-wrap gap-x-14 gap-y-6">
            {headline.map((h) => (
              <div key={h.label}>
                <dd className="display tnum text-[clamp(2rem,4vw,3rem)] leading-none text-paper">
                  {num(h.value)}
                </dd>
                <dt className="mt-2 max-w-[11rem] text-[0.8125rem] leading-snug text-paper/65">
                  {h.label}
                </dt>
              </div>
            ))}
          </dl>

          {/* Legend doubles as the accessible reading of the particle field. */}
          <ul className="mt-12 flex flex-wrap gap-x-7 gap-y-3">
            {STATUS_ORDER.map((s) => (
              <li key={s} className="flex items-baseline gap-2">
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 translate-y-[-1px] rounded-full"
                  style={{ backgroundColor: STATUS_COLOR[s] }}
                />
                <span className="text-[0.75rem] uppercase tracking-[0.08em] text-paper/55">{s}</span>
                <span className="tnum text-[0.875rem] font-600 text-paper">{num(STATUS_COUNT[s])}</span>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              href="/companies"
              className="inline-flex items-center gap-2 bg-red px-5 py-3 text-[0.75rem] font-600 uppercase tracking-[0.1em] text-paper transition-colors hover:bg-[#a81824]"
            >
              Open the database
            </Link>
            <Link
              href="/volume"
              className="inline-flex items-center gap-2 border border-paper/30 px-5 py-3 text-[0.75rem] font-600 uppercase tracking-[0.1em] text-paper transition-colors hover:border-paper"
            >
              The finding that changes the list
            </Link>
          </div>

          <p className="mt-10 text-[0.75rem] text-paper/45">{HERO.byline}</p>
        </motion.div>
      </div>
    </section>
  );
}
