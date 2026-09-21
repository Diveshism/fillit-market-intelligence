'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { STATUS_COLOR, STATUS_DEFINITION, STATUS_ORDER, STATUS_COUNT } from '@/lib/data';
import { SLUG_OF_STATUS } from '@/lib/collections';
import { GrowSpan } from '@/components/ui/motion';
import CountUp from '@/components/ui/CountUp';
import type { Status } from '@/lib/types';
import { pct } from '@/lib/format';

/**
 * The market map as one horizontal stacked bar — deck slide 5, made interactive.
 *
 * Each segment's width is fixed by its share, and the coloured fill sweeps
 * across it on entry: the layout never depends on the animation, so the bar is
 * correct even if the sweep never plays. Hovering a segment dims the rest.
 */
export default function FunnelBar({ total, onInk = false }: { total: number; onInk?: boolean }) {
  const [hover, setHover] = useState<Status | null>(null);

  return (
    <div>
      <div className="flex h-16 w-full overflow-hidden rounded-[2px] md:h-24">
        {STATUS_ORDER.map((status, i) => {
          const n = STATUS_COUNT[status];
          const share = (n / total) * 100;
          const dim = hover !== null && hover !== status;
          return (
            <motion.div
              key={status}
              className="relative shrink-0"
              style={{ width: `${share}%` }}
              animate={{ opacity: dim ? 0.32 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <GrowSpan
                className="absolute inset-y-0 left-0 block"
                width="100%"
                color={STATUS_COLOR[status]}
                delay={i * 0.08}
              />
              <Link
                href={`/companies/${SLUG_OF_STATUS[status]}`}
                onMouseEnter={() => setHover(status)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(status)}
                onBlur={() => setHover(null)}
                aria-label={`${status}: ${n} companies, ${share.toFixed(1)} per cent. ${STATUS_DEFINITION[status]}`}
                className="relative flex h-full w-full items-end"
              >
                {share > 9 && (
                  <span
                    className="pointer-events-none px-3 pb-2 text-[0.6875rem] font-600 uppercase tracking-[0.06em]"
                    style={{ color: status === 'Cold' ? '#242126' : '#F6F4F1' }}
                  >
                    {status}
                  </span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Legend doubles as the readable table on small screens. */}
      <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
        {STATUS_ORDER.map((status, i) => {
          const n = STATUS_COUNT[status];
          const dim = hover !== null && hover !== status;
          return (
            <motion.li key={status} animate={{ opacity: dim ? 0.4 : 1 }} transition={{ duration: 0.3 }}>
              <Link
                href={`/companies/${SLUG_OF_STATUS[status]}`}
                onMouseEnter={() => setHover(status)}
                onMouseLeave={() => setHover(null)}
                className="group block"
              >
                <GrowSpan
                  className="block h-[3px]"
                  width="100%"
                  color={STATUS_COLOR[status]}
                  delay={0.45 + i * 0.06}
                />
                <span className={`mt-2 block text-[0.6875rem] font-600 uppercase tracking-[0.08em] ${onInk ? 'text-paper/70' : 'text-graphite'}`}>
                  {status}
                </span>
                <span className={`tnum mt-1 block font-display text-[1.5rem] font-600 tracking-display transition-colors ${onInk ? 'text-paper' : 'text-ink'} group-hover:text-red`}>
                  <CountUp to={n} />
                </span>
                <span className={`source-line block ${onInk ? 'text-paper/50' : ''}`}>
                  {pct((n / total) * 100, 1)}
                </span>
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
