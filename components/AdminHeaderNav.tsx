"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface AdminHeaderNavProps {
  titleBadge: string;
  activeTab: "projects" | "samples" | "admins" | "access" | "account";
}

export default function AdminHeaderNav({ titleBadge, activeTab }: AdminHeaderNavProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  const navItems = [
    { id: "projects", href: "/admin", label: "المشاريع" },
    { id: "samples", href: "/admin/samples", label: "عينات الأعمال" },
    { id: "admins", href: "/admin/admins", label: "الحسابات الإدارية" },
    { id: "access", href: "/admin/access", label: "أكواد الدخول" },
    { id: "account", href: "/admin/account", label: "كلمة السر" },
  ];

  return (
    <header className="border-b border-border bg-white px-4 sm:px-6 py-3.5 font-sans" dir="rtl">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <img
              src="/img/logo/logo_shafaf.png"
              alt="شعار المهندسة أسماء كراوية للتشطيبات والديكور"
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-sm"
            />
            <span className="text-xs font-semibold uppercase tracking-widest text-accent bg-amber-50 px-2.5 py-1 border border-amber-200 whitespace-nowrap rounded-sm">
              {titleBadge}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="md:hidden border border-red-200 bg-red-50 text-red-700 px-3 py-1.5 text-xs font-medium transition-colors rounded-sm"
          >
            خروج
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`text-xs font-medium transition-colors px-3 py-1.5 border whitespace-nowrap rounded-sm flex items-center gap-1.5 ${
                  isActive
                    ? "bg-amber-50 text-accent font-semibold border-amber-300 shadow-2xs"
                    : "bg-paper text-muted hover:text-ink border-border hover:border-accent"
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 transition-colors flex items-center gap-1.5 whitespace-nowrap rounded-sm"
            title="معاينة البورتفوليو الخاص بالعملاء في تبويب جديد"
          >
            <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>معرض الأعمال ↗</span>
          </Link>

          <button
            onClick={handleLogout}
            className="hidden md:inline-block border border-border bg-paper hover:bg-red-50 hover:text-red-700 hover:border-red-200 px-3.5 py-1.5 text-xs font-medium text-ink transition-colors whitespace-nowrap rounded-sm"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    </header>
  );
}
