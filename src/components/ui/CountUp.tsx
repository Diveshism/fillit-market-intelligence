'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  to: number;
  /** Decimal places. */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Milliseconds. */
  duration?: number;
  className?: string;
  /** Render 5053413 as "5.05M". */
  compactMillions?: boolean;
}

/**
 * Counts up once when the number enters the viewport — MASTER_PROMPT §4.
 * Renders the final value immediately under prefers-reduced-motion, and as the
 * static server-rendered value before hydration, so the figure is never missing.
 */
export default function CountUp({
  to,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1400,
  className = '',
  compactMillions = false,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);
  const played = useRef(false);
  const settled = useRef(false);

  /**
   * Snap to the final figure if the count has not run.
   *
   * The tween is driven by requestAnimationFrame, which a page that is not
   * compositing never receives — so without this the figure would sit at zero
   * indefinitely. A number reading 0 is worse than a number that never moved.
   */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!settled.current) setValue(to);
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [to]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    setValue(0);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || played.current) return;
        played.current = true;
        observer.disconnect();

        const start = performance.now();
        let frame = 0;

        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          // easeOutExpo — fast arrival, long settle
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          setValue(to * eased);
          if (t < 1) frame = requestAnimationFrame(tick);
          else settled.current = true;
        };

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [to, duration]);

  const display = compactMillions
    ? `${(value / 1_000_000).toFixed(decimals || 2)}M`
    : new Intl.NumberFormat('en-GB', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);

  return (
    <span ref={ref} className={`tnum ${className}`} data-numeric>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
