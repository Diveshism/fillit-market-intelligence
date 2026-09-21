'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

/** A thin scroll-progress indicator in the brand red — MASTER_PROMPT §4. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 40,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className="no-print fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-red"
      style={{ scaleX }}
    />
  );
}
