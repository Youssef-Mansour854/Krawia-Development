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
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [error, setError] = useState("");
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
      <header className="border-b border-border bg-white px-6 py-4">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent bg-amber-50 px-2.5 py-1 border border-amber-200">
              لوحة التحكم
            </span>
            <h1 className="text-lg font-medium text-ink">
              أسماء كراوية للتطوير العقاري
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/admin/admins"
              className="text-xs font-semibold text-accent bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 transition-colors"
            >
              👥 الحسابات الإدارية
            </Link>
            <Link
              href="/admin/access"
              className="text-xs font-medium text-muted hover:text-ink transition-colors"
            >
              🔑 أكواد الدخول
            </Link>
            <Link
              href="/admin/account"
              className="text-xs font-medium text-muted hover:text-ink transition-colors"
            >
              🔒 كلمة السر
            </Link>
            <Link
              href="/"
              className="text-xs font-medium text-muted hover:text-ink transition-colors"
            >
              الموقع الرئيسي ←
            </Link>
            <button
              onClick={handleLogout}
              className="border border-border bg-paper hover:bg-red-50 hover:text-red-700 hover:border-red-200 px-3.5 py-1.5 text-xs font-medium text-ink transition-colors"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl w-full px-6 py-10 flex-1 space-y-8">
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
            className="inline-flex items-center justify-center bg-accent hover:bg-accent-hover text-white text-xs font-semibold uppercase tracking-widest px-6 py-3 transition-colors shadow-sm"
          >
            + إضافة مشروع جديد
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Projects Table */}
        {projects.length === 0 ? (
          <div className="bg-white border border-border p-12 text-center space-y-4">
            <p className="text-muted text-sm">
              لم يتم العثور على مشاريع في قاعدة البيانات.
            </p>
            <Link
              href="/admin/projects/new"
              className="inline-block bg-accent text-white text-xs font-semibold uppercase tracking-widest px-5 py-2.5"
            >
              إنشاء أول مشروع
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-border overflow-x-auto shadow-sm">
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
                {projects.map((project) => (
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
                      <span className="inline-block bg-slate-100 text-slate-800 text-[10px] uppercase font-semibold tracking-wider px-2.5 py-1 border border-slate-200">
                        {getCategoryLabel(project.category)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span className="inline-block bg-amber-50 text-amber-900 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 border border-amber-200">
                        {getStatusLabel(project.status)}
                      </span>
                    </td>

                    {/* Featured */}
                    <td className="py-4 px-4">
                      {project.featured ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          مميز
                        </span>
                      ) : (
                        <span className="text-xs text-muted">عادي</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-left space-x-2 space-x-reverse">
                      <Link
                        href={`/admin/projects/${project.slug}/edit`}
                        className="inline-block border border-border bg-white hover:border-accent hover:text-accent px-3 py-1.5 text-xs font-medium transition-colors"
                      >
                        تعديل
                      </Link>
                      <button
                        onClick={() =>
                          handleDelete(project.slug, project.title)
                        }
                        disabled={deletingSlug === project.slug}
                        className="border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {deletingSlug === project.slug
                          ? "جاري الحذف..."
                          : "حذف"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
