'use client';

import {
  motion, useInView, useReducedMotion, useScroll, useTransform,
} from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

/**
 * The motion system.
 *
 * Two rules hold everywhere in here:
 *
 *   1. Nothing moves when the visitor prefers reduced motion.
 *   2. **No animation may be the only thing that makes content visible.**
 *
 * Rule 2 is the important one. Scroll-triggered entrances are driven by
 * IntersectionObserver, and an IO callback is delivered through the rendering
 * pipeline — a page that is not compositing (a background tab, a window behind
 * another window, some embedded webviews) can simply never receive it. Anything
 * that starts at `opacity: 0` and waits for that callback can stay invisible
 * forever, which is how a headline goes missing.
 *
 * So every entrance here is gated on `useShown`, which reveals on view *or*
 * after a short timer, whichever comes first. The animation is decoration; the
 * content arriving is guaranteed.
 */

export const EASE = [0.16, 1, 0.3, 1] as const;

/** How long to wait for the viewport before showing content regardless. */
const SAFETY_MS = 900;

/**
 * How long to wait for the animation itself before giving up on it.
 *
 * Revealing on a timer is not enough on its own: the tween that carries the
 * content back into place is driven by requestAnimationFrame, which is also
 * withheld from a page that is not compositing. So after this long any
 * component that hid its content renders it plainly instead, with no transform
 * and no tween left to finish.
 */
const SNAP_MS = 2200;

/** True once the animation has had long enough to have played. */
export function useSnap(): boolean {
  const [snap, setSnap] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setSnap(true), SNAP_MS);
    return () => window.clearTimeout(timer);
  }, []);
  return snap;
}

/**
 * True once the element has been seen — or once the safety timer has elapsed,
 * whichever happens first. Never returns to false.
 */
export function useShown(ref: RefObject<Element>, margin = '-8% 0px'): boolean {
  // `margin` is read once by framer; it is a literal at every call site.
  const inView = useInView(ref, { once: true, margin: margin as `${number}% 0px` });
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setElapsed(true), SAFETY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return inView || elapsed;
}

/** True once the safety timer has elapsed, regardless of the viewport. */
export function useElapsed(): boolean {
  const [elapsed, setElapsed] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setElapsed(true), SAFETY_MS);
    return () => window.clearTimeout(timer);
  }, []);
  return elapsed;
}

/* ------------------------------------------------------------------ *
 * Reveal — fade and lift into view, once
 * ------------------------------------------------------------------ */

export function Reveal({
  children,
  delay = 0,
  y = 26,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const shown = useShown(ref, '-10% 0px');
  const snap = useSnap();

  if (reduced || snap) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={shown ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.75, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Stagger — children cascade rather than arriving as one block. */
export function Stagger({
  children,
  gap = 0.07,
  className = '',
  as = 'div',
}: {
  children: ReactNode;
  gap?: number;
  className?: string;
  as?: 'div' | 'ul' | 'ol' | 'dl';
}) {
  const reduced = useReducedMotion();
  const elapsed = useElapsed();
  const snap = useSnap();
  const Tag = motion[as];

  if (reduced || snap) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Tag
      className={className}
      initial="hidden"
      // `whileInView` wins whenever the in-view callback arrives; `animate` is
      // the timer fallback for when it never does. Tag is polymorphic over
      // div/ul/ol/dl, so there is no single ref type to hang a gate on.
      whileInView="shown"
      viewport={{ once: true, margin: '-8% 0px' }}
      animate={elapsed ? 'shown' : 'hidden'}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({
  children,
  className = '',
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'li';
}) {
  const reduced = useReducedMotion();
  const snap = useSnap();
  const Tag = motion[as];

  if (reduced || snap) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Tag
      className={className}
      variants={{
        hidden: { opacity: 0, y: 18 },
        shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
      }}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ *
 * TextReveal — a headline rises out of its own baseline
 * ------------------------------------------------------------------ */

export function TextReveal({
  text,
  className = '',
  delay = 0,
  as: Tag = 'h2',
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p';
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const shown = useShown(ref, '-12% 0px');
  const snap = useSnap();

  // A headline may never depend on a tween to be readable.
  if (reduced || snap) return <Tag className={className}>{text}</Tag>;

  // Split on sentence ends so each clause rises as a unit — splitting per word
  // reflows awkwardly at these display sizes.
  const parts = text.split(/(?<=\.)\s+/).filter(Boolean);

  return (
    <div ref={ref}>
      <Tag className={className}>
        {parts.map((part, i) => (
          <span key={i} className="block overflow-hidden">
            <motion.span
              className="block"
              initial={{ y: '110%' }}
              animate={shown ? { y: '0%' } : { y: '110%' }}
              transition={{ duration: 0.85, delay: delay + i * 0.09, ease: EASE }}
            >
              {part}
            </motion.span>
          </span>
        ))}
      </Tag>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Bars — grow from the baseline
 * ------------------------------------------------------------------ */

/** Horizontal bar. `value` is already a percentage of the track. */
export function GrowBar({
  value,
  color,
  height = 12,
  delay = 0,
  className = '',
  rounded = false,
}: {
  value: number;
  color: string;
  height?: number;
  delay?: number;
  className?: string;
  rounded?: boolean;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const shown = useShown(ref);
  const snap = useSnap();

  return (
    <div
      ref={ref}
      className={`w-full overflow-hidden bg-hairline/35 ${className}`}
      style={{ height, borderRadius: rounded ? height / 2 : 0 }}
    >
      {reduced || snap ? (
        <div
          className="h-full"
          style={{ width: `${value}%`, backgroundColor: color, borderRadius: rounded ? height / 2 : 0 }}
        />
      ) : (
      <motion.div
        className="h-full origin-left"
        style={{ backgroundColor: color, borderRadius: rounded ? height / 2 : 0 }}
        initial={{ width: 0 }}
        animate={shown ? { width: `${value}%` } : undefined}
        transition={{ duration: 1.05, delay, ease: EASE }}
      />
      )}
    </div>
  );
}

/** Vertical bar, grown from the bottom. `value` is a percentage of the track. */
export function GrowColumn({
  value,
  color,
  delay = 0,
  className = '',
}: {
  value: number;
  color: string;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const shown = useShown(ref);
  const snap = useSnap();

  if (reduced || snap) {
    return (
      <div
        className={`w-full ${className}`}
        style={{ height: `${value}%`, backgroundColor: color, minHeight: 4 }}
      />
    );
  }

  return (
    <motion.div
      ref={ref}
      className={`w-full origin-bottom ${className}`}
      style={{ backgroundColor: color, minHeight: 4 }}
      initial={{ height: 0 }}
      animate={shown ? { height: `${value}%` } : undefined}
      transition={reduced ? { duration: 0 } : { duration: 1, delay, ease: EASE }}
    />
  );
}

/* ------------------------------------------------------------------ *
 * Parallax
 * ------------------------------------------------------------------ */

/** Shifts its child vertically as the section crosses the viewport. */
export function Parallax({
  children,
  distance = 60,
  className = '',
}: {
  children: ReactNode;
  distance?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        className="relative"
        style={{ y, height: `calc(100% + ${distance * 2}px)`, marginTop: -distance }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/** A card that lifts on hover. */
export function LiftCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div className={className} whileHover={{ y: -4 }} transition={{ duration: 0.35, ease: EASE }}>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 * FadeIn / GrowSpan
 *
 * The two shapes the charts need, with the same guarantee as everything
 * else here: once the animation window has passed, the element renders
 * plainly at its final value rather than waiting on a tween.
 * ------------------------------------------------------------------ */

/** Fades (and optionally lifts or slides) a single element into view. */
export function FadeIn({
  children,
  delay = 0,
  x = 0,
  y = 0,
  duration = 0.6,
  className = '',
  as = 'span',
}: {
  children: ReactNode;
  delay?: number;
  x?: number;
  y?: number;
  duration?: number;
  className?: string;
  as?: 'span' | 'div' | 'li';
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const shown = useShown(ref);
  const snap = useSnap();
  const Tag = motion[as];

  if (reduced || snap) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement & HTMLSpanElement & HTMLLIElement>}
      className={className}
      initial={{ opacity: 0, x, y }}
      animate={shown ? { opacity: 1, x: 0, y: 0 } : undefined}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

/**
 * An inline bar that grows to `width` (a CSS length or percentage).
 * `origin` decides which end it grows from.
 */
export function GrowSpan({
  width,
  color,
  delay = 0,
  origin = 'left',
  className = '',
  style,
}: {
  width: string;
  color: string;
  delay?: number;
  origin?: 'left' | 'right';
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useShown(ref);
  const snap = useSnap();

  const base: React.CSSProperties = { backgroundColor: color, ...style };

  if (reduced || snap) {
    return <span className={className} style={{ ...base, width }} />;
  }

  return (
    <motion.span
      ref={ref}
      className={`${className} ${origin === 'right' ? 'origin-right' : 'origin-left'}`}
      style={base}
      initial={{ width: 0 }}
      animate={shown ? { width } : undefined}
      transition={{ duration: 0.9, delay, ease: EASE }}
    />
  );
}
