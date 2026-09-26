import type { Metadata } from 'next';
import Link from 'next/link';
import { RECOMMENDATIONS, READY_NOW, READY_NOW_NOTE, ACTION_PLAN, PLAN_CLOSE } from '@/lib/content';
import { PageHeader, Reveal, SectionHeading, SourceLine } from '@/components/ui/Section';
import { ConfidenceBadge } from '@/components/ui/Badges';

export const metadata: Metadata = {
  title: 'Recommendations',
  description:
    'Five recommendations, six things ready to implement this month, and a growth plan built for the commercial team.',
};

export default function RecommendationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Top five recommendations"
        title="What we recommend, and what it is worth."
        standfirst="Every action traces back to a finding. None of it needs new headcount."
      />

      {/* ------------------- the five ------------------- */}
      <section className="shell pb-20">
        <Reveal>
          <ol className="border-t border-hairline">
            {RECOMMENDATIONS.map((r) => (
              <li key={r.n} className="border-b border-hairline py-8">
                <div className="grid gap-5 md:grid-cols-[3rem_1fr_14rem] md:gap-8">
                  <span className="display tnum text-[1.75rem] leading-none text-red">{r.n}</span>
                  <div>
                    <h2 className="font-display text-[1.25rem] font-600 leading-snug tracking-display text-ink md:text-[1.5rem]">
                      {r.title}
                    </h2>
                    <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-graphite">{r.why}</p>
                  </div>
                  <div className="md:text-right">
                    <p className="text-[0.9375rem] font-600 leading-snug text-ink">{r.effect}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      {/* ------------------- ready now ------------------- */}
      <section className="shell pb-20">
        <Reveal>
          <SectionHeading
            eyebrow="Ready to implement this week"
            title="Six things that use data already collected."
            confidence="VERIFIED"
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] border-collapse text-left text-[0.9375rem]">
              <thead>
                <tr className="border-b border-hairline">
                  <th scope="col" className="eyebrow py-3 pr-4">Ready this week</th>
                  <th scope="col" className="eyebrow py-3 pr-4">What it uses</th>
                  <th scope="col" className="eyebrow py-3">Expected business impact</th>
                </tr>
              </thead>
              <tbody>
                {READY_NOW.map((r) => (
                  <tr key={r.item} className="border-b border-hairline/60">
                    <th scope="row" className="py-4 pr-4 text-left font-600 text-ink">{r.item}</th>
                    <td className="py-4 pr-4 text-graphite">{r.uses}</td>
                    <td className="py-4 text-graphite">{r.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="takeaway mt-8 text-[0.9375rem] font-600 leading-relaxed text-ink">
            {READY_NOW_NOTE}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/companies/hot"
              className="inline-flex items-center gap-2 border border-ink px-4 py-2 text-[0.75rem] font-600 uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              Open the 27 Hot leads
            </Link>
            <Link
              href="/competition"
              className="inline-flex items-center gap-2 border border-hairline px-4 py-2 text-[0.75rem] font-600 uppercase tracking-[0.1em] text-graphite transition-colors hover:border-ink hover:text-ink"
            >
              Open the CAFU-affected list
            </Link>
            <Link
              href="/volume"
              className="inline-flex items-center gap-2 border border-hairline px-4 py-2 text-[0.75rem] font-600 uppercase tracking-[0.1em] text-graphite transition-colors hover:border-ink hover:text-ink"
            >
              Open the top 10 Cold
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ------------------- the plan ------------------- */}
      <section className="on-ink">
        <div className="shell py-20">
          <Reveal>
            <div className="flex items-start justify-between gap-6">
              <p className="eyebrow eyebrow-rule">The plan</p>
              <ConfidenceBadge level="DERIVED" />
            </div>

            <h2 className="display mt-7 max-w-3xl text-[clamp(1.75rem,3.6vw,2.75rem)]">
              Three months, then months four to six.
            </h2>
            <p className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-paper/70">
              Built for the commercial team, not the research team.
            </p>

            <div className="mt-12 grid gap-px bg-paper/15 md:grid-cols-2 lg:grid-cols-4">
              {ACTION_PLAN.map((m) => (
                <article key={m.window} className="bg-ink p-7">
                  <p className="eyebrow">{m.window}</p>
                  <h3 className="mt-3 font-display text-[1.125rem] font-600 tracking-display text-paper">
                    {m.theme}
                  </h3>
                  <ul className="mt-6 space-y-4">
                    {m.actions.map((a) => (
                      <li key={a} className="border-t border-paper/15 pt-3 text-[0.875rem] leading-snug text-paper/85">
                        {a}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 text-[0.6875rem] uppercase tracking-[0.08em] text-paper/50">
                    {m.owner}
                  </p>
                </article>
              ))}
            </div>

            <p className="mt-12 max-w-3xl border-l-2 border-red pl-5 text-[1.0625rem] leading-relaxed text-paper">
              {PLAN_CLOSE}
            </p>

            <SourceLine>
              The plan is a recommendation, not a measured outcome. Every action it contains traces
              to a finding computed from the field dataset.
            </SourceLine>
          </Reveal>
        </div>
      </section>
    </>
  );
}
