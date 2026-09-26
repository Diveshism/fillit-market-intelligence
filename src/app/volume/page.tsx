import type { Metadata } from 'next';
import Link from 'next/link';
import { volume, averageLitres, measuredVolume, largestAccount, STATUS_COLOR } from '@/lib/data';
import { profileHref } from '@/lib/collections';
import { PageHeader, Reveal, SectionHeading, SourceLine, Takeaway } from '@/components/ui/Section';
import { ConfidenceBadge, StatusBadge } from '@/components/ui/Badges';
import CountUp from '@/components/ui/CountUp';
import { num, pct } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Where the litres are',
  description:
    '58% of measured diesel volume sits in companies scored Cold. The finding that changes the priority list.',
};

export default function VolumePage() {
  const averages = { Hot: averageLitres('Hot'), Warm: averageLitres('Warm'), Cold: averageLitres('Cold') };
  const multiple = averages.Hot > 0 ? averages.Cold / averages.Hot : 0;

  const rows = [
    { status: 'Hot' as const, litres: volume.hot },
    { status: 'Warm' as const, litres: volume.warm },
    { status: 'Cold' as const, litres: volume.cold },
  ];

  const countFor = (s: string) => measuredVolume.filter((c) => c.status === s).length;
  const topCold = measuredVolume.filter((c) => c.status === 'Cold').slice(0, 10);

  return (
    <>
      <PageHeader
        eyebrow="Finding 01 · The finding that changes the priority list"
        title="Our own lead scoring was pointing at the wrong companies."
        standfirst={`Across the ${num(volume.companies_with_volume - 1)} Hot, Warm and Cold companies whose consumption converts to litres per month, excluding one outlier account.`}
        confidence="VERIFIED"
      />

      {/* ------------------- the headline ------------------- */}
      <section className="shell pb-16">
        <Reveal>
          <div className="grid gap-12 lg:grid-cols-[auto_1fr] lg:gap-20">
            <div>
              <p className="display text-[clamp(5rem,16vw,11rem)] leading-[0.85] text-red">
                <CountUp to={volume.cold_share_pct} decimals={0} suffix="%" />
              </p>
              <p className="mt-5 max-w-sm text-[1.0625rem] leading-relaxed text-graphite">
                of measured diesel volume sits in companies we scored <strong className="text-ink">Cold</strong>.
              </p>
            </div>

            <div className="self-center">
              <table className="w-full border-collapse text-left text-[0.9375rem]">
                <thead>
                  <tr className="border-b border-hairline">
                    <th scope="col" className="eyebrow py-3 pr-4">Measure</th>
                    <th scope="col" className="eyebrow py-3 pr-4 text-right">Hot</th>
                    <th scope="col" className="eyebrow py-3 pr-4 text-right">Warm</th>
                    <th scope="col" className="eyebrow py-3 text-right">Cold</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-hairline/60">
                    <th scope="row" className="py-3.5 pr-4 text-left font-normal text-graphite">Companies with measured volume</th>
                    {rows.map((r) => (
                      <td key={r.status} className="tnum py-3.5 pr-4 text-right text-ink">{countFor(r.status)}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-hairline/60">
                    <th scope="row" className="py-3.5 pr-4 text-left font-normal text-graphite">Total litres per month</th>
                    {rows.map((r) => (
                      <td key={r.status} className="tnum py-3.5 pr-4 text-right font-600 text-ink">{num(r.litres)}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-hairline/60">
                    <th scope="row" className="py-3.5 pr-4 text-left font-normal text-graphite">Share of measured volume</th>
                    {rows.map((r) => (
                      <td
                        key={r.status}
                        className="tnum py-3.5 pr-4 text-right font-600"
                        style={{ color: r.status === 'Cold' ? '#8D2635' : '#5C5C5C' }}
                      >
                        {pct((r.litres / volume.measured_excl_largest) * 100, 1)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row" className="py-3.5 pr-4 text-left font-normal text-graphite">Average per company</th>
                    {rows.map((r) => (
                      <td key={r.status} className="tnum py-3.5 pr-4 text-right text-ink">
                        {num(Math.round(averages[r.status]))} L
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>

              {/* Proportion bar */}
              <div className="mt-8 flex h-4 w-full overflow-hidden">
                {rows.map((r) => (
                  <span
                    key={r.status}
                    style={{
                      width: `${(r.litres / volume.measured_excl_largest) * 100}%`,
                      backgroundColor: STATUS_COLOR[r.status],
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <Takeaway>
            The average Cold company uses {num(Math.round(averages.Cold))} L a month —{' '}
            {multiple.toFixed(1)}× a Hot one. Escalate the top 10 Cold accounts by volume to a named
            account manager.
          </Takeaway>

          <SourceLine>
            Source: FILLIT_Master_Database.xlsx · {largestAccount?.company} is excluded from every
            figure on this page: at {num(volume.largest_account_lpm)} L a month it alone would
            outweigh everything else combined. Consumption in litres, gallons and AED was converted
            to one measure.
          </SourceLine>
        </Reveal>
      </section>

      {/* ------------------- the outlier ------------------- */}
      {largestAccount && (
        <section className="shell pb-16">
          <Reveal>
            <div className="border border-hairline bg-wash p-7 md:p-9">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <p className="eyebrow">The excluded outlier</p>
                  <h2 className="display mt-4 text-[clamp(1.5rem,3vw,2.25rem)]">
                    <Link
                      href={profileHref(largestAccount.id, 'volume')}
                      className="underline decoration-hairline underline-offset-[6px] hover:decoration-red"
                    >
                      {largestAccount.company}
                    </Link>
                  </h2>
                  <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-graphite">
                    Reports {largestAccount.consumption_raw}. At{' '}
                    <span className="tnum font-600 text-ink">{num(volume.largest_account_lpm)} L</span> a
                    month it is{' '}
                    {(volume.largest_account_lpm / volume.measured_excl_largest).toFixed(1)}× the
                    entire measured pool, so it is shown separately everywhere rather than folded in.
                  </p>
                </div>
                <StatusBadge status={largestAccount.status} />
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* ------------------- top cold accounts ------------------- */}
      <section className="shell pb-24">
        <Reveal>
          <SectionHeading
            eyebrow="Act on this first"
            title="The top 10 Cold accounts by measured volume."
            standfirst="Confirmed diesel users, not ready to switch — and holding most of the litres in the book. This is the list to give an account manager."
            confidence="VERIFIED"
          />

          <ol className="border-t border-hairline">
            {topCold.map((c, i) => (
              <li key={c.id} className="border-b border-hairline/60">
                <Link
                  href={profileHref(c.id, 'volume')}
                  className="grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 py-4 transition-colors hover:bg-red-wash/50"
                >
                  <span className="tnum text-[0.8125rem] text-graphite/60">{String(i + 1).padStart(2, '0')}</span>
                  <span>
                    <span className="text-[0.9375rem] font-medium text-ink underline decoration-hairline underline-offset-4">
                      {c.company}
                    </span>
                    <span className="source-line mt-0.5 block">
                      {c.zone} · {c.sector}
                      {c.current_supplier ? ` · buys from ${c.current_supplier}` : ''}
                    </span>
                  </span>
                  <span className="tnum shrink-0 text-[0.9375rem] font-600 text-ink">
                    {num(c.litres_per_month ?? 0)} L
                  </span>
                </Link>
              </li>
            ))}
          </ol>

          <div className="mt-8">
            <Link
              href="/companies/cold"
              className="inline-flex items-center gap-2 text-[0.75rem] font-600 uppercase tracking-[0.1em] text-ink underline decoration-red decoration-2 underline-offset-[6px]"
            >
              All {num(95)} Cold companies <span aria-hidden>→</span>
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
