'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { EASE } from '@/components/ui/motion';

/**
 * A short cross-fade between routes.
 *
 * Keyed on the pathname so each route mounts its own subtree — which also resets
 * every `whileInView` animation on the incoming page, so a page navigated to
 * plays its entrance rather than arriving already settled.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
