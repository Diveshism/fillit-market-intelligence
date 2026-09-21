import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { companies, getCompany, STATUS_DEFINITION, volume } from '@/lib/data';
import { neighbours, profileHref, resolveCollection, SLUG_OF_STATUS } from '@/lib/collections';
import { StatusBadge, Flag, ConfidenceBadge } from '@/components/ui/Badges';
import VisitTimeline from '@/components/companies/VisitTimeline';
import {
  date, litres, num, orNotCaptured, telHref, NOT_CAPTURED,
} from '@/lib/format';

export function generateStaticParams() {
  return companies.map((c) => ({ id: c.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const c = getCompany(params.id);
  if (!c) return { title: 'Company not found' };
  return {
    title: c.company,
    description: `${c.status} · ${c.sector} · ${c.zone}. Field research profile from the FILLIT market research programme.`,
  };
}

export default function CompanyProfile({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { from?: string };
}) {
  const company = getCompany(params.id);
  if (!company) notFound();

  const collection = resolveCollection(searchParams?.from);
  const { prev, next, index, total } = neighbours(collection, company.id);

  const directTel = telHref(company.direct_number);
  const phoneTel = telHref(company.phone);
  const isLargest = company.id === volume.largest_account_id;

  return (
    <article className="pb-24">
      <header className="shell pt-28 md:pt-36">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[0.8125rem] text-graphite">
          <Link href="/companies" className="underline underline-offset-4 hover:text-ink">All companies</Link>
          {collection.key !== 'all' && (
            <>
              <span aria-hidden>·</span>
              <Link href={collection.href} className="underline underline-offset-4 hover:text-ink">
                {collection.label}
              </Link>
            </>
          )}
          <span aria-hidden>·</span>
          <span className="text-ink">{company.company}</span>
        </nav>

        <div className="mt-8 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={company.status} />
              <span className="text-[0.8125rem] text-graphite">{STATUS_DEFINITION[company.status]}</span>
            </div>
            <h1 className="display mt-5 text-[clamp(1.9rem,4.6vw,3.25rem)]">{company.company}</h1>
            <p className="mt-4 text-[0.9375rem] text-graphite">
              {company.sector} · {company.zone}
              {company.emirate ? ` · ${company.emirate}` : ''}
            </p>
          </div>
          <ConfidenceBadge level="VERIFIED" className="mt-2" />
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          <Flag tone={company.lead_source === 'Self-generated' ? 'green' : 'neutral'}>
            {company.lead_source === 'Self-generated' ? 'Self-generated lead' : 'From the planned list'}
          </Flag>
          {company.mentions_cafu && <Flag tone="red">Mentions CAFU</Flag>}
          {isLargest && <Flag tone="red">Largest account in the book</Flag>}
          {company.interest_level_applied && (
            <Flag tone="neutral">Status taken from the written interest level</Flag>
          )}
        </div>
      </header>

      <div className="shell mt-14 grid gap-12 lg:grid-cols-[1.55fr_1fr] lg:gap-16">
        <div className="space-y-12">
          <Panel title="Diesel profile">
            <Field label="Buys from today" value={orNotCaptured(company.current_supplier)} />
            <Field label="Consumption as recorded" value={orNotCaptured(company.consumption_raw)} />
            <Field
              label="Estimated volume"
              value={litres(company.litres_per_month)}
              note={
                company.litres_per_month !== null
                  ? 'Litres, gallons and AED amounts converted to one measure — see the method note.'
                  : undefined
              }
              emphasis={company.litres_per_month !== null}
            />
            <Field label="Fleet and equipment" value={orNotCaptured(company.fleet)} />
          </Panel>

          {company.pain_points && (
            <Panel title="Pain points recorded">
              <p className="text-[0.9375rem] leading-relaxed text-ink">{company.pain_points}</p>
            </Panel>
          )}

          {company.comments && (
            <Panel title="Field notes">
              <p className="whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink">
                {company.comments}
              </p>
              <p className="source-line mt-4">
                Recorded on site on the day of the visit. Original spelling retained.
              </p>
            </Panel>
          )}

          <Panel title="Visit history">
            <VisitTimeline history={company.status_history} />
            <p className="source-line mt-5">
              {num(company.visits)} {company.visits === 1 ? 'visit' : 'visits'}
              {company.first_visit ? ` · first ${date(company.first_visit)}` : ''}
              {company.last_visit ? ` · latest ${date(company.last_visit)}` : ''} · the company carries
              the outcome of its most recent visit.
            </p>
          </Panel>

          {(company.status_by_colour || company.interest_level_written) && (
            <Panel title="How the status was set">
              <Field label="Cell colour on the sheet" value={orNotCaptured(company.status_by_colour)} />
              <Field label="Written interest level" value={orNotCaptured(company.interest_level_written)} />
              <Field
                label="Applied"
                value={
                  company.interest_level_applied
                    ? 'Written interest level — it disagreed with the colour'
                    : 'Colour and written level agreed on the final visit'
                }
              />
            </Panel>
          )}
        </div>

        <aside className="space-y-10 lg:sticky lg:top-24 lg:self-start">
          <Panel title="Contact">
            <Field label="Contact person" value={orNotCaptured(company.contact_person)} />
            <Field
              label="Direct number"
              value={orNotCaptured(company.direct_number)}
              link={directTel ?? undefined}
            />
            <Field label="Phone" value={orNotCaptured(company.phone)} link={phoneTel ?? undefined} />
            <Field
              label="Email"
              value={orNotCaptured(company.email)}
              link={company.email ? `mailto:${company.email}` : undefined}
            />
          </Panel>

          <Panel title="Location">
            <Field label="Area" value={company.zone} link={`/companies?zone=${encodeURIComponent(company.zone)}`} />
            <Field label="Emirate" value={orNotCaptured(company.emirate)} />
            <Field label="Recorded address" value={orNotCaptured(company.location)} />
          </Panel>

          <Panel title="Classification">
            <Field label="Industry" value={company.sector} link={`/companies?sector=${encodeURIComponent(company.sector)}`} />
            <Field label="Lead source" value={company.lead_source} />
            <Field label="Status" value={company.status} link={`/companies/${SLUG_OF_STATUS[company.status]}`} />
          </Panel>
        </aside>
      </div>

      {index !== -1 && total > 1 && (
        <nav
          aria-label={`Navigate within ${collection.label}`}
          className="no-print shell mt-20 border-t border-hairline pt-8"
        >
          <p className="eyebrow text-center">
            {index + 1} of {total} in {collection.label}
          </p>
          <div className="mt-6 flex items-stretch justify-between gap-4">
            {prev ? (
              <Link href={profileHref(prev.id, collection.key)} className="group flex max-w-[45%] flex-col items-start text-left">
                <span className="eyebrow group-hover:text-ink">← Previous</span>
                <span className="mt-2 text-[0.9375rem] font-medium text-ink underline decoration-hairline underline-offset-4 group-hover:decoration-red">
                  {prev.company}
                </span>
              </Link>
            ) : <span />}
            {next ? (
              <Link href={profileHref(next.id, collection.key)} className="group flex max-w-[45%] flex-col items-end text-right">
                <span className="eyebrow group-hover:text-ink">Next →</span>
                <span className="mt-2 text-[0.9375rem] font-medium text-ink underline decoration-hairline underline-offset-4 group-hover:decoration-red">
                  {next.company}
                </span>
              </Link>
            ) : <span />}
          </div>
        </nav>
      )}
    </article>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="eyebrow eyebrow-rule">{title}</h2>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label, value, note, link, emphasis,
}: {
  label: string; value: string; note?: string; link?: string; emphasis?: boolean;
}) {
  const missing = value === NOT_CAPTURED;
  const body = (
    <span
      className={`${emphasis ? 'font-display text-[1.25rem] font-600 tracking-display' : 'text-[0.9375rem]'} ${
        missing ? 'text-graphite/50' : 'text-ink'
      } ${link && !missing ? 'underline decoration-hairline underline-offset-4 hover:decoration-red' : ''}`}
    >
      {value}
    </span>
  );

  return (
    <div className="grid grid-cols-[9.5rem_1fr] items-baseline gap-4 border-b border-hairline/55 pb-4 last:border-0 sm:grid-cols-[11rem_1fr]">
      <dt className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-graphite">{label}</dt>
      <dd>
        {link && !missing ? (
          <a href={link}>{body}</a>
        ) : body}
        {note && <p className="source-line mt-1.5">{note}</p>}
      </dd>
    </div>
  );
}
