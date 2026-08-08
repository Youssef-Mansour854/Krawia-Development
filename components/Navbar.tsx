import Link from "next/link";
import FlowingUnderline from "./FlowingUnderline";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-paper/90 backdrop-blur-md font-sans">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="group flex flex-col" dir="ltr">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-semibold tracking-tight text-ink">
              Asmaa Krawia
            </span>
            <span className="text-xs font-light tracking-widest text-muted uppercase">
              Designs
            </span>
          </div>
          <FlowingUnderline className="w-28 h-2 -mt-1 text-accent transition-transform duration-300 group-hover:scale-x-105 origin-left" />
        </Link>

        {/* Navigation Links in Arabic pointing to dedicated routes & sections */}
        <nav className="flex items-center gap-6 sm:gap-8 text-sm font-medium text-ink">
          <Link href="/projects" className="transition hover:text-accent">
            المشاريع
          </Link>
          <Link href="/#about" className="transition hover:text-accent">
            عن الشركة
          </Link>
          <Link href="/#services" className="transition hover:text-accent">
            خدماتنا
          </Link>
          <Link
            href="/admin"
            className="border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-muted hover:text-accent hover:border-accent transition-colors"
          >
            لوحة التحكم
          </Link>
        </nav>
      </div>
    </header>
  );
}
