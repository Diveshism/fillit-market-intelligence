'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import type { Confidence } from '@/lib/types';
import { ConfidenceBadge } from './Badges';
import { EASE, Reveal, TextReveal, useShown } from './motion';

export { Reveal, Stagger, StaggerItem, TextReveal, GrowBar, GrowColumn, Parallax, LiftCard } from './motion';

/** The red rule under an eyebrow, drawn left-to-right on entry. */
function Eyebrow({ children, onInk = false }: { children: ReactNode; onInk?: boolean }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const shown = useShown(ref);
  return (
    <div ref={ref}>
      <p className={`eyebrow ${onInk ? 'text-paper/60' : ''}`}>{children}</p>
      <motion.span
        aria-hidden
        className="mt-2.5 block h-[3px] w-12 origin-left bg-red"
        initial={reduced ? { scaleX: 1 } : { scaleX: 0 }}
        animate={shown || reduced ? { scaleX: 1 } : undefined}
        transition={reduced ? { duration: 0 } : { duration: 0.7, ease: EASE }}
      />
    </div>
  );
}

/** Standard page header: eyebrow with red rule, headline, standfirst, badge. */
export function PageHeader({
  eyebrow,
  title,
  standfirst,
  confidence,
  children,
}: {
  eyebrow: string;
  title: string;
  standfirst?: string;
  confidence?: Confidence;
  children?: ReactNode;
}) {
  const reduced = useReducedMotion();

  return (
    <header className="shell pb-10 pt-28 md:pt-36">
      <div className="flex items-start justify-between gap-6">
        <Eyebrow>{eyebrow}</Eyebrow>
        {confidence && (
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
          >
            <ConfidenceBadge level={confidence} />
          </motion.div>
        )}
      </div>

      <TextReveal
        as="h1"
        text={title}
        delay={0.1}
        className="display mt-7 max-w-4xl text-[clamp(2.1rem,5.2vw,3.75rem)]"
      />

      {standfirst && (
        <motion.p
          className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-graphite"
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.42, ease: EASE }}
        >
          {standfirst}
        </motion.p>
      )}

      {children}
    </header>
  );
}

/** Section heading used inside a page. */
export function SectionHeading({
  eyebrow,
  title,
  standfirst,
  confidence,
  onInk = false,
}: {
  eyebrow?: string;
  title: string;
  standfirst?: string;
  confidence?: Confidence;
  onInk?: boolean;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-6">
        {eyebrow && <Eyebrow onInk={onInk}>{eyebrow}</Eyebrow>}
        {confidence && <ConfidenceBadge level={confidence} />}
      </div>

      <TextReveal
        as="h2"
        text={title}
        className={`display mt-6 max-w-3xl text-[clamp(1.5rem,3vw,2.25rem)] ${onInk ? 'text-paper' : ''}`}
      />

      {standfirst && (
        <Reveal delay={0.12}>
          <p className={`mt-4 max-w-2xl text-[0.9375rem] leading-relaxed ${onInk ? 'text-paper/70' : 'text-graphite'}`}>
            {standfirst}
          </p>
        </Reveal>
      )}
    </div>
  );
}

/** The one-sentence gain stated under a chart. */
export function Takeaway({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const shown = useShown(ref);
  return (
    <motion.p
      ref={ref}
      className="takeaway mt-8 text-[0.9375rem] font-600 leading-relaxed text-ink"
      initial={reduced ? false : { opacity: 0, x: -12 }}
      animate={shown ? { opacity: 1, x: 0 } : undefined}
      transition={{ duration: 0.7, ease: EASE }}
    >
      {children}
    </motion.p>
  );
}

export function SourceLine({ children }: { children: ReactNode }) {
  return <p className="source-line mt-4">{children}</p>;
}

/** A single large figure with a caption beneath — "numbers are the hero". */
export function StatBlock({
  value,
  caption,
  sub,
  tone = 'ink',
}: {
  value: ReactNode;
  caption: string;
  sub?: string;
  tone?: 'ink' | 'red' | 'paper';
}) {
  const color = tone === 'red' ? 'text-red' : tone === 'paper' ? 'text-paper' : 'text-ink';
  return (
    <div>
      <p className={`display tnum text-[clamp(2.25rem,4.6vw,3.5rem)] ${color}`}>{value}</p>
      <p className="mt-2 text-[0.8125rem] font-medium leading-snug text-graphite">{caption}</p>
      {sub && <p className="source-line mt-1.5">{sub}</p>}
    </div>
  );
}
