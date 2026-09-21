'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { SectorRow } from '@/lib/types';
import { FadeIn, GrowSpan } from '@/components/ui/motion';
import { num, pct } from '@/lib/format';

/**
 * Effort on the left, result on the right — deck slide 11, rebuilt interactively.
 * Effort is the share of the 568 companies visited; result is the green rate.
 * Both wings grow outward from the centre label as the row enters view, and
 * hovering a row dims the others so one industry can be read in isolation.
 */
export default function SectorTornado({
  sectors,
  total,
  average,
}: {
  sectors: SectorRow[];
  total: number;
  average: number;
}) {
  const [active, setActive] = useState<string | null>(null);

  const maxEffort = Math.max(...sectors.map((s) => s.companies));
  const maxGreen = Math.max(...sectors.map((s) => s.green_rate));

  return (
    <div>
      <div className="mb-5 grid grid-cols-[1fr_auto_1fr] items-end gap-3 md:gap-6">
        <p className="eyebrow text-right">Companies visited</p>
        <span className="w-32 md:w-60" />
        <p className="eyebrow text-[#2E7D4F]">Green rate</p>
      </div>

      <ul className="space-y-4">
        {sectors.map((s, i) => {
          const strong = s.green_rate >= average;
          const dim = active !== null && active !== s.sector;
          const effortShare = (s.companies / total) * 100;
          const delay = i * 0.055;

          return (
            <motion.li
              key={s.sector}
              onMouseEnter={() => setActive(s.sector)}
              onMouseLeave={() => setActive(null)}
              animate={{ opacity: dim ? 0.38 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                href={`/companies?sector=${encodeURIComponent(s.sector)}`}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-6"
              >
                {/* effort — grows leftward from the label */}
                <div className="flex items-center justify-end gap-3">
                  <FadeIn delay={delay + 0.45} className="tnum shrink-0 text-[0.8125rem] text-graphite">
                    {num(s.companies)}
                    <span className="ml-1.5 text-graphite/60">{pct(effortShare, 0)}</span>
                  </FadeIn>
                  <GrowSpan
                    className="block h-6 shrink-0"
                    width={`${Math.max(2, (s.companies / maxEffort) * 100)}%`}
                    color={strong ? '#C9B89C' : '#41616F'}
                    origin="right"
                    delay={delay}
                  />
                </div>

                <div className="w-32 text-center md:w-60">
                  <p className={`text-[0.8125rem] leading-tight md:text-[0.9375rem] ${strong ? 'font-600 text-ink' : 'text-graphite'}`}>
                    {s.sector}
                  </p>
                  <p className="source-line mt-0.5">
                    {s.hot} hot · {s.warm} warm · {s.cold} cold
                  </p>
                </div>

                {/* green rate — grows rightward */}
                <div className="flex items-center gap-3">
                  <GrowSpan
                    className="block h-6 shrink-0"
                    width={`${Math.max(2, (s.green_rate / maxGreen) * 100)}%`}
                    color={strong ? '#2E7D4F' : '#41616F'}
                    delay={delay}
                  />
                  <FadeIn
                    delay={delay + 0.45}
                    className={`tnum shrink-0 text-[0.875rem] font-600 ${strong ? 'text-[#2E7D4F]' : 'text-graphite'}`}
                  >
                    {pct(s.green_rate, 1)}
                  </FadeIn>
                </div>
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
