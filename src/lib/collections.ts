import {
  companies, byStatus, blockedCompanies, greenCompanies, qualifiedCompanies,
  selfGenerated, plannedList, cafuAccounts, STATUS_ORDER,
} from './data';
import type { Company, Status } from './types';

/**
 * A named, ordered set of companies.
 *
 * Every list on the site resolves through here, so a profile page can rebuild the
 * set it was reached from using only the URL. That is what makes
 * `/company/:id?from=hot` survive a refresh and still offer previous/next through
 * the other 22 Hot companies.
 */
export interface Collection {
  key: string;
  label: string;
  href: string;
  companies: Company[];
}

/** Highest intent first, then largest measured volume, then alphabetical. */
export function defaultSort(list: Company[]): Company[] {
  return [...list].sort((a, b) => {
    const rank = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
    if (rank !== 0) return rank;
    const volume = (b.litres_per_month ?? -1) - (a.litres_per_month ?? -1);
    if (volume !== 0) return volume;
    return a.company.localeCompare(b.company);
  });
}

/** Largest measured volume first — used where litres are the point. */
export function byVolume(list: Company[]): Company[] {
  return [...list]
    .filter((c) => c.litres_per_month !== null)
    .sort((a, b) => (b.litres_per_month ?? 0) - (a.litres_per_month ?? 0));
}

export const STATUS_SLUGS = ['hot', 'warm', 'cold', 'appointment', 'revisit', 'invalid'] as const;
export type StatusSlug = (typeof STATUS_SLUGS)[number];

export const STATUS_OF_SLUG: Record<StatusSlug, Status> = {
  hot: 'Hot',
  warm: 'Warm',
  cold: 'Cold',
  appointment: 'Appointment',
  revisit: 'Revisit',
  invalid: 'Invalid',
};

export const SLUG_OF_STATUS: Record<Status, StatusSlug> = {
  Hot: 'hot',
  Warm: 'warm',
  Cold: 'cold',
  Appointment: 'appointment',
  Revisit: 'revisit',
  Invalid: 'invalid',
};

export function isStatusSlug(v: string): v is StatusSlug {
  return (STATUS_SLUGS as readonly string[]).includes(v);
}

/**
 * Resolves a `from` key to its collection. Unknown keys fall back to the whole
 * database rather than erroring, so a stale link still lands somewhere sensible.
 */
export function resolveCollection(key: string | undefined): Collection {
  const k = (key ?? 'all').trim();

  if (isStatusSlug(k)) {
    const status = STATUS_OF_SLUG[k];
    return {
      key: k,
      label: `${status} companies`,
      href: `/companies/${k}`,
      companies: defaultSort(byStatus(status)),
    };
  }

  switch (k) {
    case 'green':
      return { key: k, label: 'Confirmed diesel users', href: '/companies?green=1', companies: defaultSort(greenCompanies) };
    case 'qualified':
      return { key: k, label: 'Qualified companies', href: '/companies?qualified=1', companies: defaultSort(qualifiedCompanies) };
    case 'blocked':
      return { key: k, label: 'Blocked or unresolved', href: '/barriers', companies: defaultSort(blockedCompanies) };
    case 'self-generated':
      return { key: k, label: 'Self-generated leads', href: '/new-leads', companies: defaultSort(selfGenerated) };
    case 'planned-list':
      return { key: k, label: 'The planned list', href: '/new-leads', companies: defaultSort(plannedList) };
    case 'cafu':
      return { key: k, label: 'Accounts naming CAFU', href: '/competition', companies: defaultSort(cafuAccounts) };
    case 'volume':
      return { key: k, label: 'Ranked by measured volume', href: '/volume', companies: byVolume(companies) };
    default:
      break;
  }

  const zone = k.match(/^zone:(.+)$/);
  if (zone) {
    const name = decodeURIComponent(zone[1]);
    return {
      key: k,
      label: name,
      href: `/companies?zone=${encodeURIComponent(name)}`,
      companies: defaultSort(companies.filter((c) => c.zone === name)),
    };
  }

  const sector = k.match(/^sector:(.+)$/);
  if (sector) {
    const name = decodeURIComponent(sector[1]);
    return {
      key: k,
      label: name,
      href: `/companies?sector=${encodeURIComponent(name)}`,
      companies: defaultSort(companies.filter((c) => c.sector === name)),
    };
  }

  return { key: 'all', label: 'All companies', href: '/companies', companies: defaultSort(companies) };
}

/** Previous and next within the collection the profile was reached from. */
export function neighbours(collection: Collection, id: string) {
  const list = collection.companies;
  const i = list.findIndex((c) => c.id === id);
  if (i === -1) return { prev: undefined, next: undefined, index: -1, total: list.length };
  return {
    prev: i > 0 ? list[i - 1] : undefined,
    next: i < list.length - 1 ? list[i + 1] : undefined,
    index: i,
    total: list.length,
  };
}

/** Appends the originating collection to a profile link. */
export function profileHref(id: string, from?: string): string {
  const base = `/company/${id}`;
  if (!from || from === 'all') return base;
  return `${base}?from=${encodeURIComponent(from)}`;
}
