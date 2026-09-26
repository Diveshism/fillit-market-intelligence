import type { Metadata } from 'next';
import Link from 'next/link';
import { companies, summary, STATUS_ORDER, STATUS_COLOR, STATUS_DEFINITION, STATUS_COUNT } from '@/lib/data';
import { defaultSort, SLUG_OF_STATUS } from '@/lib/collections';
import { PageHeader, Reveal, SourceLine } from '@/components/ui/Section';
import { ConfidenceBadge } from '@/components/ui/Badges';
import CompanyTable from '@/components/companies/CompanyTable';
import { num, pct } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Company database',
  description:
    'All 636 companies visited, searchable and filterable by status, industry, area and lead source.',
};

export default function CompaniesPage({
  searchParams,
}: {
  searchParams?: { sector?: string; zone?: string };
}) {
  const total = summary.companies;

  return (
    <>
      <PageHeader
        eyebrow="The database"
        title="Every company we visited, in one place."
        standfirst={`All ${num(total)} companies at their latest status, from ${num(
          summary.field_visits,
        )} field visits — ${num(summary.visited_more_than_once)} of them were visited more than once.`}
        confidence="VERIFIED"
      />

      {/* ------------------- status cards ------------------- */}
      <section className="shell pb-6">
        <Reveal>
          <ul className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
            {STATUS_ORDER.map((status) => {
              const n = STATUS_COUNT[status];
              return (
                <li key={status}>
                  <Link
                    href={`/companies/${SLUG_OF_STATUS[status]}`}
                    className="group relative flex h-full flex-col bg-paper p-6 transition-colors hover:bg-red-wash/50"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-[3px]"
                      style={{ backgroundColor: STATUS_COLOR[status] }}
                    />
                    <div className="flex items-baseline justify-between gap-3">
                      <h2 className="font-display text-[1.0625rem] font-600 tracking-display text-ink">
                        {status}
                      </h2>
                      <span className="source-line tnum shrink-0">{pct((n / total) * 100, 1)}</span>
                    </div>
                    <p
                      className="display tnum mt-3 text-[2.75rem] leading-none"
                      style={{ color: STATUS_COLOR[status] === '#A9DCC0' ? '#6fbf8f' : STATUS_COLOR[status] }}
                    >
                      {num(n)}
                    </p>
                    <p className="mt-3 flex-1 text-[0.875rem] leading-relaxed text-graphite">
                      {STATUS_DEFINITION[status]}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-[0.75rem] font-600 uppercase tracking-[0.1em] text-ink">
                      View the list
                      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </section>

      {/* ------------------- the table ------------------- */}
      <section className="shell pb-24 pt-14">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <p className="eyebrow eyebrow-rule">The full record</p>
            <h2 className="display mt-6 text-[clamp(1.5rem,3vw,2.25rem)]">All {num(total)} companies.</h2>
          </div>
          <ConfidenceBadge level="VERIFIED" />
        </div>

        <CompanyTable
          companies={defaultSort(companies)}
          from="all"
          exportName="fillit-all"
          initialSector={searchParams?.sector ?? ''}
          initialZone={searchParams?.zone ?? ''}
        />

        <SourceLine>
          Source: FILLIT_Master_Database.xlsx, the workbook handed over with the final presentation ·
          n = {num(total)} unique companies from {num(summary.field_visits)} field visits ·
          consumption shown where it was captured in interview.
        </SourceLine>
      </section>
    </>
  );
}
