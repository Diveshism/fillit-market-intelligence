import Link from 'next/link';
import { meta, summary } from '@/lib/data';
import { num } from '@/lib/format';

export default function SiteFooter() {
  return (
    <footer className="on-ink">
      <div className="shell py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="eyebrow">{meta.role} · {meta.team}</p>
            <p className="mt-4 max-w-md font-display text-2xl font-600 leading-[1.15] tracking-display">
              {num(summary.companies)} companies visited across the UAE industrial corridors.
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-paper/70">
              A six-week field research programme for {meta.company}, {meta.field_period}.
              {' '}{num(summary.field_visits)} in-person visits, every company classified.
            </p>
          </div>

          <div>
            <p className="eyebrow">The findings</p>
            <ul className="mt-4 space-y-2 text-sm text-paper/75">
              <li><Link className="hover:text-paper" href="/volume">Where the litres are</Link></li>
              <li><Link className="hover:text-paper" href="/competition">Competitor landscape</Link></li>
              <li><Link className="hover:text-paper" href="/new-leads">New leads generated</Link></li>
              <li><Link className="hover:text-paper" href="/barriers">The blocked 90</Link></li>
              <li><Link className="hover:text-paper" href="/pain-points">What buyers told us</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow">The data</p>
            <ul className="mt-4 space-y-2 text-sm text-paper/75">
              <li><Link className="hover:text-paper" href="/companies">Company database</Link></li>
              <li><Link className="hover:text-paper" href="/territory">Territory</Link></li>
              <li><Link className="hover:text-paper" href="/sectors">Industries</Link></li>
              <li><Link className="hover:text-paper" href="/recommendations">Recommendations</Link></li>
              <li><Link className="hover:text-paper" href="/about">Method &amp; handover</Link></li>
            </ul>
          </div>
        </div>

        <div className="hairline-rule mt-12 flex flex-col gap-3 pt-6 text-xs text-paper/55 sm:flex-row sm:items-center sm:justify-between">
          <p>{meta.author} · {meta.role}</p>
          <p>All figures from {meta.source}, {meta.field_period}.</p>
        </div>
      </div>
    </footer>
  );
}
