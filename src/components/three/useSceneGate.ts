'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Decides whether a 3D scene should mount.
 *
 * A scene mounts only when it is near the viewport, the screen is at least
 * `minWidth` wide, and the visitor has not asked for reduced motion — so no
 * canvas is created for a section nobody scrolls to, and small screens get the
 * 2D view instead of a janky one.
 *
 * Proximity is measured from the element's own bounding rect, re-checked on
 * scroll and resize, rather than from an IntersectionObserver. An IO callback is
 * delivered through the rendering pipeline, and a page that is not compositing
 * can never receive the first one — which would leave the scene unmounted and
 * the section empty. A rect read costs one layout and cannot go missing.
 */
export function useSceneGate(ref: React.RefObject<HTMLElement>, minWidth = 768) {
  const [allowed, setAllowed] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const size = window.matchMedia(`(min-width: ${minWidth}px)`);

    const sync = () => {
      setReduced(motion.matches);
      setAllowed(size.matches && !motion.matches);
    };

    sync();
    motion.addEventListener('change', sync);
    size.addEventListener('change', sync);
    return () => {
      motion.removeEventListener('change', sync);
      size.removeEventListener('change', sync);
    };
  }, [minWidth]);

  const measure = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    const margin = window.innerHeight * 0.35;
    const rect = node.getBoundingClientRect();
    // Zero-sized means the element has not been laid out yet; try again later.
    if (rect.width === 0 && rect.height === 0) return;
    setNear(rect.bottom > -margin && rect.top < window.innerHeight + margin);
  }, [ref]);

  useEffect(() => {
    measure();

    // Layout can settle after mount — web fonts, images, a late resize — so
    // re-measure a couple of times before relying on scroll alone.
    const timers = [80, 400, 1000].map((ms) => window.setTimeout(measure, ms));

    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      timers.forEach(window.clearTimeout);
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  return { show3d: allowed && near, reduced, enabled: allowed };
}
