'use client';

import { SUPPLIERS } from '@/lib/content';
import { Stagger, StaggerItem, GrowBar } from '@/components/ui/motion';
import CountUp from '@/components/ui/CountUp';

/**
 * Who the market buys from today — deck slide 14.
 *
 * Two bars carry the brand red because they are the finding: self-fuelling at a
 * station is not a supplier relationship at all, and CAFU is withdrawing.
 */
export default function SupplierShare() {
  const max = Math.max(...SUPPLIERS.map((s) => s.companies));

  return (
    <Stagger as="ul" className="space-y-5" gap={0.08}>
      {SUPPLIERS.map((s, i) => {
        const highlight = s.name === 'Self-fuelling at retail stations' || s.name === 'CAFU';
        return (
          <StaggerItem as="li" key={s.name}>
            <div className="flex items-baseline justify-between gap-4">
              <span className={`text-[0.9375rem] ${highlight ? 'font-600 text-ink' : 'text-graphite'}`}>
                {s.name}
              </span>
              <span className={`tnum shrink-0 text-[1.0625rem] font-600 ${highlight ? 'text-red' : 'text-graphite'}`}>
                <CountUp to={s.companies} />
              </span>
            </div>
            <GrowBar
              className="mt-2"
              value={(s.companies / max) * 100}
              color={highlight ? '#8D2635' : '#6B7076'}
              delay={i * 0.06}
            />
            <p className="source-line mt-1.5">{s.note}</p>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
