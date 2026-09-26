import type { Metadata } from 'next';
import Link from 'next/link';
import { summary, blockedCompanies, zones } from '@/lib/data';
import { BARRIERS, BARRIER_NOTE, BARRIER_TAKEAWAY, JEBEL_ALI } from '@/lib/content';
import { defaultSort } from '@/lib/collections';
import { PageHeader, Reveal, SectionHeading, SourceLine, Takeaway, Stagger, StaggerItem, GrowBar } from '@/components/ui/Section';
import { ConfidenceBadge } from '@/components/ui/Badges';
import CountUp from '@/components/ui/CountUp';
import CompanyTable from '@/components/companies/CompanyTable';
import { num, pct } from '@/lib/format';

export const metadata: Metadata = {
  title: 'The barrier nobody has priced',
  description:
    '100 companies are blocked by free-zone entry, appointment protocols and gate passes — solvable with administration rather than more visits.',
};

export default function BarriersPage() {
  const blocked = defaultSort(blockedCompanies);
  const maxBarrier = Math.max(...BARRIERS.map((b) => b.companies));
  const jafza = zones.find((z) => z.zone === 'Jebel Ali / JAFZA');

  return (
    <>
      <PageHeader
        eyebrow="The barrier nobody has priced"
        title="100 companies are blocked, not disqualified."
        standfirst="Free zone entry, appointment protocols and gate passes. All solvable with administration rather than more visits."
        confidence="VERIFIED"
      />

      {/* ------------------- the barriers ------------------- */}
      <section className="shell pb-16">
        <Reveal>
          <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
            <div>
              <Stagger as="ul" className="space-y-7" gap={0.1}>
                {BARRIERS.map((b, i) => (
                  <StaggerItem as="li" key={b.barrier}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-[1.0625rem] font-600 text-ink">{b.barrier}</span>
                      <span className="tnum shrink-0 text-[1.0625rem] font-600 text-red">{b.companies}</span>
                    </div>
                    <GrowBar className="mt-2.5" value={(b.companies / maxBarrier) * 100} color="#E0A020" delay={i * 0.1} />
                    <p className="mt-2 text-[0.875rem] leading-relaxed text-graphite">{b.needed}</p>
                  </StaggerItem>
                ))}
              </Stagger>

              <SourceLine>{BARRIER_NOTE}</SourceLine>
            </div>

            <div className="self-start border border-hairline bg-wash p-7">
              <p className="eyebrow">Jebel Ali / JAFZA</p>
              <p className="display tnum mt-5 text-[clamp(3rem,7vw,4.5rem)] leading-none text-red">
                <CountUp to={JEBEL_ALI.blocked} />
              </p>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-graphite">
                of {JEBEL_ALI.companies} companies visited were blocked at the gate, and{' '}
                <strong className="text-ink">zero Hot leads</strong> were recorded.
              </p>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-graphite">
                This is not a demand problem. It is the single clearest case for buying access rather
                than buying more field days.
              </p>
              {jafza && (
                <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-hairline pt-5 text-[0.8125rem]">
                  <div>
                    <dt className="eyebrow">Green rate</dt>
                    <dd className="tnum mt-1.5 font-display text-[1.25rem] font-600">{pct(jafza.green_rate, 1)}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Self-generated</dt>
                    <dd className="tnum mt-1.5 font-display text-[1.25rem] font-600">{jafza.self_generated}</dd>
                  </div>
                </dl>
              )}
              <Link
                href="/companies?zone=Jebel%20Ali%20%2F%20JAFZA"
                className="mt-6 inline-flex items-center gap-2 text-[0.75rem] font-600 uppercase tracking-[0.1em] text-ink underline decoration-red decoration-2 underline-offset-[6px]"
              >
                Open the 62 companies <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          <Takeaway>{BARRIER_TAKEAWAY}</Takeaway>
        </Reveal>
      </section>

      {/* ------------------- the wider pool ------------------- */}
      <section className="shell pb-16">
        <Reveal>
          <SectionHeading
            eyebrow="The wider pool"
            title="194 companies are unfinished, not rejected."
            confidence="VERIFIED"
          />

          <dl className="grid grid-cols-2 gap-x-8 gap-y-8 border-t border-hairline pt-8 md:grid-cols-4">
            <div>
              <dt className="eyebrow">Appointment needed</dt>
              <dd className="display tnum mt-2.5 text-[2.25rem] leading-none text-[#E0A020]">
                <CountUp to={summary.appointment} />
              </dd>
              <p className="source-line mt-1">could not get in</p>
            </div>
            <div>
              <dt className="eyebrow">Revisit</dt>
              <dd className="display tnum mt-2.5 text-[2.25rem] leading-none text-[#D9772B]">
                <CountUp to={summary.revisit} />
              </dd>
              <p className="source-line mt-1">process stopped, company did not</p>
            </div>
            <div>
              <dt className="eyebrow">Blocked or unresolved</dt>
              <dd className="display tnum mt-2.5 text-[2.25rem] leading-none">
                <CountUp to={summary.blocked_or_unresolved} />
              </dd>
              <p className="source-line mt-1">
                {pct((summary.blocked_or_unresolved / summary.companies) * 100, 1)} of the book
              </p>
            </div>
            <div>
              <dt className="eyebrow">Confirmed diesel users</dt>
              <dd className="display tnum mt-2.5 text-[2.25rem] leading-none text-[#05AF52]">
                <CountUp to={summary.diesel_users} />
              </dd>
              <p className="source-line mt-1">for comparison</p>
            </div>
          </dl>

          <p className="mt-8 max-w-2xl text-[1.0625rem] leading-relaxed text-graphite">
            The addressable pool is not {num(summary.diesel_users)}. Another{' '}
            {num(summary.blocked_or_unresolved)} companies are blocked or unresolved — someone has
            already driven there, and the discovery cost is already spent.
          </p>
        </Reveal>
      </section>

      {/* ------------------- the list ------------------- */}
      <section className="shell pb-24">
        <Reveal>
          <div className="mb-6 flex items-start justify-between gap-6">
            <div>
              <p className="eyebrow eyebrow-rule">The list</p>
              <h2 className="display mt-6 text-[clamp(1.5rem,3vw,2.25rem)]">
                All {num(blocked.length)} blocked and unresolved companies.
              </h2>
            </div>
            <ConfidenceBadge level="VERIFIED" />
          </div>

          <CompanyTable companies={blocked} from="blocked" exportName="fillit-blocked" />

          <SourceLine>
            Source: FILLIT_Blocked_and_Revisit.xlsx, verified against the master database ·
            n = {num(blocked.length)} companies.
          </SourceLine>
        </Reveal>
      </section>
    </>
  );
}
