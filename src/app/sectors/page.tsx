import type { Metadata } from 'next';
import Link from 'next/link';
import { sectors, summary } from '@/lib/data';
import { PageHeader, Reveal, SectionHeading, SourceLine, Takeaway } from '@/components/ui/Section';
import SectorTornado from '@/components/charts/SectorTornado';
import SectorSolid from '@/components/sectors/SectorSolid';
import { num, pct } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Industries',
  description:
    'Metals converted at 67%. Contracting took 34% of the visits and returned 24%. Effort against yield across twelve industries.',
};

export default function SectorsPage() {
  const ranked = [...sectors].sort((a, b) => b.green_rate - a.green_rate);
  const total = summary.companies;
  const average = (summary.diesel_users / total) * 100;

  const metals = sectors.find((s) => s.sector === 'Metal, steel and aluminium')!;
  const contracting = sectors.find((s) => s.sector === 'Building and civil contracting')!;
  const marine = sectors.find((s) => s.sector === 'Marine, boats and shipping')!;

  const underworked = ranked.filter((s) => s.green_rate >= average && s.companies <= 25);

  return (
    <>
      <PageHeader
        eyebrow="Where the demand concentrates"
        title={`Metals converted at ${pct(metals.green_rate, 0)}. Contracting took ${pct((contracting.companies / total) * 100, 0)} of our visits and returned ${pct(contracting.green_rate, 0)}.`}
        standfirst="Green rate means the share of companies confirmed as diesel users: Hot, Warm or Cold."
        confidence="VERIFIED"
      />

      {/* ------------------- effort vs yield ------------------- */}
      <section className="shell pb-16">
        <Reveal>
          <SectorSolid sectors={ranked} average={average} />
          <Takeaway>
            Marine and boat building is the sleeper: {marine.companies} companies, and{' '}
            {marine.self_generated} of our {summary.self_generated} self-generated leads came from it.
          </Takeaway>
          <SourceLine>
            Source: FILLIT_Master_Database.xlsx, Sectors sheet · industry derived from the company
            name and recorded activity · n = {num(total)} companies · the red reference line is the
            programme-wide green rate of {pct(average, 1)}. Select any block to open its companies.
          </SourceLine>
        </Reveal>
      </section>

      {/* ------------------- effort against yield, flat ------------------- */}
      <section className="shell pb-16">
        <Reveal>
          <SectionHeading
            eyebrow="The same two measures, side by side"
            title="Effort on the left, result on the right."
            confidence="VERIFIED"
          />
          <SectorTornado sectors={ranked} total={total} average={average} />
        </Reveal>
      </section>

      {/* ------------------- full table ------------------- */}
      <section className="shell pb-16">
        <Reveal>
          <SectionHeading eyebrow="The full breakdown" title="Twelve industries, by outcome." confidence="VERIFIED" />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-left text-[0.875rem]">
              <thead>
                <tr className="border-b border-hairline">
                  <th scope="col" className="eyebrow py-3 pr-4">Industry</th>
                  <th scope="col" className="eyebrow py-3 pr-4 text-right">Visited</th>
                  <th scope="col" className="eyebrow py-3 pr-4 text-right">Hot</th>
                  <th scope="col" className="eyebrow py-3 pr-4 text-right">Warm</th>
                  <th scope="col" className="eyebrow py-3 pr-4 text-right">Cold</th>
                  <th scope="col" className="eyebrow py-3 pr-4 text-right">Invalid</th>
                  <th scope="col" className="eyebrow py-3 pr-4 text-right">Self-gen</th>
                  <th scope="col" className="eyebrow py-3 text-right">Green rate</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((s) => (
                  <tr key={s.sector} className="border-b border-hairline/60">
                    <th scope="row" className="py-3.5 pr-4 text-left font-normal">
                      <Link
                        href={`/companies?sector=${encodeURIComponent(s.sector)}`}
                        className="text-ink underline decoration-hairline underline-offset-4 hover:decoration-red"
                      >
                        {s.sector}
                      </Link>
                    </th>
                    <td className="tnum py-3.5 pr-4 text-right text-graphite">{s.companies}</td>
                    <td className="tnum py-3.5 pr-4 text-right text-graphite">{s.hot || '—'}</td>
                    <td className="tnum py-3.5 pr-4 text-right text-graphite">{s.warm || '—'}</td>
                    <td className="tnum py-3.5 pr-4 text-right text-graphite">{s.cold || '—'}</td>
                    <td className="tnum py-3.5 pr-4 text-right text-graphite">{s.invalid || '—'}</td>
                    <td className="tnum py-3.5 pr-4 text-right text-graphite">{s.self_generated || '—'}</td>
                    <td
                      className="tnum py-3.5 text-right font-600"
                      style={{ color: s.green_rate >= average ? '#05AF52' : '#5C5C5C' }}
                    >
                      {pct(s.green_rate, 1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* ------------------- underworked ------------------- */}
      <section className="shell pb-24">
        <Reveal>
          <SectionHeading
            eyebrow="Proven yield, barely worked"
            title="Strong green rates from small samples."
            standfirst="These industries beat the programme average on a fraction of the visits. They are the cheapest place to look next."
            confidence="VERIFIED"
          />

          <ul className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
            {underworked.map((s) => (
              <li key={s.sector} className="bg-paper p-6">
                <p className="display tnum text-[2rem] leading-none text-[#05AF52]">
                  {pct(s.green_rate, 1)}
                </p>
                <p className="mt-3 text-[0.9375rem] font-600 leading-tight text-ink">{s.sector}</p>
                <p className="source-line mt-2">
                  {num(s.companies)} visited · {pct((s.companies / total) * 100, 1)} of effort
                </p>
                <Link
                  href={`/companies?sector=${encodeURIComponent(s.sector)}`}
                  className="mt-4 inline-block text-[0.75rem] font-600 uppercase tracking-[0.08em] text-ink underline decoration-hairline underline-offset-4 hover:decoration-red"
                >
                  View →
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </>
  );
}
