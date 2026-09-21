import type { Confidence, Status } from '@/lib/types';
import { STATUS_COLOR } from '@/lib/data';

/**
 * Confidence badge. Every data view on the site carries one.
 *   VERIFIED  computed from the field dataset, or official FILLIT material
 *   SOURCED   from a named external public source
 *   DERIVED   computed from the field data by a stated rule, not read off a sheet
 */
const CONFIDENCE_STYLE: Record<Confidence, string> = {
  VERIFIED: 'border-[#2E7D4F] text-[#2E7D4F]',
  SOURCED: 'border-steel text-steel',
  DERIVED: 'border-[#D4A537] text-[#9a7620]',
};

export function ConfidenceBadge({
  level,
  className = '',
}: {
  level: Confidence;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-[3px] border px-2 py-[3px] text-[0.625rem] font-600 uppercase tracking-[0.1em] ${CONFIDENCE_STYLE[level]} ${className}`}
    >
      {level}
    </span>
  );
}

export function StatusBadge({
  status,
  size = 'md',
}: {
  status: Status;
  size?: 'sm' | 'md';
}) {
  const color = STATUS_COLOR[status];
  // Cold sits light on paper, so it takes ink text rather than white.
  const light = status === 'Cold';
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-[3px] font-600 uppercase tracking-[0.08em] ${
        size === 'sm' ? 'px-1.5 py-[2px] text-[0.625rem]' : 'px-2 py-[3px] text-[0.6875rem]'
      }`}
      style={{ backgroundColor: color, color: light ? '#242126' : '#F6F4F1' }}
    >
      {status}
    </span>
  );
}

/** A small dot in a status colour, for dense table rows and legends. */
export function StatusDot({ status }: { status: Status }) {
  return (
    <span
      aria-hidden
      className="inline-block h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: STATUS_COLOR[status] }}
    />
  );
}

/** Flags on a company profile — lead source, CAFU mention, status override. */
export function Flag({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'green' | 'red' }) {
  const tones = {
    neutral: 'border-hairline bg-transparent text-graphite',
    green: 'border-[#2E7D4F]/35 bg-[#2E7D4F]/8 text-[#2E7D4F]',
    red: 'border-red/30 bg-red-wash text-red',
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[3px] border px-2.5 py-1 text-[0.6875rem] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
