import type { StatusHistoryEntry, Status } from '@/lib/types';
import { STATUS_COLOR, STATUS_DEFINITION } from '@/lib/data';
import { date } from '@/lib/format';

/**
 * The visit timeline, rendered from the workbook's status history.
 *
 * A company visited more than once is counted once, at its latest outcome. The
 * earlier outcomes are kept here so the path to the final classification stays
 * visible — 58 of the 68 repeat-visit companies changed status this way.
 */
export default function VisitTimeline({ history }: { history: StatusHistoryEntry[] }) {
  if (!history.length) {
    return <p className="text-[0.9375rem] text-graphite/55">No visit history recorded.</p>;
  }

  return (
    <ol className="relative space-y-6 border-l border-hairline pl-6">
      {history.map((entry, i) => {
        const latest = i === history.length - 1;
        const colour = STATUS_COLOR[entry.status as Status] ?? '#3D4650';
        const definition = STATUS_DEFINITION[entry.status as Status];
        return (
          <li key={`${entry.date}-${i}`} className="relative">
            <span
              aria-hidden
              className="absolute -left-[1.8125rem] top-[5px] block h-[11px] w-[11px] rounded-full ring-4 ring-paper"
              style={{ backgroundColor: colour }}
            />
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="tnum text-[0.875rem] font-600 text-ink">
                {entry.date ? date(entry.date) : 'Date not recorded'}
              </span>
              <span className="text-[0.8125rem] font-600" style={{ color: colour }}>
                {entry.status}
              </span>
              {latest && history.length > 1 && (
                <span className="text-[0.6875rem] uppercase tracking-[0.08em] text-graphite">
                  Latest — the outcome carried
                </span>
              )}
            </div>
            {definition && (
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-graphite">{definition}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
