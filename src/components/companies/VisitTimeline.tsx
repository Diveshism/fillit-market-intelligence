import type { Company, Status } from '@/lib/types';
import { STATUS_COLOR, STATUS_DEFINITION } from '@/lib/data';
import { date, num } from '@/lib/format';

/**
 * The visit record for one company.
 *
 * The seven-week rebuild dropped the separate Visit history sheet, so the
 * workbook no longer states what a company was called on each intermediate
 * visit. What it does still record is the first visit, the last visit, the
 * number of visits, and — where the cell colour and the written interest level
 * disagreed — the dated override that resolved it.
 *
 * This renders those and nothing else. An intermediate outcome the workbook no
 * longer holds is shown as a visit with an unrecorded outcome rather than
 * guessed at.
 */
export default function VisitTimeline({ company }: { company: Company }) {
  const { first_visit: first, last_visit: last, visits, overrides, status } = company;
  const middle = Math.max(0, visits - (first && last && first !== last ? 2 : 1));

  const events: {
    key: string;
    date: string | null;
    label: string;
    status?: Status;
    note?: string;
  }[] = [];

  if (first) {
    events.push({
      key: 'first',
      date: first,
      label: first === last && visits === 1 ? 'Visited and classified' : 'First visit',
    });
  }

  for (const o of overrides) {
    events.push({
      key: `ov-${o.date}`,
      date: o.date,
      label: `Cell colour said ${o.status_by_colour ?? '—'}, written level said ${o.applied ?? '—'}`,
      status: (o.applied as Status) ?? undefined,
      note: o.comments ?? undefined,
    });
  }

  if (last && last !== first) {
    events.push({ key: 'last', date: last, label: 'Latest visit', status });
  } else if (events.length) {
    events[0].status = status;
  }

  if (!events.length) {
    return <p className="text-[0.9375rem] text-graphite/55">No visit dates recorded.</p>;
  }

  return (
    <>
      <ol className="relative space-y-6 border-l border-hairline pl-6">
        {events.map((e, i) => {
          const colour = e.status ? STATUS_COLOR[e.status] : 'var(--hairline)';
          const definition = e.status ? STATUS_DEFINITION[e.status] : null;
          const latest = i === events.length - 1;
          return (
            <li key={e.key} className="relative">
              <span
                aria-hidden
                className="absolute -left-[1.8125rem] top-[5px] block h-[11px] w-[11px] rounded-full ring-4 ring-paper"
                style={{ backgroundColor: colour }}
              />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="tnum text-[0.875rem] font-600 text-ink">
                  {e.date ? date(e.date) : 'Date not recorded'}
                </span>
                {e.status && (
                  <span className="text-[0.8125rem] font-600" style={{ color: colour }}>
                    {e.status}
                  </span>
                )}
                {latest && events.length > 1 && (
                  <span className="text-[0.6875rem] uppercase tracking-[0.08em] text-graphite">
                    Latest — the outcome carried
                  </span>
                )}
              </div>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-graphite">{e.label}</p>
              {definition && (
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-graphite">{definition}</p>
              )}
              {e.note && (
                <p className="mt-2 whitespace-pre-line border-l-2 border-hairline pl-3 text-[0.8125rem] leading-relaxed text-graphite">
                  {e.note}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {middle > 0 && (
        <p className="source-line mt-4">
          {num(middle)} further {middle === 1 ? 'visit is' : 'visits are'} counted in the total but
          carry no separately recorded outcome in the master workbook.
        </p>
      )}
    </>
  );
}
