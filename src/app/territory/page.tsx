import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { zones, summary } from '@/lib/data';
import { TERRITORY_PLAN, TERRITORY_NOTE, JEBEL_ALI } from '@/lib/content';
import { PageHeader, Reveal, SectionHeading, SourceLine, Takeaway, Parallax } from '@/components/ui/Section';
import { ConfidenceBadge } from '@/components/ui/Badges';
import TerritoryMap from '@/components/territory/TerritoryMap';
import { num, pct } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Territory',
  description:
    'Al Sajaa returned 84.6% green. Jebel Ali returned no Hot leads at all. An interactive 3D map of every area covered.',
};

const ACTION_STYLE: Record<string, { label: string; colour: string }> = {
  work: { label: 'Work it', colour: '#05AF52' },
  unlock: { label: 'Unlock it', colour: '#E0A020' },
  stop: { label: 'Stop visiting', colour: '#8D2635' },
};

export default function TerritoryPage() {
  const sajaa = zones.find((z) => z.zone === 'Al Sajaa, Sharjah')!;
  const ranked = [...zones].sort((a, b) => b.green_rate - a.green_rate);

  return (
    <>
      <PageHeader
        eyebrow="Where the demand concentrates"
        title="Al Sajaa returned 84.6% green. Jebel Ali returned no Hot leads at all."
        standfirst={`Jebel Ali is not a demand problem. ${JEBEL_ALI.blocked} of its ${JEBEL_ALI.companies} companies were blocked at the gate.`}
        confidence="VERIFIED"
      />

      {/* ------------------- the map ------------------- */}
      <section className="shell pb-14">
        <Reveal>
          <TerritoryMap zones={zones} />
          <SourceLine>
            Source: FILLIT_Master_Database.xlsx, Zones sheet · area derived from the recorded
            location · boundaries: Natural Earth admin-1 · markers are approximate area centroids,
            used for placement only and never for a figure · pillar height = companies visited,
            square-rooted so small areas stay legible · colour = green rate. The{' '}
            {num(zones.find((z) => z.zone === 'Unspecified')?.companies ?? 0)} companies with no
            recorded area are listed but not placed.
          </SourceLine>
        </Reveal>
      </section>

      {/* ------------------- ranked table ------------------- */}
      <section className="shell pb-16">
        <Reveal>
          <SectionHeading
            eyebrow="Every area covered"
            title="Green rate against companies visited."
            confidence="VERIFIED"
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[38rem] border-collapse text-left text-[0.875rem]">
              <thead>
                <tr className="border-b border-hairline">
                  <th scope="col" className="eyebrow py-3 pr-4">Area</th>
                  <th scope="col" className="eyebrow py-3 pr-4 text-right">Visited</th>
                  <th scope="col" className="eyebrow py-3 pr-4 text-right">Hot</th>
                  <th scope="col" className="eyebrow py-3 pr-4 text-right">Blocked</th>
                  <th scope="col" className="eyebrow py-3 pr-4 text-right">Self-gen</th>
                  <th scope="col" className="eyebrow py-3 text-right">Green rate</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((z) => (
                  <tr key={z.zone} className="border-b border-hairline/60">
                    <th scope="row" className="py-3.5 pr-4 text-left font-normal">
                      <Link
                        href={`/companies?zone=${encodeURIComponent(z.zone)}`}
                        className="text-ink underline decoration-hairline underline-offset-4 hover:decoration-red"
                      >
                        {z.zone}
                      </Link>
                    </th>
                    <td className="tnum py-3.5 pr-4 text-right text-graphite">{z.companies}</td>
                    <td className="tnum py-3.5 pr-4 text-right text-graphite">{z.hot || '—'}</td>
                    <td className="tnum py-3.5 pr-4 text-right text-graphite">{z.appointment || '—'}</td>
                    <td className="tnum py-3.5 pr-4 text-right text-graphite">{z.self_generated || '—'}</td>
                    <td
                      className="tnum py-3.5 text-right font-600"
                      style={{ color: z.green_rate >= 40 ? '#05AF52' : '#5C5C5C' }}
                    >
                      {pct(z.green_rate, 1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Takeaway>
            Dubai Industrial City and Dubai Investment Park together: 58 companies at 48% green, and
            16 self-generated leads. Al Sajaa returned {pct(sajaa.green_rate, 1)} from just{' '}
            {sajaa.companies} companies.
          </Takeaway>
        </Reveal>
      </section>

      {/* ------------------- where to send the team ------------------- */}
      <section className="shell pb-16">
        <Reveal>
          <SectionHeading
            eyebrow="Where to send the team next"
            title="Four territories to work, one to stop visiting."
            standfirst={TERRITORY_NOTE}
            confidence="VERIFIED"
          />

          <ol className="border-t border-hairline">
            {TERRITORY_PLAN.map((t) => {
              const style = ACTION_STYLE[t.action];
              return (
                <li key={t.territory} className="border-b border-hairline py-6">
                  <div className="grid gap-4 md:grid-cols-[3.5rem_1fr_8rem] md:gap-8">
                    <span
                      className="display tnum text-[1.75rem] leading-none"
                      style={{ color: style.colour }}
                    >
                      {t.rank}
                    </span>
                    <div>
                      <h3 className="font-display text-[1.125rem] font-600 leading-snug tracking-display text-ink md:text-[1.375rem]">
                        {t.territory}
                      </h3>
                      <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-graphite">
                        {t.why}
                      </p>
                    </div>
                    <div className="md:text-right">
                      <span
                        className="inline-block rounded-[3px] border px-2.5 py-1 text-[0.625rem] font-600 uppercase tracking-[0.1em]"
                        style={{ borderColor: style.colour, color: style.colour }}
                      >
                        {style.label}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </Reveal>
      </section>

      {/* ------------------- section break ------------------- */}
      <section className="relative isolate min-h-[24rem] overflow-hidden">
        <Parallax className="absolute inset-0" distance={70}>
          <Image
            src="/photos/07_truck_field.jpeg"
            alt="Beside a red Volvo tractor unit during fieldwork in the industrial corridor."
            fill
            sizes="100vw"
            className="object-cover"
          />

        </Parallax>
        <div className="photo-scrim absolute inset-0" />
        <div className="relative z-10 flex min-h-[24rem] items-end">
          <div className="shell pb-12">
            <p className="display max-w-2xl text-[clamp(1.5rem,3.4vw,2.5rem)] text-paper">
              Four emirates, {num(zones.length - 1)} areas, {num(summary.field_visits)} visits on the
              ground.
            </p>
            <Link
              href="/companies"
              className="mt-7 inline-flex items-center gap-2 text-[0.75rem] font-600 uppercase tracking-[0.1em] text-paper underline decoration-red decoration-2 underline-offset-[6px]"
            >
              Open the database <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
