'use client';

import type { WeeklyRow } from '@/lib/types';
import { FadeIn, GrowSpan, LiftCard } from '@/components/ui/motion';
import CountUp from '@/components/ui/CountUp';
import { num, pct } from '@/lib/format';

/**
 * Weeks 1 to 7 as a horizontally-scrolling timeline — deck slide 7.
 *
 * The dead-end rate is the line that matters: 59.5% in Week 1 on the handed-over
 * list, down to 18.8% by Week 4 once the team was choosing its own addresses.
 * Cards deal in from the right as the strip enters view.
 */
export default function WeeklyProgress({ weekly }: { weekly: WeeklyRow[] }) {
  const maxVisits = Math.max(...weekly.map((w) => w.visits));

  return (
    <div className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] pb-4">
      <ol className="flex min-w-max gap-4 md:gap-5">
        {weekly.map((w, i) => (
          <FadeIn as="li" key={w.week} x={36} delay={i * 0.08} duration={0.7}>
            <LiftCard className="w-[15rem] shrink-0 border border-hairline bg-wash p-5 md:w-[16.5rem]">
              <div className="flex items-baseline justify-between">
                <p className="eyebrow">Week {w.week}</p>
                {w.new_leads > 0 && (
                  <span className="tnum text-[0.6875rem] font-600 text-[#05AF52]">
                    +{w.new_leads} new leads
                  </span>
                )}
              </div>

              <p className="display tnum mt-4 text-[2.25rem] leading-none">
                <CountUp to={w.visits} />
              </p>
              <p className="mt-1.5 text-[0.75rem] text-graphite">visits</p>

              {/* Green against dead ends, swept in on entry. */}
              <div className="mt-5 flex h-2.5 w-full bg-hairline/40">
                <GrowSpan
                  className="block h-full shrink-0"
                  width="100%"
                  color="#05AF52"
                  delay={i * 0.08 + 0.2}
                  style={{ maxWidth: `${w.green_rate}%`, flexBasis: `${w.green_rate}%` }}
                />
                <GrowSpan
                  className="block h-full shrink-0"
                  width="100%"
                  color="#8D2635"
                  delay={i * 0.08 + 0.3}
                  style={{ maxWidth: `${w.dead_end_rate}%`, flexBasis: `${w.dead_end_rate}%` }}
                />
              </div>

              <dl className="mt-4 space-y-1.5 text-[0.75rem]">
                <div className="flex items-center justify-between">
                  <dt className="text-graphite">Green</dt>
                  <dd className="tnum font-600 text-[#05AF52]">{pct(w.green_rate, 1)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-graphite">Dead ends</dt>
                  <dd className="tnum font-600 text-[#8D2635]">{pct(w.dead_end_rate, 1)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-hairline/60 pt-1.5">
                  <dt className="text-graphite">Hot · Warm · Cold</dt>
                  <dd className="tnum text-ink">{w.hot} · {w.warm} · {w.cold}</dd>
                </div>
              </dl>

              {/* Relative effort across the seven weeks. */}
              <div className="mt-4 h-[3px] w-full bg-hairline/40">
                <GrowSpan
                  className="block h-full"
                  width={`${(w.visits / maxVisits) * 100}%`}
                  color="rgb(92 92 92 / 0.45)"
                  delay={i * 0.08 + 0.4}
                />
              </div>
            </LiftCard>
          </FadeIn>
        ))}
      </ol>
      <p className="source-line mt-2">{num(weekly.length)} weeks · scroll sideways for the rest.</p>
    </div>
  );
}
