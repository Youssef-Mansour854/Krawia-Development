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

      {/* Hero Section with Architectural Image Background */}
      <section className="relative overflow-hidden border-b border-border py-28 sm:py-36 px-6">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/img/hero-bg.jpg"
            alt="تصاميم معمارية فاخرة"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
            quality={90}
          />
          {/* Rich Dark Gradient Overlay for Contrast */}
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] bg-gradient-to-b from-slate-950/85 via-slate-950/70 to-slate-950/90" />
        </div>

        {/* Hero Content Overlay */}
        <div className="relative z-10 mx-auto max-w-5xl text-center space-y-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5 text-xs font-medium text-amber-300 shadow-sm">
            ✨ الهندسة المعمارية والتطوير العقاري الفاخر
          </div>

          <div className="space-y-4">
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight text-white leading-tight drop-shadow-sm">
              مساحات مبتكرة ومعالم معمارية فاخرة
            </h1>
            <div className="flex justify-center">
              <FlowingUnderline className="w-56 h-4 text-amber-500" />
            </div>
          </div>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
            تقدم تصاميم أسماء كراوية مفاهيم معمارية رؤيوية تتحول إلى واقع ملموس. متخصصون في المجمعات السكنية الفاخرة، الأبراج التجارية الأيقونية، والمشاريع متعددة الاستخدامات.
          </p>

          <div className="flex justify-center pt-4">
            <a
              href="#featured"
              className="inline-flex items-center justify-center bg-amber-600 hover:bg-amber-700 px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition-colors shadow-lg shadow-amber-950/50 border border-amber-500/30"
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
