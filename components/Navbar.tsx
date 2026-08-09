"use client";

import Link from "next/link";
import { useState } from "react";
import FlowingUnderline from "./FlowingUnderline";

const NAV_LINKS = [
  { href: "/#about", label: "عن الشركة" },
  { href: "/#services", label: "خدماتنا" },
  { href: "/#showcase", label: "عينات الأعمال" },
  { href: "/projects", label: "المشاريع" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-paper/90 backdrop-blur-md font-sans">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3">
        <Link href="/" className="group inline-flex items-center" onClick={() => setMenuOpen(false)}>
          <img
            src="/img/logo/logo_shafaf.png"
            alt="شعار المهندسة أسماء كراوية للتشطيبات والديكور"
            className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-ink">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-accent">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={menuOpen}
          className="md:hidden inline-flex items-center justify-center p-2 -m-2 text-ink hover:text-accent transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation Panel */}
      {menuOpen && (
        <nav className="md:hidden border-t border-border bg-paper/95 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col gap-1 text-sm font-medium text-ink">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="py-3 px-2 border-b border-border/60 last:border-b-0 transition hover:text-accent hover:bg-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
