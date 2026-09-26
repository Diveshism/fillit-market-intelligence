import Link from 'next/link';
import { num, pct } from '@/lib/format';

/**
 * A large click-through card in the drill-down spine.
 * Green → Hot/Warm/Cold → list → profile, per MASTER_PROMPT §3.
 */
export default function DrillCard({
  href,
  label,
  count,
  total,
  definition,
  color,
  note,
}: {
  href: string;
  label: string;
  count: number;
  total?: number;
  definition: string;
  color: string;
  note?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[3px] border border-hairline bg-wash p-6 transition-all duration-500 ease-entrance hover:-translate-y-0.5 hover:border-graphite/45 md:p-7"
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px] origin-left transition-transform duration-500 ease-entrance group-hover:scale-x-100"
        style={{ backgroundColor: color, transform: 'scaleX(1)' }}
      />

      <div>
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-[1.0625rem] font-600 tracking-display text-ink">
            {label}
          </h3>
          {total !== undefined && total > 0 && (
            <span className="source-line tnum shrink-0" data-numeric>
              {pct((count / total) * 100, 1)} of {num(total)}
            </span>
          )}
        </div>

        <p
          className="display tnum mt-4 text-[clamp(2.5rem,5vw,3.5rem)] leading-none"
          style={{ color }}
          data-numeric
        >
          {num(count)}
        </p>

        <p className="mt-4 max-w-sm text-[0.875rem] leading-relaxed text-graphite">
          {definition}
        </p>

        {note && <p className="source-line mt-3">{note}</p>}
      </div>

      <span className="mt-7 inline-flex items-center gap-2 text-[0.75rem] font-600 uppercase tracking-[0.1em] text-ink">
        View the list
        <span
          aria-hidden
          className="inline-block transition-transform duration-300 group-hover:translate-x-1"
        >
          →
        </span>
      </span>
    </Link>
  );
}
