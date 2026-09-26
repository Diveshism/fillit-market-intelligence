'use client';

import Link from 'next/link';
import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';
import {
  flexRender, getCoreRowModel, getSortedRowModel, useReactTable,
  type ColumnDef, type SortingState,
} from '@tanstack/react-table';
import type { Company, Status } from '@/lib/types';
import { STATUS_ORDER, STATUS_COLOR } from '@/lib/data';
import { profileHref } from '@/lib/collections';
import { StatusBadge, StatusDot } from '@/components/ui/Badges';
import { downloadCsv, litres, num, orNotCaptured, toCsv } from '@/lib/format';

interface Props {
  companies: Company[];
  /** Collection key carried into each profile link, for previous/next. */
  from: string;
  exportName: string;
  showStatusFilter?: boolean;
  initialSector?: string;
  initialZone?: string;
}

const PAGE_SIZE = 40;

export default function CompanyTable({
  companies, from, exportName, showStatusFilter = true, initialSector = '', initialZone = '',
}: Props) {
  const [query, setQuery] = useState('');
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [sector, setSector] = useState(initialSector);
  const [zone, setZone] = useState(initialZone);
  const [source, setSource] = useState('');
  const [flags, setFlags] = useState({ cafu: false, volume: false, contact: false });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [page, setPage] = useState(0);

  const sectors = useMemo(() => [...new Set(companies.map((c) => c.sector))].sort(), [companies]);
  const zones = useMemo(() => [...new Set(companies.map((c) => c.zone))].sort(), [companies]);

  /** Search across the fields a researcher would actually recall. */
  const fuse = useMemo(
    () =>
      new Fuse(companies, {
        keys: [
          { name: 'company', weight: 0.5 },
          { name: 'contact_person', weight: 0.15 },
          { name: 'current_supplier', weight: 0.1 },
          { name: 'location', weight: 0.1 },
          { name: 'comments', weight: 0.1 },
          { name: 'sector', weight: 0.05 },
        ],
        threshold: 0.33,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [companies],
  );

  const rows = useMemo(() => {
    let list = query.trim().length >= 2 ? fuse.search(query.trim()).map((r) => r.item) : companies;
    if (statuses.length) list = list.filter((c) => statuses.includes(c.status));
    if (sector) list = list.filter((c) => c.sector === sector);
    if (zone) list = list.filter((c) => c.zone === zone);
    if (source) list = list.filter((c) => c.lead_source === source);
    if (flags.cafu) list = list.filter((c) => c.mentions_cafu);
    if (flags.volume) list = list.filter((c) => c.litres_per_month !== null);
    if (flags.contact) list = list.filter((c) => c.contact_person);
    return list;
  }, [companies, fuse, query, statuses, sector, zone, source, flags]);

  const columns = useMemo<ColumnDef<Company>[]>(
    () => [
      {
        accessorKey: 'company',
        header: 'Company',
        cell: ({ row }) => (
          <Link href={profileHref(row.original.id, from)} className="group flex items-start gap-2.5 font-medium text-ink">
            <span className="mt-[7px]"><StatusDot status={row.original.status} /></span>
            <span className="underline decoration-hairline decoration-1 underline-offset-[3px] group-hover:decoration-red">
              {row.original.company}
            </span>
          </Link>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        sortingFn: (a, b) => STATUS_ORDER.indexOf(a.original.status) - STATUS_ORDER.indexOf(b.original.status),
        cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" />,
      },
      { accessorKey: 'zone', header: 'Area' },
      { accessorKey: 'sector', header: 'Industry' },
      {
        accessorKey: 'current_supplier',
        header: 'Buys from today',
        cell: ({ row }) => (
          <span className={row.original.current_supplier ? '' : 'text-graphite/55'}>
            {orNotCaptured(row.original.current_supplier)}
          </span>
        ),
      },
      {
        accessorKey: 'litres_per_month',
        header: 'Litres / month',
        sortUndefined: 'last',
        cell: ({ row }) => (
          <span className={`tnum ${row.original.litres_per_month ? 'font-medium' : 'text-graphite/55'}`}>
            {litres(row.original.litres_per_month)}
          </span>
        ),
      },
      {
        accessorKey: 'contact_person',
        header: 'Contact',
        cell: ({ row }) => (
          <span className={row.original.contact_person ? '' : 'text-graphite/55'}>
            {orNotCaptured(row.original.contact_person)}
          </span>
        ),
      },
    ],
    [from],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const sorted = table.getRowModel().rows;
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = sorted.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  function exportCsv() {
    const keys = [
      'company', 'status', 'zone', 'sector', 'emirate', 'location',
      'contact_person', 'phone', 'email',
      'current_supplier', 'consumption_raw', 'litres_per_month', 'fleet', 'pain_points',
      'comments', 'first_visit', 'last_visit', 'visits', 'lead_source', 'mentions_cafu',
    ];
    downloadCsv(`${exportName}-${rows.length}-companies.csv`, toCsv(rows as unknown as Record<string, unknown>[], keys));
  }

  const reset = () => {
    setQuery(''); setStatuses([]); setSector(''); setZone(''); setSource('');
    setFlags({ cafu: false, volume: false, contact: false }); setPage(0);
  };

  const filtered = rows.length !== companies.length;

  return (
    <div>
      <div className="no-print rounded-[3px] border border-hairline bg-wash p-4 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label htmlFor="company-search" className="eyebrow">Search</label>
            <input
              id="company-search"
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(0); }}
              placeholder="Company, contact, supplier, area or field note…"
              className="mt-2 w-full border-b border-hairline bg-transparent pb-2 text-[0.9375rem] outline-none placeholder:text-graphite/45 focus:border-red"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Select label="Industry" value={sector} onChange={(v) => { setSector(v); setPage(0); }} options={sectors} allLabel="All industries" />
            <Select label="Area" value={zone} onChange={(v) => { setZone(v); setPage(0); }} options={zones} allLabel="All areas" />
            <Select label="Source" value={source} onChange={(v) => { setSource(v); setPage(0); }} options={['Self-generated', 'Planned list']} allLabel="Both sources" />
          </div>
        </div>

        {showStatusFilter && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="eyebrow mr-1">Status</span>
            {STATUS_ORDER.map((s) => {
              const on = statuses.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setStatuses((prev) => (on ? prev.filter((x) => x !== s) : [...prev, s]));
                    setPage(0);
                  }}
                  className={`rounded-[3px] border px-2.5 py-1 text-[0.6875rem] font-600 uppercase tracking-[0.08em] transition-colors ${
                    on ? 'border-transparent text-paper' : 'border-hairline text-graphite hover:border-graphite'
                  }`}
                  style={on ? { backgroundColor: STATUS_COLOR[s], color: s === 'Cold' ? '#1A1A1A' : '#FFFFFF' } : undefined}
                >
                  {s}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-1">Filters</span>
          <Toggle on={flags.cafu} onClick={() => { setFlags((f) => ({ ...f, cafu: !f.cafu })); setPage(0); }}>
            Mentions CAFU
          </Toggle>
          <Toggle on={flags.volume} onClick={() => { setFlags((f) => ({ ...f, volume: !f.volume })); setPage(0); }}>
            Volume measured
          </Toggle>
          <Toggle on={flags.contact} onClick={() => { setFlags((f) => ({ ...f, contact: !f.contact })); setPage(0); }}>
            Named contact
          </Toggle>
        </div>

        <div className="hairline-rule mt-5 flex flex-wrap items-center justify-between gap-3 pt-4">
          <p className="text-[0.8125rem] text-graphite">
            <span className="tnum font-600 text-ink">{num(rows.length)}</span> of {num(companies.length)} companies
            {filtered && (
              <button type="button" onClick={reset} className="ml-3 text-red underline underline-offset-2">Clear filters</button>
            )}
          </p>
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-[3px] border border-ink px-3.5 py-1.5 text-[0.75rem] font-600 uppercase tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[56rem] border-collapse text-left text-[0.875rem]">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-hairline">
                {hg.headers.map((h) => {
                  const dir = h.column.getIsSorted();
                  return (
                    <th key={h.id} scope="col" className="py-3 pr-4 align-bottom">
                      {h.column.getCanSort() ? (
                        <button type="button" onClick={h.column.getToggleSortingHandler()} className="eyebrow flex items-center gap-1.5 hover:text-ink">
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          <span aria-hidden className={dir ? 'text-red' : 'text-hairline'}>
                            {dir === 'asc' ? '↑' : dir === 'desc' ? '↓' : '↕'}
                          </span>
                        </button>
                      ) : (
                        <span className="eyebrow">{flexRender(h.column.columnDef.header, h.getContext())}</span>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id} className="border-b border-hairline/60 align-top transition-colors hover:bg-red-wash/60">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-3.5 pr-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {visible.length === 0 && (
          <p className="py-16 text-center text-[0.9375rem] text-graphite">
            No companies match these filters.{' '}
            <button type="button" onClick={reset} className="text-red underline underline-offset-2">Clear them</button>.
          </p>
        )}
      </div>

      {pageCount > 1 && (
        <div className="no-print mt-8 flex items-center justify-between">
          <button
            type="button"
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded-[3px] border border-hairline px-3.5 py-1.5 text-[0.75rem] font-600 uppercase tracking-[0.08em] text-graphite transition-colors hover:border-ink hover:text-ink disabled:opacity-35"
          >
            Previous
          </button>
          <p className="text-[0.8125rem] text-graphite">
            Page <span className="tnum font-600 text-ink">{safePage + 1}</span> of <span className="tnum">{pageCount}</span>
          </p>
          <button
            type="button"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            className="rounded-[3px] border border-hairline px-3.5 py-1.5 text-[0.75rem] font-600 uppercase tracking-[0.08em] text-graphite transition-colors hover:border-ink hover:text-ink disabled:opacity-35"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function Select({
  label, value, onChange, options, allLabel,
}: { label: string; value: string; onChange: (v: string) => void; options: string[]; allLabel: string }) {
  return (
    <div>
      <label className="eyebrow block" htmlFor={`filter-${label}`}>{label}</label>
      <select
        id={`filter-${label}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full max-w-[13rem] border-b border-hairline bg-transparent pb-2 text-[0.8125rem] outline-none focus:border-red"
      >
        <option value="">{allLabel}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`rounded-[3px] border px-2.5 py-1 text-[0.6875rem] font-medium transition-colors ${
        on ? 'border-ink bg-ink text-paper' : 'border-hairline text-graphite hover:border-graphite'
      }`}
    >
      {children}
    </button>
  );
}
