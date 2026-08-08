import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FlowingUnderline from "@/components/FlowingUnderline";
import { getAllProjects } from "@/lib/projects";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export default async function ProjectsCatalogPage() {
  const allProjects = await getAllProjects();

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

      {/* Projects Grid Container */}
      <main className="mx-auto max-w-7xl px-6 py-16 w-full flex-1 space-y-12">
        {allProjects.length === 0 ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allProjects.map((project) => (
              <Link
                key={project._id.toString()}
                href={`/projects/${project.slug}`}
                className="group border border-border bg-white overflow-hidden transition-all duration-300 hover:border-accent hover:shadow-md flex flex-col"
              >
                <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
                  <Image
                    src={project.coverImage}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <span className="bg-slate-950/80 backdrop-blur-md text-white text-[10px] uppercase font-semibold tracking-wider px-2.5 py-1">
                      {getCategoryLabel(project.category)}
                    </span>
                    <span className="bg-amber-500 text-slate-950 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1">
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <p className="text-xs text-muted tracking-wider">
                      📍 {project.location}
                    </p>
                    <h3 className="font-serif text-xl font-medium text-ink group-hover:text-accent transition-colors mt-1">
                      {project.title}
                    </h3>
                    <p className="text-xs text-muted mt-2 line-clamp-2 leading-relaxed font-normal">
                      {project.description}
                    </p>
                  </div>

                  <div className="pt-2 text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-1 group-hover:-translate-x-1 transition-transform">
                    استكشف تفاصيل المشروع ←
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
