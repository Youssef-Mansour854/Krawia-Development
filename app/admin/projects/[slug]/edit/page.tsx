import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectBySlug } from "@/lib/projects";
import ProjectForm from "@/components/ProjectForm";
import FlowingUnderline from "@/components/FlowingUnderline";
import AdminHeaderNav from "@/components/AdminHeaderNav";

export const dynamic = "force-dynamic";

interface EditProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-paper text-ink font-sans flex flex-col">
      {/* Unified Admin Header Nav */}
      <AdminHeaderNav titleBadge="تعديل المشروع" activeTab="projects" />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-8 flex-1 space-y-6">
        {/* Top Action Bar directly under the Navbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3.5 py-1.5 rounded-sm transition-colors cursor-pointer shadow-2xs"
          >
            <span>← العودة لجميع المشاريع</span>
          </Link>

          {project && (
            <Link
              href={`/projects/${project.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3.5 py-1.5 transition-colors flex items-center gap-1.5 rounded-sm cursor-pointer shadow-2xs"
              title="معاينة هذا المشروع في تبويب جديد"
            >
              <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>معاينة المشروع المعماري ↗</span>
            </Link>
          )}
        </div>

        {/* Page Title Header */}
        <div className="border-b border-border pb-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted">
            ARCHITECTURAL PROJECT EDITING
          </span>
          <h1 className="text-2xl sm:text-3xl font-medium text-ink mt-1 font-serif">
            تعديل المشروع: {project.title}
          </h1>
          <FlowingUnderline className="w-40 h-3 text-accent" />
        </div>

        <ProjectForm mode="edit" initialData={project} />
      </main>
    </div>
  );
}
