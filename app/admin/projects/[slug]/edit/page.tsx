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
      <header className="border-b border-border bg-white px-6 py-4">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/img/logo/logo_shafaf.png"
              alt="شعار المهندسة أسماء كراوية للتشطيبات والديكور"
              className="h-9 w-auto object-contain"
            />
            <span className="text-xs font-semibold uppercase tracking-widest text-accent bg-amber-50 px-2.5 py-1 border border-amber-200">
              لوحة التحكم
            </span>
            <h1 className="text-lg font-medium text-ink">
              أسماء كراوية للتشطيبات والديكور
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 transition-colors flex items-center gap-1.5"
              title="معاينة البورتفوليو الخاص بالعملاء في تبويب جديد"
            >
              🌐 معرض الأعمال (البورتفوليو) ↗
            </Link>
            <Link
              href="/admin"
              className="text-xs font-medium text-muted hover:text-ink transition-colors"
            >
              ← العودة للوحة التحكم
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
