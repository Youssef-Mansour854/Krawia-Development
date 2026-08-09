"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IProject } from "@/models/Project";
import FlowingUnderline from "@/components/FlowingUnderline";

interface AdminDashboardViewProps {
  initialProjects: IProject[];
}

function getCategoryLabel(category: string): string {
  switch (category?.toLowerCase()) {
    case "residential":
      return "سكني";
    case "commercial":
      return "تجاري";
    case "mixed-use":
      return "متعدد الاستخدامات";
    default:
      return category;
  }
}

function getStatusLabel(status: string): string {
  switch (status?.toLowerCase()) {
    case "under-construction":
      return "قيد الإنشاء";
    case "completed":
      return "مكتمل";
    case "upcoming":
      return "قريباً";
    default:
      return status;
  }
}

export default function AdminDashboardView({
  initialProjects,
}: AdminDashboardViewProps) {
  const [projects, setProjects] = useState<IProject[]>(initialProjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const filteredProjects = projects.filter((project) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.trim().toLowerCase();
    const categoryLabel = getCategoryLabel(project.category).toLowerCase();
    const statusLabel = getStatusLabel(project.status).toLowerCase();

    return (
      (project.title && project.title.toLowerCase().includes(term)) ||
      (project.location && project.location.toLowerCase().includes(term)) ||
      (project.category && project.category.toLowerCase().includes(term)) ||
      categoryLabel.includes(term) ||
      statusLabel.includes(term)
    );
  });

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  const handleDelete = async (slug: string, title: string) => {
    const confirmed = window.confirm(
      `هل أنت تأكد من رغبتك في حذف مشروع "${title}"؟ لا يمكن التراجع عن هذا الإجراء.`
    );
    if (!confirmed) return;

    setDeletingSlug(slug);
    setError("");

    try {
      const res = await fetch(`/api/projects/${slug}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "فشل حذف المشروع.");
        setDeletingSlug(null);
        return;
      }

      setProjects((prev) => prev.filter((p) => p.slug !== slug));
      setDeletingSlug(null);
      router.refresh();
    } catch {
      setError("حدث خطأ في الشبكة أثناء محاولة حذف المشروع.");
      setDeletingSlug(null);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans flex flex-col">
      {/* Admin Top Header */}
      <header className="border-b border-border bg-white px-4 sm:px-6 py-3.5">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3">
              <img
                src="/img/logo/logo_shafaf.png"
                alt="شعار المهندسة أسماء كراوية للتشطيبات والديكور"
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-sm"
              />
              <span className="text-xs font-semibold uppercase tracking-widest text-accent bg-amber-50 px-2.5 py-1 border border-amber-200">
                لوحة التحكم الإدارية
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="md:hidden border border-red-200 bg-red-50 text-red-700 px-3 py-1.5 text-xs font-medium transition-colors"
            >
              خروج
            </button>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <Link
              href="/admin/admins"
              className="text-xs font-semibold text-accent bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 transition-colors whitespace-nowrap"
            >
              👥 الحسابات الإدارية
            </Link>
            <Link
              href="/admin/access"
              className="text-xs font-medium text-muted hover:text-ink transition-colors px-2.5 py-1.5 bg-paper border border-border whitespace-nowrap"
            >
              🔑 أكواد الدخول
            </Link>
            <Link
              href="/admin/account"
              className="text-xs font-medium text-muted hover:text-ink transition-colors px-2.5 py-1.5 bg-paper border border-border whitespace-nowrap"
            >
              🔒 كلمة السر
            </Link>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 transition-colors flex items-center gap-1 whitespace-nowrap"
              title="معاينة البورتفوليو الخاص بالعملاء في تبويب جديد"
            >
              🌐 معرض الأعمال ↗
            </Link>
            <button
              onClick={handleLogout}
              className="hidden md:inline-block border border-border bg-paper hover:bg-red-50 hover:text-red-700 hover:border-red-200 px-3.5 py-1.5 text-xs font-medium text-ink transition-colors whitespace-nowrap"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-10 flex-1 space-y-6 sm:space-y-8">
        {/* Title Bar & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted">
              إدارة الأعمال المعمارية
            </span>
            <h2 className="text-2xl font-medium text-ink mt-1">
              قائمة المشاريع ({projects.length})
            </h2>
            <FlowingUnderline className="w-36 h-3 text-accent" />
          </div>

          <Link
            href="/admin/projects/new"
            className="inline-flex items-center justify-center bg-accent hover:bg-accent-hover text-white text-xs font-semibold uppercase tracking-widest px-6 py-3 transition-colors shadow-sm w-full sm:w-auto text-center"
          >
            + إضافة مشروع جديد
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Brand Search Bar */}
        <div className="bg-white border border-border p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-accent text-base">
              🔍
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث باسم المشروع أو الموقع أو التصنيف (مثال: دمنهور، برج، سكني)..."
              className="w-full border border-border bg-paper pr-10 pl-10 py-2.5 text-sm text-ink focus:outline-none focus:border-accent transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 left-0 px-3 text-xs text-muted hover:text-ink font-bold transition-colors"
                title="إعادة تعيين البحث"
              >
                ✕ مسح
              </button>
            )}
          </div>

          <div className="text-xs font-semibold text-muted bg-paper px-4 py-2.5 border border-border text-center whitespace-nowrap">
            {searchTerm ? (
              <span>
                تم العثور على <strong className="text-accent">{filteredProjects.length}</strong> من أصل{" "}
                {projects.length} مشروع
              </span>
            ) : (
              <span>
                إجمالي المشاريع: <strong className="text-ink">{projects.length}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Projects View */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white border border-border p-8 sm:p-12 text-center text-muted text-sm space-y-4">
            <p>
              {searchTerm
                ? `لا توجد نتائج مطابقة لبحثك: "${searchTerm}"`
                : "لم يتم العثور على مشاريع في قاعدة البيانات."}
            </p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm("")}
                className="inline-block bg-accent hover:bg-accent-hover text-white text-xs font-semibold uppercase tracking-wider px-4 py-2 transition-colors"
              >
                عرض جميع المشاريع ({projects.length})
              </button>
            ) : (
              <Link
                href="/admin/projects/new"
                className="inline-block bg-accent text-white text-xs font-semibold uppercase tracking-widest px-5 py-2.5"
              >
                إنشاء أول مشروع
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Cards View (Visible on phones & small screens) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredProjects.map((project) => (
                <div
                  key={project._id.toString()}
                  className="bg-white border border-border p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                    <span className="bg-slate-100 text-slate-800 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 border border-slate-200">
                      {getCategoryLabel(project.category)}
                    </span>
                    <div className="flex items-center gap-2">
                      {project.featured && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                          ★ مميز
                        </span>
                      )}
                      <span className="bg-amber-50 text-amber-900 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-amber-200">
                        {getStatusLabel(project.status)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-ink text-base">
                      {project.title}
                    </h3>
                    <p className="text-xs text-muted mt-1">
                      📍 {project.location}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                    <Link
                      href={`/projects/${project.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-border bg-paper hover:bg-slate-100 text-ink text-center py-2 text-xs font-medium transition-colors"
                    >
                      معاينة ↗
                    </Link>
                    <Link
                      href={`/admin/projects/${project.slug}/edit`}
                      className="border border-border bg-white hover:border-accent text-accent text-center py-2 text-xs font-medium transition-colors"
                    >
                      تعديل
                    </Link>
                    <button
                      onClick={() =>
                        handleDelete(project.slug, project.title)
                      }
                      disabled={deletingSlug === project.slug}
                      className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-center py-2 text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      {deletingSlug === project.slug ? "حذف..." : "حذف"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (Visible on tablet & desktop screens) */}
            <div className="hidden md:block bg-white border border-border overflow-x-auto shadow-sm w-full">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-border bg-paper text-[11px] font-semibold uppercase tracking-wider text-muted">
                    <th className="py-3.5 px-4">اسم المشروع والموقع</th>
                    <th className="py-3.5 px-4">التصنيف</th>
                    <th className="py-3.5 px-4">الحالة</th>
                    <th className="py-3.5 px-4">المميزة</th>
                    <th className="py-3.5 px-4 text-left">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {filteredProjects.map((project) => (
                    <tr
                      key={project._id.toString()}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Title & Location */}
                      <td className="py-4 px-4 max-w-xs">
                        <p className="font-medium text-ink line-clamp-1">
                          {project.title}
                        </p>
                        <p className="text-xs text-muted line-clamp-1 mt-0.5">
                          📍 {project.location}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="inline-block bg-slate-100 text-slate-800 text-[10px] uppercase font-semibold tracking-wider px-2.5 py-1 border border-slate-200 whitespace-nowrap">
                          {getCategoryLabel(project.category)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className="inline-block bg-amber-50 text-amber-900 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 border border-amber-200 whitespace-nowrap">
                          {getStatusLabel(project.status)}
                        </span>
                      </td>

                      {/* Featured */}
                      <td className="py-4 px-4">
                        {project.featured ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 whitespace-nowrap">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            مميز
                          </span>
                        ) : (
                          <span className="text-xs text-muted">عادي</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-left">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <Link
                            href={`/projects/${project.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block border border-border bg-paper hover:bg-slate-100 hover:text-ink px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap"
                            title="معاينة هذا المشروع في تبويب جديد"
                          >
                            معاينة ↗
                          </Link>
                          <Link
                            href={`/admin/projects/${project.slug}/edit`}
                            className="inline-block border border-border bg-white hover:border-accent hover:text-accent px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap"
                          >
                            تعديل
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(project.slug, project.title)
                            }
                            disabled={deletingSlug === project.slug}
                            className="border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {deletingSlug === project.slug
                              ? "جاري الحذف..."
                              : "حذف"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
