'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const ROUTES = [
  { href: '/volume', label: 'Volume' },
  { href: '/companies', label: 'Companies' },
  { href: '/new-leads', label: 'New leads' },
  { href: '/territory', label: 'Territory' },
  { href: '/sectors', label: 'Industries' },
  { href: '/competition', label: 'Competition' },
  { href: '/barriers', label: 'Barriers' },
  { href: '/pain-points', label: 'Buyers' },
  { href: '/recommendations', label: 'Recommendations' },
  { href: '/about', label: 'About' },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lifted, setLifted] = useState(false);

  // The home hero is full-bleed dark, so the bar overlays it in paper until
  // the visitor scrolls past it.
  const overHero = pathname === '/' && !lifted && !open;

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`no-print fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        lifted ? 'bg-paper/95 backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <nav
        aria-label="Primary"
        className={`shell flex items-center justify-between py-4 ${
          lifted ? 'border-b border-hairline' : ''
        }`}
      >
        {/* FILLIT's own mark, in its two published finishes — white over the
            dark hero, maroon everywhere else. */}
        <Link href="/" className="group flex items-center gap-3">
          <Image
            src={overHero ? '/brand/fillit-logo-white.webp' : '/brand/fillit-logo.png'}
            alt="FILLIT"
            width={198}
            height={67}
            priority
            className="h-8 w-auto"
          />
          <span
            className={`hidden border-l pl-3 text-[0.6875rem] font-medium uppercase leading-tight tracking-[0.12em] sm:block ${
              overHero ? 'border-paper/25 text-paper/70' : 'border-hairline text-graphite'
            }`}
          >
            Market
            <br />
            Intelligence
          </span>
        </Link>

        <ul className="hidden items-center gap-6 lg:flex">
          {ROUTES.map((r) => {
            const active = pathname === r.href || pathname.startsWith(`${r.href}/`);
            return (
              <li key={r.href}>
                <Link
                  href={r.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative text-[0.8125rem] font-medium transition-colors ${
                    overHero
                      ? 'text-paper/75 hover:text-paper'
                      : active
                        ? 'text-ink'
                        : 'text-graphite hover:text-ink'
                  }`}
                >
                  {r.label}
                  {active && (
                    <span className="absolute -bottom-1.5 left-0 h-[2px] w-full bg-red" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="flex h-9 w-9 items-center justify-center lg:hidden"
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span className="relative block h-3 w-5">
            <span
              className={`absolute left-0 block h-[2px] w-5 transition-transform duration-300 ${
                overHero ? 'bg-paper' : 'bg-ink'
              } ${open ? 'top-[5px] rotate-45' : 'top-0'}`}
            />
            <span
              className={`absolute left-0 block h-[2px] w-5 transition-transform duration-300 ${
                overHero ? 'bg-paper' : 'bg-ink'
              } ${open ? 'top-[5px] -rotate-45' : 'top-[10px]'}`}
            />
          </span>
        </button>
      </nav>

      {open && (
        <div id="mobile-nav" className="border-b border-hairline bg-paper lg:hidden">
          <ul className="shell grid grid-cols-2 gap-x-6 gap-y-1 py-4">
            {ROUTES.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className="block py-2 text-sm font-medium text-graphite hover:text-ink"
                >
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
