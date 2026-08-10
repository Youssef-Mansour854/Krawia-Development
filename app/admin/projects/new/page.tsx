import Link from "next/link";
import ProjectForm from "@/components/ProjectForm";
import FlowingUnderline from "@/components/FlowingUnderline";
import AdminHeaderNav from "@/components/AdminHeaderNav";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  return (
    <div className="min-h-screen bg-paper text-ink font-sans flex flex-col">
      {/* Unified Admin Header Nav */}
      <AdminHeaderNav titleBadge="إضافة مشروع جديد" activeTab="projects" />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-8 flex-1 space-y-6">
        {/* Back Link directly under the Navbar */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3.5 py-1.5 rounded-sm transition-colors cursor-pointer shadow-2xs"
          >
            <span>← العودة لجميع المشاريع</span>
          </Link>
        </div>

        {/* Page Title Header */}
        <div className="border-b border-border pb-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted">
            إدارة الأعمال المعمارية
          </span>
          <h1 className="text-2xl sm:text-3xl font-medium text-ink mt-1 font-serif">
            إضافة مشروع معماري جديد
          </h1>
          <FlowingUnderline className="w-40 h-3 text-accent" />
        </div>

        <ProjectForm mode="create" />
      </main>
    </div>
  );
}
