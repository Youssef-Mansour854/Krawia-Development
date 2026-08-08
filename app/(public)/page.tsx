import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import StatsSection from "@/components/StatsSection";
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

export default async function HomePage() {
  const allProjects = await getAllProjects();
  // Display maximum 3 projects on the homepage
  const homepageProjects = allProjects.slice(0, 3);
  const totalProjectsCount = allProjects.length;

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans scroll-smooth">
      <Navbar />

      {/* Full-Bleed 4K Architectural Hero Section (No White Box) */}
      <section className="relative overflow-hidden border-b border-border py-28 sm:py-36 px-6">
        {/* Background Image - Full Bleed 4K */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/hero-bg.jpg?v=2"
            alt="تصاميم معمارية فاخرة"
            className="w-full h-full object-cover object-center scale-100 image-rendering-crisp"
            style={{ imageRendering: "-webkit-optimize-contrast" }}
          />
          {/* Rich Ambient Overlay - Keeps Image Visible & Text Crisp */}
          <div className="absolute inset-0 bg-slate-950/50 bg-gradient-to-b from-slate-950/65 via-slate-950/45 to-slate-950/75 backdrop-blur-[1px]" />
        </div>

        {/* Hero Content Floating Directly over 4K Image */}
        <div className="relative z-10 mx-auto max-w-5xl text-center space-y-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-5 py-2 text-xs font-semibold text-amber-300 shadow-md">
            ✨ الهندسة المعمارية والتطوير العقاري الفاخر
          </div>

          <div className="space-y-4">
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight text-white leading-tight drop-shadow-md">
              مساحات مبتكرة ومعالم معمارية فاخرة
            </h1>
            <div className="flex justify-center">
              <FlowingUnderline className="w-56 h-4 text-amber-500" />
            </div>
          </div>

          <p className="mx-auto max-w-3xl text-base sm:text-xl text-slate-100 leading-relaxed font-normal drop-shadow-sm">
            تقدم تصاميم أسماء كراوية مفاهيم معمارية رؤيوية تتحول إلى واقع ملموس. متخصصون في المجمعات السكنية الفاخرة، الأبراج التجارية الأيقونية، والمشاريع متعددة الاستخدامات.
          </p>

          <div className="flex justify-center pt-4">
            <a
              href="#featured"
              className="inline-flex items-center justify-center bg-amber-600 hover:bg-amber-700 px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition-all shadow-xl shadow-amber-950/60 border border-amber-400/40 hover:scale-105"
            >
              استكشف أحدث المشاريع المعمارية ←
            </a>
          </div>
        </div>
      </section>

      {/* Statistics Bar */}
      <StatsSection />

      {/* About Us Section */}
      <AboutSection />

      {/* Featured Projects Section (Capped at 3) */}
      <section id="featured" className="mx-auto max-w-7xl px-6 py-20 w-full space-y-12 border-t border-border">
        <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              أبرز الإنجازات
            </span>
            <h2 className="font-serif text-3xl font-medium text-ink mt-1">
              المشاريع المعمارية المختارة
            </h2>
            <FlowingUnderline className="w-36 h-3 text-accent" />
          </div>

          {totalProjectsCount > 3 && (
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent hover:underline"
            >
              عرض جميع المشاريع ({totalProjectsCount}) ←
            </Link>
          )}
        </div>

        {homepageProjects.length === 0 ? (
          <div className="rounded-none border border-border bg-white p-12 text-center">
            <p className="text-muted text-sm">
              لا توجد مشاريع مضافة حالياً.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {homepageProjects.map((project) => (
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
                    عرض تفاصيل المشروع ←
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* View All Projects Arrow Button if > 3 or as catalog CTA */}
        {totalProjectsCount > 0 && (
          <div className="pt-4 text-center">
            <Link
              href="/projects"
              className="inline-flex items-center gap-3 border border-border bg-white hover:border-accent hover:text-accent px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-ink transition-colors shadow-sm"
            >
              <span>انتقل إلى المعرض الشامل لجميع المشاريع</span>
              <span className="text-sm font-bold">←</span>
            </Link>
          </div>
        )}
      </section>

      {/* Services Section */}
      <ServicesSection />

      {/* Comprehensive Footer */}
      <Footer />
    </div>
  );
}
