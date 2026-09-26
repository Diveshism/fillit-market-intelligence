import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { STATUS_DEFINITION, summary } from '@/lib/data';
import { STATUS_SLUGS, STATUS_OF_SLUG, isStatusSlug, resolveCollection } from '@/lib/collections';
import { PageHeader, SourceLine } from '@/components/ui/Section';
import { ConfidenceBadge } from '@/components/ui/Badges';
import CompanyTable from '@/components/companies/CompanyTable';
import { num, pct } from '@/lib/format';

export function generateStaticParams() {
  return STATUS_SLUGS.map((status) => ({ status }));
}

export function generateMetadata({ params }: { params: { status: string } }): Metadata {
  if (!isStatusSlug(params.status)) return { title: 'Not found' };
  const status = STATUS_OF_SLUG[params.status];
  const list = resolveCollection(params.status).companies;
  return {
    title: `${status} companies`,
    description: `${list.length} ${status} companies. ${STATUS_DEFINITION[status]}`,
  };
}

/** Extra context per status, drawn from the deck. */
const NOTE: Record<string, string> = {
  hot: 'Every one of these asked for a quote, a sample or a visit, and each has a named contact on file.',
  warm: 'Using diesel and interested. These need a follow-up, not a pitch.',
  cold: 'Confirmed diesel users who are not ready to switch. This is where 58% of the measured litres sit.',
  appointment: 'Could not get in. Free zone entry, a booked appointment or a gate pass is what stands in the way.',
  revisit: 'Unresolved rather than rejected. The process stopped; the company did not.',
  invalid: 'Disqualified — but 125 of these closed on a wrong address rather than on absent demand.',
};

export default function StatusPage({ params }: { params: { status: string } }) {
  if (!isStatusSlug(params.status)) notFound();

  const slug = params.status;
  const status = STATUS_OF_SLUG[slug];
  const list = resolveCollection(slug).companies;

  const withVolume = list.filter((c) => c.litres_per_month !== null);
  const litres = withVolume.reduce((t, c) => t + (c.litres_per_month ?? 0), 0);
  const named = list.filter((c) => c.contact_person).length;
  const selfGen = list.filter((c) => c.lead_source === 'Self-generated').length;

  return (
    <>
      <PageHeader
        eyebrow={`Database · ${status}`}
        title={`${num(list.length)} ${status} companies.`}
        standfirst={STATUS_DEFINITION[status]}
        confidence="VERIFIED"
      >
        <nav aria-label="Breadcrumb" className="mt-8 flex flex-wrap items-center gap-2 text-[0.8125rem] text-graphite">
          <Link href="/companies" className="underline underline-offset-4 hover:text-ink">All companies</Link>
          <span aria-hidden>·</span>
          <span className="text-ink">{status}</span>
        </nav>

        <p className="mt-6 max-w-2xl text-[0.9375rem] leading-relaxed text-graphite">{NOTE[slug]}</p>

        <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-hairline pt-8 sm:grid-cols-4">
          <Stat label="Companies" value={num(list.length)} sub={pct((list.length / summary.companies) * 100, 1) + ' of the book'} />
          <Stat label="With a named contact" value={num(named)} />
          <Stat label="Self-generated" value={num(selfGen)} />
          <Stat
            label="Volume measured"
            value={litres > 0 ? `${num(litres)} L` : '—'}
            sub={litres > 0 ? `across ${num(withVolume.length)} companies` : 'not captured for this group'}
          />
        </dl>
      </PageHeader>

      <section className="shell pb-24 pt-4">
        <div className="mb-6 flex items-center justify-between gap-6">
          <p className="eyebrow">The list</p>
          <ConfidenceBadge level="VERIFIED" />
        </div>

        <CompanyTable companies={list} from={slug} exportName={`fillit-${slug}`} showStatusFilter={false} />

        <SourceLine>
          Source: FILLIT_Master_Database.xlsx · {status}: {STATUS_DEFINITION[status].toLowerCase()} ·
          each company carries the outcome of its most recent visit.
        </SourceLine>
      </section>
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="display tnum mt-2 text-[1.75rem]">{value}</dd>
      {sub && <p className="source-line mt-1">{sub}</p>}
    </div>
  );
}
