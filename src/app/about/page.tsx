import type { Metadata } from 'next';
import Image from 'next/image';
import { meta, summary, weekly, STATUS_ORDER, STATUS_COLOR, STATUS_DEFINITION, STATUS_COUNT } from '@/lib/data';
import {
  OBJECTIVES, METHOD, FIVE_QUESTIONS, METHOD_NOTE, TASKS, CHALLENGES, TOOLS,
  CHALLENGE_TAKEAWAY, CONTRIBUTION, TEAM_NOTE, HANDOVER, LEARNINGS, SOURCES,
  CONTENT_PLAN, ENGAGEMENT_RULES, ABOUT_FILLIT, CLOSING_LINE,
} from '@/lib/content';
import { PageHeader, Reveal, SectionHeading, SourceLine, Takeaway, Parallax } from '@/components/ui/Section';
import { ConfidenceBadge } from '@/components/ui/Badges';
import WeeklyProgress from '@/components/charts/WeeklyProgress';
import { num } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Method, journey & handover',
  description:
    'How the research was done, the triage system, the challenges, the content programme, and everything handed over.',
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="How the research was done"
        title="Three days at a desk, then six weeks on the road."
        standfirst="We began with desk research and cold calls for the first three days only, then moved entirely to in-person field visits."
        confidence="VERIFIED"
      />

      {/* ------------------- the brief ------------------- */}
      <section className="shell pb-16">
        <Reveal>
          <SectionHeading eyebrow="The brief" title="Find out who buys diesel in the UAE, and how." />
          <ol className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
            {OBJECTIVES.map((o) => (
              <li key={o.n} className="bg-paper p-6">
                <span className="display tnum text-[1.5rem] leading-none text-red">{o.n}</span>
                <h3 className="mt-3 font-display text-[1.0625rem] font-600 tracking-display text-ink">
                  {o.title}
                </h3>
                <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-graphite">{o.body}</p>
              </li>
            ))}
          </ol>
          <SourceLine>{ABOUT_FILLIT}</SourceLine>
        </Reveal>
      </section>

      {/* ------------------- method ------------------- */}
      <section className="shell pb-16">
        <Reveal>
          <SectionHeading eyebrow="How we worked" title="Desk, phone, then door to door." confidence="VERIFIED" />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-left text-[0.9375rem]">
              <thead>
                <tr className="border-b border-hairline">
                  <th scope="col" className="eyebrow py-3 pr-4">Phase</th>
                  <th scope="col" className="eyebrow py-3 pr-4">What we did</th>
                  <th scope="col" className="eyebrow py-3">What it told us</th>
                </tr>
              </thead>
              <tbody>
                {METHOD.map((m, i) => (
                  <tr key={i} className="border-b border-hairline/60">
                    <th scope="row" className="py-4 pr-4 text-left font-600 text-ink">{m.phase}</th>
                    <td className="py-4 pr-4 text-graphite">
                      <span className="font-600 text-ink">{m.what}.</span> {m.detail}
                    </td>
                    <td className="py-4 text-graphite">{m.told}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 border-l-2 border-red bg-red-wash p-5">
            <p className="eyebrow">The five questions, every time</p>
            <ol className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {FIVE_QUESTIONS.map((q) => (
                <li key={q} className="text-[0.9375rem] font-600 text-ink">{q}</li>
              ))}
            </ol>
          </div>

          <Takeaway>{METHOD_NOTE}</Takeaway>
        </Reveal>
      </section>

      {/* ------------------- photo band ------------------- */}
      <section className="relative isolate min-h-[22rem] overflow-hidden">
        <Parallax className="absolute inset-0" distance={70}>
          <Image
            src="/photos/06_team_office.jpeg"
            alt="The research team in FILLIT polo shirts with a manager, in the office."
            fill
            sizes="100vw"
            className="object-cover"
          />

        </Parallax>
        <div className="photo-scrim absolute inset-0" />
        <div className="relative z-10 flex min-h-[22rem] items-end">
          <div className="shell pb-10">
            <p className="max-w-2xl text-[1.0625rem] leading-relaxed text-paper">{TEAM_NOTE}</p>
          </div>
        </div>
      </section>

      {/* ------------------- triage ------------------- */}
      <section className="shell py-20">
        <Reveal>
          <SectionHeading
            eyebrow="The triage system"
            title="Six outcomes, applied to every record."
            standfirst={`Where the cell colour and the written interest level disagreed, the written level was used — ${num(summary.colour_conflicts)} records.`}
            confidence="VERIFIED"
          />

          <ul className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
            {STATUS_ORDER.map((s) => (
              <li key={s} className="bg-paper p-6">
                <span aria-hidden className="block h-[3px] w-10" style={{ backgroundColor: STATUS_COLOR[s] }} />
                <h3 className="mt-4 font-display text-[1.0625rem] font-600 tracking-display text-ink">{s}</h3>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-graphite">{STATUS_DEFINITION[s]}</p>
                <p className="tnum mt-4 text-[0.875rem] font-600 text-ink">{num(STATUS_COUNT[s])} companies</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* ------------------- weekly ------------------- */}
      <section className="shell pb-20">
        <Reveal>
          <SectionHeading eyebrow="Week by week" title="What each week produced." confidence="VERIFIED" />
          <WeeklyProgress weekly={weekly} />
        </Reveal>
      </section>

      {/* ------------------- journey ------------------- */}
      <section className="shell pb-20">
        <Reveal>
          <SectionHeading eyebrow="Internship journey" title="Tasks, challenges, and the tools used." />

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="eyebrow">Tasks assigned</p>
              <ul className="mt-5 border-t border-hairline">
                {TASKS.map((t) => (
                  <li key={t} className="border-b border-hairline/60 py-3 text-[0.9375rem] text-ink">{t}</li>
                ))}
              </ul>

              <p className="eyebrow mt-10">Tools and platforms</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {TOOLS.map((t) => (
                  <li key={t} className="rounded-[3px] border border-hairline px-3 py-1.5 text-[0.8125rem] text-graphite">
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="eyebrow">Challenges, and how they were addressed</p>
              <dl className="mt-5 border-t border-hairline">
                {CHALLENGES.map((c) => (
                  <div key={c.challenge} className="border-b border-hairline/60 py-3.5">
                    <dt className="text-[0.9375rem] font-600 text-ink">{c.challenge}</dt>
                    <dd className="mt-1 text-[0.875rem] leading-relaxed text-graphite">{c.fix}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <Takeaway>{CHALLENGE_TAKEAWAY}</Takeaway>
        </Reveal>
      </section>

      {/* ------------------- content programme ------------------- */}
      <section className="shell pb-20">
        <Reveal>
          <SectionHeading
            eyebrow="Social media and content work"
            title="A four-week LinkedIn plan, written post by post."
            standfirst="28 posts, all 10 content pillars, 13 formats. Week 1 creative is designed and ready. Built on this field research."
          />

          <div className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
            {CONTENT_PLAN.map((w) => (
              <article key={w.week} className="bg-paper p-6">
                <p className="eyebrow">{w.week}</p>
                <h3 className="mt-3 font-display text-[1.0625rem] font-600 tracking-display text-ink">
                  {w.objective}
                </h3>
                <p className="mt-3 text-[0.8125rem] leading-relaxed text-graphite">{w.posts}</p>
                <p className="source-line mt-4 border-t border-hairline pt-3">{w.status}</p>
              </article>
            ))}
          </div>

          <div className="mt-8">
            <p className="eyebrow">Engagement rules that shaped it</p>
            <ul className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
              {ENGAGEMENT_RULES.map((r) => (
                <li key={r} className="flex gap-3 text-[0.875rem] leading-relaxed text-graphite">
                  <span aria-hidden className="mt-[0.55em] h-[3px] w-3 shrink-0 bg-red" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* ------------------- contribution and handover ------------------- */}
      <section className="shell pb-20">
        <Reveal>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading eyebrow="Individual contribution" title={meta.author} />
              <ul className="border-t border-hairline">
                {CONTRIBUTION.map((c) => (
                  <li key={c} className="border-b border-hairline/60 py-3 text-[0.9375rem] leading-snug text-ink">
                    {c}
                  </li>
                ))}
              </ul>
              <SourceLine>{TEAM_NOTE}</SourceLine>
            </div>

            <div>
              <SectionHeading eyebrow="Files and assets handed over" title="What the next team starts from." />
              <dl className="border-t border-hairline">
                {HANDOVER.map((h) => (
                  <div key={h.asset} className="border-b border-hairline/60 py-3.5">
                    <dt className="text-[0.9375rem] font-600 text-ink">{h.asset}</dt>
                    <dd className="mt-1 text-[0.875rem] leading-relaxed text-graphite">{h.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ------------------- learnings ------------------- */}
      <section className="shell pb-20">
        <Reveal>
          <SectionHeading eyebrow="Key learnings" title="Three things worth carrying forward." />
          <ul className="grid gap-px border border-hairline bg-hairline md:grid-cols-3">
            {LEARNINGS.map((l) => (
              <li key={l.title} className="bg-paper p-7">
                <h3 className="font-display text-[1.0625rem] font-600 leading-snug tracking-display text-ink">
                  {l.title}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-graphite">{l.body}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* ------------------- sources ------------------- */}
      <section className="shell pb-20">
        <Reveal>
          <div className="flex items-start justify-between gap-6">
            <p className="eyebrow eyebrow-rule">Sources and references</p>
            <ConfidenceBadge level="SOURCED" />
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[38rem] border-collapse text-left text-[0.875rem]">
              <thead>
                <tr className="border-b border-hairline">
                  <th scope="col" className="eyebrow py-3 pr-4">Source</th>
                  <th scope="col" className="eyebrow py-3">Used for</th>
                </tr>
              </thead>
              <tbody>
                {SOURCES.map((s) => (
                  <tr key={s.source} className="border-b border-hairline/60">
                    <th scope="row" className={`py-3.5 pr-4 text-left ${s.main ? 'font-600 text-ink' : 'font-normal text-graphite'}`}>
                      {s.source}
                      {s.main && <span className="ml-2 text-[0.6875rem] uppercase tracking-[0.08em] text-red">Main source</span>}
                    </th>
                    <td className="py-3.5 text-graphite">{s.used}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <SourceLine>
            This site is generated directly from {meta.generated_from}. Every count, rate, area,
            industry, supplier and volume figure is recomputed from those rows at build time, and the
            six handed-over lead files are verified against the master on every build.
          </SourceLine>
        </Reveal>
      </section>

      {/* ------------------- close ------------------- */}
      <section className="on-ink">
        <div className="shell py-20 text-center">
          <p className="display mx-auto max-w-3xl text-[clamp(1.5rem,3.6vw,2.5rem)]">{CLOSING_LINE}</p>
          <p className="eyebrow mt-8">
            {meta.author} · {meta.role} · {meta.team} · September 2026
          </p>
        </div>
      </section>
    </>
  );
}
