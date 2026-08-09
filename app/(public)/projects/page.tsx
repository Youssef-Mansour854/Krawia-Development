import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FlowingUnderline from "@/components/FlowingUnderline";
import ProjectsSearch from "@/components/ProjectsSearch";
import { getPaginatedProjects } from "@/lib/projects";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProjectsCatalogPage() {
  const initialPaginated = await getPaginatedProjects({ page: 1, limit: 12 });

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <Navbar />

      {/* Header Banner */}
      <section className="border-b border-border bg-white py-16 px-6">
        <div className="mx-auto max-w-7xl space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            المعرض الكلي
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-ink tracking-tight">
            جميع الأعمال والمشاريع المعمارية
          </h1>
          <FlowingUnderline className="w-48 h-3 text-accent" />
          <p className="text-sm text-muted max-w-2xl leading-relaxed pt-2">
            تصفح القائمة الكاملة لأعمالنا المعمارية والمشاريع الاستثمارية الفاخرة، والتي تشمل الأبراج التجارية، المجمعات السكنية، والفلل الخاصة.
          </p>
        </div>
      </section>

      {/* Projects Container with Server-Side Search & Pagination */}
      <main className="mx-auto max-w-7xl px-6 py-16 w-full flex-1 space-y-12">
        {initialPaginated.total === 0 ? (
          <div className="border border-border bg-white p-16 text-center space-y-4 shadow-sm">
            <p className="text-muted text-base">
              لا توجد مشاريع مضافة حالياً في المعرض.
            </p>
            <Link
              href="/admin/projects/new"
              className="inline-block bg-accent text-white text-xs font-semibold uppercase tracking-widest px-6 py-3"
            >
              إضافة مشروع جديد من لوحة التحكم
            </Link>
          </div>
        ) : (
          <ProjectsSearch initialData={initialPaginated} />
        )}
      </main>

      <Footer />
    </div>
  );
}
