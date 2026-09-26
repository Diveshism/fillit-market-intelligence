import type { Metadata } from 'next';
import Link from 'next/link';
import { summary, selfGenerated, plannedList, isGreen, greenRate, sectors, weekly } from '@/lib/data';
import { defaultSort } from '@/lib/collections';
import { PageHeader, Reveal, SectionHeading, SourceLine, Takeaway } from '@/components/ui/Section';
import { ConfidenceBadge } from '@/components/ui/Badges';
import CountUp from '@/components/ui/CountUp';
import LeadSourceChart from '@/components/charts/LeadSourceChart';
import LeadUnitPanel from '@/components/leads/LeadUnitPanel';
import CompanyTable from '@/components/companies/CompanyTable';
import { num, pct } from '@/lib/format';

export const metadata: Metadata = {
  title: 'New leads generated',
  description:
    '136 leads found by walking in, against the 500-company planned list. 3.5 times the green rate and a third of the dead ends.',
};

export default function NewLeadsPage() {
  const self = defaultSort(selfGenerated);
  const planned = plannedList;

  const selfStats = {
    n: self.length,
    green: self.filter(isGreen).length,
    greenRate: greenRate(self),
    dead: self.filter((c) => c.status === 'Invalid').length,
    deadRate: (self.filter((c) => c.status === 'Invalid').length / self.length) * 100,
  };
  const plannedStats = {
    n: planned.length,
    green: planned.filter(isGreen).length,
    greenRate: greenRate(planned),
    dead: planned.filter((c) => c.status === 'Invalid').length,
    deadRate: (planned.filter((c) => c.status === 'Invalid').length / planned.length) * 100,
  };

  const split = (g: typeof self) => {
    const green = g.filter(isGreen).length;
    const dead = g.filter((c) => c.status === 'Invalid').length;
    return { green, dead, other: g.length - green - dead };
  };
  const selfSplit = split(self);
  const plannedSplit = split(planned as typeof self);

  const greenMultiple = selfStats.greenRate / plannedStats.greenRate;
  const deadMultiple = plannedStats.deadRate / selfStats.deadRate;
  const marine = sectors.find((s) => s.sector === 'Marine, boats and shipping');

  return (
    <>
      <PageHeader
        eyebrow="KPI · New leads generated"
        title="The leads we found ourselves beat the list on every measure."
        standfirst={`${num(selfStats.n)} companies identified by walking in, logged in the New Leads section, against the ${num(plannedStats.n)} companies from the planned list.`}
        confidence="VERIFIED"
      />

      {/* ------------------- headline ------------------- */}
      <section className="shell pb-14">
        <Reveal>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-10 border-t border-hairline pt-10 md:grid-cols-4">
            <div>
              <dt className="eyebrow">Leads we generated</dt>
              <dd className="display mt-3 text-[clamp(2rem,4vw,3rem)] leading-none text-red">
                <CountUp to={selfStats.n} />
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Of those, green</dt>
              <dd className="display mt-3 text-[clamp(2rem,4vw,3rem)] leading-none">
                <CountUp to={selfStats.green} />
              </dd>
              <p className="source-line mt-1">{pct(selfStats.greenRate, 1)} green rate</p>
            </div>
            <div>
              <dt className="eyebrow">Better than the list</dt>
              <dd className="display tnum mt-3 text-[clamp(2rem,4vw,3rem)] leading-none text-[#05AF52]">
                {greenMultiple.toFixed(1)}×
              </dd>
              <p className="source-line mt-1">on green rate</p>
            </div>
            <div>
              <dt className="eyebrow">Dead ends</dt>
              <dd className="display tnum mt-3 text-[clamp(2rem,4vw,3rem)] leading-none">
                {pct(selfStats.deadRate, 1)}
              </dd>
              <p className="source-line mt-1">against {pct(plannedStats.deadRate, 1)} on the list</p>
            </div>
          </dl>
        </Reveal>
      </section>

      {/* ------------------- every company, one cube ------------------- */}
      <section className="shell pb-16">
        <Reveal>
          <SectionHeading
            eyebrow="Every company, one cube"
            title="500 addresses we were handed. 136 we found ourselves."
            standfirst="The block on the right is the list. Most of it is red. The block on the left is what walking in produced."
            confidence="VERIFIED"
          />
          <LeadUnitPanel self={selfSplit} planned={plannedSplit} />
        </Reveal>
      </section>

      {/* ------------------- the comparison ------------------- */}
      <section className="shell pb-16">
        <Reveal>
          <SectionHeading
            eyebrow="Self-generated against the planned list"
            title="Better on green rate, and a third of the dead ends."
            confidence="VERIFIED"
          />

          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <LeadSourceChart self={selfStats} planned={plannedStats} />

            <div className="self-center">
              <p className="eyebrow">What that difference means</p>
              <ul className="mt-6 space-y-7">
                <li className="flex items-baseline gap-5">
                  <span className="display tnum shrink-0 text-[2rem] leading-none text-[#05AF52]">
                    {greenMultiple.toFixed(1)}×
                  </span>
                  <span className="text-[0.9375rem] leading-relaxed text-graphite">
                    better green rate than the prospect list we were handed.
                  </span>
                </li>
                <li className="flex items-baseline gap-5">
                  <span className="display tnum shrink-0 text-[2rem] leading-none text-[#05AF52]">
                    {deadMultiple.toFixed(1)}×
                  </span>
                  <span className="text-[0.9375rem] leading-relaxed text-graphite">
                    lower dead-end rate, because we chose the address ourselves rather than trusting
                    a stale list.
                  </span>
                </li>
                {marine && (
                  <li className="flex items-baseline gap-5">
                    <span className="display tnum shrink-0 text-[2rem] leading-none text-[#05AF52]">
                      {marine.self_generated}
                    </span>
                    <span className="text-[0.9375rem] leading-relaxed text-graphite">
                      of the {selfStats.n} came from marine and boat building alone, a sector nobody
                      had targeted.
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <Takeaway>
            Week 1 generated zero new leads and a {pct(weekly[0].dead_end_rate, 1)} dead-end rate.
            That is the whole argument.
          </Takeaway>

          <SourceLine>
            Source: FILLIT_Self_Generated_Leads.xlsx, verified against the master database · green =
            Hot, Warm or Cold · dead end = recorded Invalid · self-generated leads were logged in the
            New Leads section in Weeks 2 to 5.
          </SourceLine>
        </Reveal>
      </section>

      {/* ------------------- the list ------------------- */}
      <section className="shell pb-24">
        <Reveal>
          <div className="mb-6 flex items-start justify-between gap-6">
            <div>
              <p className="eyebrow eyebrow-rule">The list</p>
              <h2 className="display mt-6 text-[clamp(1.5rem,3vw,2.25rem)]">
                All {num(selfStats.n)} leads we generated.
              </h2>
              <p className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-graphite">
                Every company found by walking in rather than working a list. They carry the largest
                accounts in the entire book.
              </p>
            </div>
            <ConfidenceBadge level="VERIFIED" />
          </div>

          <CompanyTable companies={self} from="self-generated" exportName="fillit-self-generated" />

          <div className="mt-10">
            <Link
              href="/territory"
              className="inline-flex items-center gap-2 text-[0.75rem] font-600 uppercase tracking-[0.1em] text-ink underline decoration-red decoration-2 underline-offset-[6px]"
            >
              Where they came from <span aria-hidden>→</span>
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
