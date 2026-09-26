'use client';

import { FadeIn, GrowColumn } from '@/components/ui/motion';
import { pct } from '@/lib/format';

/**
 * Deck slide 18 — the leads we found ourselves against the list we were handed.
 * Grouped columns, direct-labelled, no gridlines. Dead ends are the one measure
 * where lower is better, so the self-generated column takes red there.
 */
export default function LeadSourceChart({
  self,
  planned,
}: {
  self: { n: number; green: number; greenRate: number; dead: number; deadRate: number };
  planned: { n: number; green: number; greenRate: number; dead: number; deadRate: number };
}) {
  const measures = [
    { label: 'Green rate', sub: 'confirmed diesel users', selfValue: self.greenRate, plannedValue: planned.greenRate, lowerIsBetter: false },
    { label: 'Dead-end rate', sub: 'no company at the address', selfValue: self.deadRate, plannedValue: planned.deadRate, lowerIsBetter: true },
  ];
  const max = 80;

  return (
    <div>
      <ul className="mb-8 flex flex-wrap gap-x-7 gap-y-2">
        <li className="flex items-center gap-2.5 text-[0.8125rem] text-graphite">
          <span aria-hidden className="inline-block h-3 w-5 bg-sand" />
          The planned prospect list ({planned.n})
        </li>
        <li className="flex items-center gap-2.5 text-[0.8125rem] text-graphite">
          <span aria-hidden className="inline-block h-3 w-5 bg-[#05AF52]" />
          Self-generated in the field ({self.n})
        </li>
      </ul>

      <div className="grid grid-cols-2 gap-8 md:gap-16">
        {measures.map((m, mi) => {
          const selfColor = m.lowerIsBetter ? '#8D2635' : '#05AF52';
          return (
            <div key={m.label} className="flex flex-col">
              <div className="flex h-60 items-end justify-center gap-4 md:gap-7">
                <Column value={m.plannedValue} max={max} color="#C6C6C6" labelColor="#5C5C5C" delay={mi * 0.12} />
                <Column value={m.selfValue} max={max} color={selfColor} labelColor={selfColor} delay={mi * 0.12 + 0.18} emphasis />
              </div>
              <div className="mt-4 border-t border-hairline pt-3 text-center">
                <p className="text-[0.875rem] font-medium leading-tight text-ink">{m.label}</p>
                <p className="text-[0.8125rem] leading-tight text-graphite">{m.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Column({
  value, max, color, labelColor, delay, emphasis = false,
}: { value: number; max: number; color: string; labelColor: string; delay: number; emphasis?: boolean }) {
  return (
    <div className="flex h-full w-full max-w-[4rem] flex-col items-center justify-end">
      <FadeIn
        delay={delay + 0.65}
        y={8}
        className={`tnum mb-2 text-[0.9375rem] ${emphasis ? 'font-700' : 'font-500'}`}
      >
        <span style={{ color: labelColor }}>{pct(value, 1)}</span>
      </FadeIn>
      <GrowColumn value={(value / max) * 100} color={color} delay={delay} />
    </div>
  );
}
