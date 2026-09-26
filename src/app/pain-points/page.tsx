import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { summary } from '@/lib/data';
import {
  PAIN_POINTS, PAIN_POINT_NOTE, PAIN_POINT_SOURCE,
  BUYING_BEHAVIOUR, QUOTES, QUOTES_TAKEAWAY,
} from '@/lib/content';
import { PageHeader, Reveal, SectionHeading, SourceLine, Takeaway, Stagger, StaggerItem, Parallax } from '@/components/ui/Section';
import { ConfidenceBadge } from '@/components/ui/Badges';
import { num, pct } from '@/lib/format';

export const metadata: Metadata = {
  title: 'What buyers told us',
  description:
    'Every major pain point appears only beside a live lead. Decision makers, buying behaviour and verbatim objections from 743 field visits.',
};

const SEVERITY_COLOUR: Record<string, string> = {
  Major: '#8D2635',
  'High value': '#05AF52',
  Moderate: '#6B7076',
  Isolated: '#C6C6C6',
};

export default function PainPointsPage() {
  const max = Math.max(...PAIN_POINTS.map((p) => p.companies));

  return (
    <>
      <PageHeader
        eyebrow="What customers actually told us"
        title="Every major pain point appears only beside a live lead."
        standfirst={PAIN_POINT_SOURCE}
        confidence="VERIFIED"
      />

      {/* ------------------- pain points ------------------- */}
      <section className="shell pb-16">
        <Reveal>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] border-collapse text-left text-[0.875rem]">
              <thead>
                <tr className="border-b border-hairline">
                  <th scope="col" className="eyebrow py-3 pr-4">Pain point</th>
                  <th scope="col" className="eyebrow py-3 pr-4">Companies</th>
                  <th scope="col" className="eyebrow py-3 pr-4 text-right">Hot</th>
                  <th scope="col" className="eyebrow py-3 pr-4 text-right">Warm</th>
                  <th scope="col" className="eyebrow py-3 pr-4 text-right">Cold</th>
                  <th scope="col" className="eyebrow py-3 pr-4 text-right">Share green</th>
                  <th scope="col" className="eyebrow py-3 text-right">Severity</th>
                </tr>
              </thead>
              <tbody>
                {PAIN_POINTS.map((p) => (
                  <tr key={p.theme} className="border-b border-hairline/60">
                    <th scope="row" className="py-3.5 pr-4 text-left font-600 text-ink">{p.theme}</th>
                    <td className="py-3.5 pr-4">
                      <span className="flex items-center gap-3">
                        <span className="tnum w-7 shrink-0 text-right font-600 text-ink">{p.companies}</span>
                        <span className="h-2.5 w-28 bg-hairline/40">
                          <span
                            className="block h-full"
                            style={{ width: `${(p.companies / max) * 100}%`, backgroundColor: SEVERITY_COLOUR[p.severity] }}
                          />
                        </span>
                      </span>
                    </td>
                    <td className="tnum py-3.5 pr-4 text-right text-graphite">{p.hot}</td>
                    <td className="tnum py-3.5 pr-4 text-right text-graphite">{p.warm}</td>
                    <td className="tnum py-3.5 pr-4 text-right text-graphite">{p.cold}</td>
                    <td className="tnum py-3.5 pr-4 text-right font-600 text-[#05AF52]">{p.green}%</td>
                    <td className="py-3.5 text-right">
                      <span
                        className="rounded-[3px] border px-2 py-[3px] text-[0.625rem] font-600 uppercase tracking-[0.08em]"
                        style={{ borderColor: SEVERITY_COLOUR[p.severity], color: SEVERITY_COLOUR[p.severity] }}
                      >
                        {p.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Takeaway>{PAIN_POINT_NOTE}</Takeaway>

          <SourceLine>
            Source: text-mined from the comments, pain points, fleet and supplier fields across all{' '}
            {num(summary.companies)} companies. &ldquo;Share green&rdquo; is the proportion of the
            companies raising that theme which are confirmed diesel users.
          </SourceLine>
        </Reveal>
      </section>

      {/* ------------------- decision makers ------------------- */}
      <section className="shell pb-16">
        <Reveal>
          <SectionHeading
            eyebrow="Decision makers and buying behaviour"
            title="Who decides, and how they buy."
            standfirst={`Drawn from ${num(summary.field_visits)} field visits. ${num(summary.decision_makers)} named fuel decision-makers recorded with contact details.`}
            confidence="VERIFIED"
          />

          <Stagger as="dl" className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
            {BUYING_BEHAVIOUR.map((b) => (
              <StaggerItem key={b.pattern} className="bg-paper p-6">
                <dt className="text-[0.9375rem] font-600 leading-snug text-ink">{b.pattern}</dt>
                <dd className="mt-2 text-[0.8125rem] uppercase tracking-[0.08em] text-red">{b.evidence}</dd>
              </StaggerItem>
            ))}
          </Stagger>
        </Reveal>
      </section>

      {/* ------------------- quotes ------------------- */}
      <section className="on-ink">
        <div className="shell py-20">
          <Reveal>
            <div className="flex items-start justify-between gap-6">
              <p className="eyebrow eyebrow-rule">In their own words</p>
              <ConfidenceBadge level="VERIFIED" />
            </div>

            <h2 className="display mt-7 max-w-3xl text-[clamp(1.75rem,3.6vw,2.75rem)]">
              {QUOTES_TAKEAWAY}
            </h2>

            <Stagger as="ul" className="mt-12 grid gap-px bg-paper/15 sm:grid-cols-2 lg:grid-cols-3" gap={0.09}>
              {QUOTES.map((q) => (
                <StaggerItem as="li" key={q.company} className="bg-ink p-6">
                  <p className="text-[1.0625rem] italic leading-relaxed text-paper/90">
                    &ldquo;{q.quote}&rdquo;
                  </p>
                  <p className="mt-4 text-[0.75rem] uppercase tracking-[0.08em] text-paper/55">
                    {q.company} · {q.status}
                  </p>
                </StaggerItem>
              ))}
            </Stagger>

            <p className="source-line mt-8">
              Quotations are verbatim from the field records, original spelling retained.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------- photo band ------------------- */}
      <section className="relative isolate min-h-[22rem] overflow-hidden">
        <Parallax className="absolute inset-0" distance={70}>
          <Image
            src="/photos/05_decision_maker_meeting.jpeg"
            alt="Interviewing a decision-maker at his desk during a field visit."
            fill
            sizes="100vw"
            className="object-cover"
          />

        </Parallax>
        <div className="photo-scrim absolute inset-0" />
        <div className="relative z-10 flex min-h-[22rem] items-end">
          <div className="shell pb-10">
            <p className="max-w-2xl text-[1.0625rem] leading-relaxed text-paper">
              The fuel decision usually sits with procurement, accounts, operations or the owner.
              Reception is never the right question.
            </p>
            <Link
              href="/competition"
              className="mt-7 inline-flex items-center gap-2 text-[0.75rem] font-600 uppercase tracking-[0.1em] text-paper underline decoration-red decoration-2 underline-offset-[6px]"
            >
              Who they buy from today <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
