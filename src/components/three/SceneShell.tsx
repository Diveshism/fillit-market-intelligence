'use client';

import { Canvas, type CanvasProps } from '@react-three/fiber';
import { Suspense, useEffect, useState, type ReactNode } from 'react';

/** How long to wait for the renderer before giving the visitor the 2D view. */
const INIT_TIMEOUT_MS = 6000;

/** Elegant skeleton while a scene's assets resolve — MASTER_PROMPT §4. */
export function SceneSkeleton({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="relative block h-[2px] w-24 overflow-hidden bg-hairline">
          <span className="absolute inset-y-0 left-0 w-1/3 animate-[sceneslide_1.4s_ease-in-out_infinite] bg-red" />
        </span>
        <span className="eyebrow">{label}</span>
      </div>
    </div>
  );
}

/**
 * Canvas wrapper with sensible defaults for every scene on the site.
 *
 * The skeleton is a DOM sibling of the canvas, never a child of it: anything
 * rendered inside <Canvas> is reconciled against the THREE namespace, so a
 * <div> or <span> in there throws "not part of the THREE namespace".
 * That is also why scene components are imported with `{ ssr: false }` alone
 * and never with a `loading` fallback.
 *
 * `frameloop="demand"` keeps idle scenes off the GPU; scenes that animate
 * continuously opt back in with `frameloop="always"`.
 */
export default function SceneShell({
  children,
  label,
  fallback,
  className = '',
  ...props
}: {
  children: ReactNode;
  label: string;
  /** Shown instead of the canvas if the renderer never comes up. */
  fallback?: ReactNode;
  className?: string;
} & Partial<CanvasProps>) {
  const [ready, setReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  /**
   * WebGL is not guaranteed. A context can be refused on a locked-down machine,
   * and the renderer cannot size itself on a page the browser never composites.
   * Either way the visitor would be left staring at a loading bar, so after a
   * few seconds we hand them the 2D view of the same data instead.
   */
  useEffect(() => {
    if (ready) return;
    const timer = window.setTimeout(() => setTimedOut(true), INIT_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [ready]);

  if (timedOut && !ready && fallback) {
    return <div className={`h-full w-full ${className}`}>{fallback}</div>;
  }

  return (
    <div data-scene className={`relative h-full w-full ${className}`}>
      {!ready && (
        <div className="absolute inset-0 z-10">
          <SceneSkeleton label={label} />
        </div>
      )}
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={() => setReady(true)}
        {...props}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}
