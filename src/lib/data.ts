import raw from '@/data/fillit.json';
import type { Company, Dataset, Status, SectorRow, ZoneRow } from './types';

const dataset = raw as unknown as Dataset;

export const meta = dataset.meta;
export const summary = dataset.summary;
export const volume = dataset.volume;
export const weekly = dataset.weekly;
export const sectors: SectorRow[] = dataset.sectors;
export const zones: ZoneRow[] = dataset.zones;
export const companies: Company[] = dataset.companies;

const byId = new Map(companies.map((c) => [c.id, c]));
export const getCompany = (id: string) => byId.get(id);

/* ------------------------------------------------------------------ *
 * Classification
 *
 * Definitions are the workbook's own, from the Summary sheet:
 *   Green / confirmed diesel user = Hot + Warm + Cold
 *   Qualified                     = Hot + Warm
 *   Blocked or unresolved         = Appointment + Revisit
 * ------------------------------------------------------------------ */

export const STATUS_ORDER: Status[] = ['Hot', 'Warm', 'Cold', 'Appointment', 'Revisit', 'Invalid'];

export const GREEN: Status[] = ['Hot', 'Warm', 'Cold'];
export const QUALIFIED: Status[] = ['Hot', 'Warm'];
export const BLOCKED: Status[] = ['Appointment', 'Revisit'];

export const isGreen = (c: Company) => GREEN.includes(c.status);
export const isQualified = (c: Company) => QUALIFIED.includes(c.status);
export const isBlocked = (c: Company) => BLOCKED.includes(c.status);

export const STATUS_COLOR: Record<Status, string> = {
  Hot: '#2E7D4F',
  Warm: '#7BA05B',
  Cold: '#B8C4A8',
  Appointment: '#D4A537',
  Revisit: '#D07C2E',
  Invalid: '#B33A3A',
};

/** Definitions exactly as the deck states them on slide 5. */
export const STATUS_DEFINITION: Record<Status, string> = {
  Hot: 'Using diesel, high intent. Asked for a quote, sample or visit.',
  Warm: 'Using diesel, interested, needs a follow-up.',
  Cold: 'Confirmed diesel user, not ready to switch. A nurture list.',
  Appointment: 'Could not get in. Free zone, permit or gate pass needed.',
  Revisit: 'Unresolved. The process stopped, the company did not.',
  Invalid: 'Disqualified. Mostly a wrong address rather than no demand.',
};

export const STATUS_COUNT: Record<Status, number> = {
  Hot: summary.hot,
  Warm: summary.warm,
  Cold: summary.cold,
  Appointment: summary.appointment,
  Revisit: summary.revisit,
  Invalid: summary.invalid,
};

/* ------------------------------------------------------------------ *
 * Selectors
 * ------------------------------------------------------------------ */

export const byStatus = (s: Status) => companies.filter((c) => c.status === s);

export const greenCompanies = companies.filter(isGreen);
export const qualifiedCompanies = companies.filter(isQualified);
export const blockedCompanies = companies.filter(isBlocked);
export const selfGenerated = companies.filter((c) => c.lead_source === 'Self-generated');
export const plannedList = companies.filter((c) => c.lead_source === 'Planned list');
export const cafuAccounts = companies.filter((c) => c.mentions_cafu);

/**
 * Companies carrying a parsed monthly volume, largest first.
 * The largest account is excluded from the measured pool everywhere on the site,
 * exactly as the deck does — on its own it outweighs everything else combined.
 */
export const volumeRanking = companies
  .filter((c) => c.litres_per_month !== null)
  .sort((a, b) => (b.litres_per_month ?? 0) - (a.litres_per_month ?? 0));

export const largestAccount = volumeRanking.find((c) => c.id === volume.largest_account_id);

export const measuredVolume = volumeRanking.filter((c) => c.id !== volume.largest_account_id);

/** Average litres per month for a status, across companies with measured volume. */
export function averageLitres(status: Status): number {
  const group = measuredVolume.filter((c) => c.status === status);
  if (!group.length) return 0;
  return group.reduce((t, c) => t + (c.litres_per_month ?? 0), 0) / group.length;
}

/* ------------------------------------------------------------------ *
 * Facets
 * ------------------------------------------------------------------ */

function facet(key: 'sector' | 'zone' | 'emirate'): string[] {
  const counts = new Map<string, number>();
  for (const c of companies) {
    const v = c[key];
    if (!v) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v);
}

export const allSectors = facet('sector');
export const allZones = facet('zone');

/** Status counts for a set of companies, in canonical order. */
export function funnelOf(group: Company[]): { status: Status; n: number }[] {
  return STATUS_ORDER.map((status) => ({
    status,
    n: group.filter((c) => c.status === status).length,
  }));
}

/** Green rate for any set — the share confirmed as diesel users. */
export function greenRate(group: Company[]): number {
  if (!group.length) return 0;
  return (group.filter(isGreen).length / group.length) * 100;
}
