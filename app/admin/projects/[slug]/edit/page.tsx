import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectBySlug } from "@/lib/projects";
import ProjectForm from "@/components/ProjectForm";
import FlowingUnderline from "@/components/FlowingUnderline";

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
      {/* Top Header */}
      <header className="border-b border-border bg-white px-4 sm:px-6 py-4">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
            <img
              src="/img/logo/logo_shafaf.png"
              alt="شعار المهندسة أسماء كراوية للتشطيبات والديكور"
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-sm"
            />
            <span className="text-xs font-semibold uppercase tracking-widest text-accent bg-amber-50 px-2.5 py-1 border border-amber-200 whitespace-nowrap">
              تعديل المشروع
            </span>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-2 sm:gap-3 flex-wrap w-full md:w-auto">
            {project && (
              <Link
                href={`/projects/${project.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 transition-colors flex items-center gap-1.5"
                title="معاينة هذا المشروع في تبويب جديد"
              >
                🌐 معاينة المشروع ↗
              </Link>
            )}
            <Link
              href="/admin"
              className="text-xs font-medium text-muted hover:text-ink transition-colors px-2 py-1"
            >
              ← العودة لجميع المشاريع
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl w-full px-6 py-10 flex-1 space-y-8">
        <div className="border-b border-border pb-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted">
            إدارة الأعمال المعمارية
          </span>
          <h2 className="text-2xl font-medium text-ink mt-1">
            تعديل المشروع: {project.title}
          </h2>
          <FlowingUnderline className="w-40 h-3 text-accent" />
        </div>

        <ProjectForm mode="edit" initialData={project} />
      </main>
    </div>
  );
}
