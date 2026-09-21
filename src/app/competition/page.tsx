import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { summary, cafuAccounts } from '@/lib/data';
import {
  SUPPLIERS, SUPPLIER_SOURCE, SUPPLIER_TAKEAWAY, PRICING_CONTEXT, SOURCES,
} from '@/lib/content';
import { defaultSort } from '@/lib/collections';
import { PageHeader, Reveal, SectionHeading, SourceLine, Takeaway } from '@/components/ui/Section';
import { ConfidenceBadge } from '@/components/ui/Badges';
import CountUp from '@/components/ui/CountUp';
import SupplierShare from '@/components/charts/SupplierShare';
import CompanyTable from '@/components/companies/CompanyTable';
import { num } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Competitor landscape',
  description:
    'No supplier owns this market, and CAFU has created a vacuum. 20 companies named it unprompted, 16 of them negatively.',
};

export default function CompetitionPage() {
  const cafu = defaultSort(cafuAccounts);
  const press = SOURCES.filter((s) => s.source.includes('Gulf News') || s.source.includes('The National'));

  return (
    <>
      <PageHeader
        eyebrow="Finding 02 · Competitor landscape"
        title="No supplier owns this market, and CAFU has created a vacuum."
        standfirst={SUPPLIER_SOURCE}
        confidence="VERIFIED"
      />

      {/* ------------------- supplier landscape ------------------- */}
      <section className="shell pb-16">
        <Reveal>
          <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
            <SupplierShare />

            <figure className="self-start">
              <div className="relative aspect-[3/4] max-h-[28rem] overflow-hidden">
                <Image
                  src="/photos/03_onsite_bulk_refuelling.jpeg"
                  alt="A tractor unit refuelling from a private on-site bulk diesel tank in a yard."
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="source-line mt-3">
                A site refuelling from its own bulk tank rather than any delivery service.
              </figcaption>
            </figure>
          </div>

          <Takeaway>{SUPPLIER_TAKEAWAY}</Takeaway>

          <SourceLine>
            Source: FILLIT_Master_Database.xlsx · current supplier among the 102 companies that named
            one · a company can name more than one supplier.
          </SourceLine>
        </Reveal>
      </section>

      {/* ------------------- pricing context ------------------- */}
      <section className="shell pb-16">
        <Reveal>
          <div className="border-l-2 border-red bg-red-wash p-7">
            <div className="flex items-start justify-between gap-6">
              <p className="eyebrow">Pricing context</p>
              <ConfidenceBadge level="SOURCED" />
            </div>
            <p className="mt-4 max-w-3xl text-[1.0625rem] leading-relaxed text-ink">
              {PRICING_CONTEXT}
            </p>
          </div>
        </Reveal>
      </section>

      {/* ------------------- the CAFU vacuum ------------------- */}
      <section className="on-ink">
        <div className="shell py-20">
          <Reveal>
            <div className="flex items-start justify-between gap-6">
              <p className="eyebrow eyebrow-rule">The vacuum</p>
              <ConfidenceBadge level="VERIFIED" />
            </div>

            <div className="mt-8 grid gap-12 lg:grid-cols-[auto_1fr] lg:gap-20">
              <div>
                <p className="display text-[clamp(4.5rem,14vw,9rem)] leading-[0.85] text-red">
                  <CountUp to={summary.cafu_mentions} />
                </p>
                <p className="mt-5 max-w-xs text-[1.0625rem] leading-relaxed text-paper/75">
                  companies named CAFU unprompted. 16 of them negatively. All 20 are confirmed
                  diesel users.
                </p>
              </div>

              <div className="self-center">
                <h2 className="display max-w-2xl text-[clamp(1.5rem,3.2vw,2.25rem)] text-paper">
                  A direct replacement for a withdrawn supplier, with no price fight required.
                </h2>
                <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-paper/70">
                  These businesses already bought delivered diesel and already decided they wanted
                  it. They need no education on the category — only a supplier that turns up.
                </p>

                <ul className="mt-10 grid gap-px bg-paper/15 sm:grid-cols-2">
                  {press.map((p) => (
                    <li key={p.source} className="bg-ink p-5">
                      <p className="eyebrow">{p.source}</p>
                      <p className="mt-3 text-[0.9375rem] leading-relaxed text-paper/85">{p.used}</p>
                    </li>
                  ))}
                </ul>
                <p className="source-line mt-4">
                  Press coverage is secondary context, cited as published. The 20 accounts are
                  first-hand field records.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------- the list ------------------- */}
      <section className="shell py-20">
        <Reveal>
          <div className="mb-6 flex items-start justify-between gap-6">
            <div>
              <p className="eyebrow eyebrow-rule">The priority segment</p>
              <h2 className="display mt-6 text-[clamp(1.5rem,3vw,2.25rem)]">
                {num(cafu.length)} CAFU-affected accounts.
              </h2>
              <p className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-graphite">
                Handed over as its own workbook. Every one has the verbatim field note that records
                what went wrong.
              </p>
            </div>
            <ConfidenceBadge level="VERIFIED" />
          </div>

          <CompanyTable companies={cafu} from="cafu" exportName="fillit-cafu-affected" showStatusFilter={false} />

          <SourceLine>
            Source: FILLIT_CAFU_Affected_Accounts.xlsx, verified against the master database ·
            n = {num(cafu.length)} companies that named CAFU unprompted during a field visit.
          </SourceLine>

          <div className="mt-10">
            <Link
              href="/recommendations"
              className="inline-flex items-center gap-2 text-[0.75rem] font-600 uppercase tracking-[0.1em] text-ink underline decoration-red decoration-2 underline-offset-[6px]"
            >
              What we recommend doing with it <span aria-hidden>→</span>
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
