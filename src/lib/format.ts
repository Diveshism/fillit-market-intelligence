const EN = 'en-GB';

export const NOT_CAPTURED = 'Not captured';

/** Plain integer with thousands separators. */
export function num(n: number): string {
  return new Intl.NumberFormat(EN).format(n);
}

/** 5,053,413 → "5.05M". Used where the full figure would crowd the layout. */
export function compact(n: number, digits = 2): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(digits)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return num(n);
}

export function litres(n: number | null): string {
  if (n === null) return NOT_CAPTURED;
  return `${num(n)} L`;
}

export function aed(n: number): string {
  return `AED ${num(Math.round(n))}`;
}

export function aedCompact(n: number): string {
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(1)}M`;
  return aed(n);
}

export function pct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

/** "2026-09-15" → "15 Sep 2026". Dates in the dataset are always ISO. */
export function date(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(EN, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

/** Renders a possibly-absent field, never a blank cell. */
export function orNotCaptured(v: string | null | undefined): string {
  return v && v.trim().length ? v : NOT_CAPTURED;
}

/** Turns a stored website value into something safe to put in href. */
export function href(url: string | null): string | null {
  if (!url) return null;
  const v = url.trim();
  if (!/^https?:\/\//i.test(v)) {
    if (!/^[\w.-]+\.[a-z]{2,}/i.test(v)) return null;
    return `https://${v}`;
  }
  return v;
}

/** Strips the scheme for display. */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

/** First telephone number in a free-text contact field, for a tel: link. */
export function telHref(value: string | null): string | null {
  if (!value) return null;
  const match = value.replace(/[^\d+]/g, ' ').match(/\+?\d[\d\s]{6,}/);
  if (!match) return null;
  return `tel:${match[0].replace(/\s/g, '')}`;
}

/** CSV-escapes a single cell. */
function cell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const head = columns.map(cell).join(',');
  const body = rows.map((r) => columns.map((c) => cell(r[c])).join(','));
  return [head, ...body].join('\r\n');
}

export function downloadCsv(filename: string, csv: string): void {
  // BOM so Excel opens UTF-8 correctly — the handover audience lives in Excel.
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
