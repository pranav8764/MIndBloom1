'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserButton, useUser } from '@clerk/nextjs';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/journal', label: 'Journal' },
  { href: '/achievements', label: 'Achievements' },
  { href: '/challenges', label: 'Challenges' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();
  const userLabel = user?.firstName || user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || 'Guest';

  return (
    <header className="sticky top-0 z-50 border-b border-[#d9e1eb] bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-[#293132]">
            <span className="inline-flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              MindBloom
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-[#474044] hover:text-[#293132] transition"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isLoaded && isSignedIn ? (
              <>
                <span className="text-sm font-medium text-[#474044]">{userLabel}</span>
                <UserButton />
              </>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="rounded-full border border-[#b8c5d5] bg-white px-4 py-2 text-sm font-semibold text-[#474044] shadow-sm transition hover:border-[#9ab0c4] hover:bg-[#eef4fb]"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-[#547aa5] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#426c8f]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 8h16M4 16h16'} />
            </svg>
          </button>
        </div>

        <div className={`mt-3 flex flex-col gap-3 md:hidden ${mobileOpen ? 'block' : 'hidden'}`}>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white hover:text-slate-900 transition"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            {isLoaded && isSignedIn ? (
              <>
                <span className="text-sm font-medium text-slate-700">{userLabel}</span>
                <UserButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full border border-[#b8c5d5] bg-white px-4 py-3 text-center text-sm font-semibold text-[#474044] shadow-sm transition hover:border-[#9ab0c4] hover:bg-[#eef4fb]"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
