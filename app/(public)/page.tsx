import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import StatsSection from "@/components/StatsSection";
import WorkShowcaseGallery from "@/components/WorkShowcaseGallery";
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

const SAMPLE_PROJECT_FALLBACKS = [
  {
    _id: "sample-1",
    slug: "luxury-villa-interior",
    title: "تشطيبات فيلا فاخرة وتصاميم ديكور مودرن",
    location: "دمنهور - حي الجمهورية",
    category: "residential",
    status: "completed",
    description: "تنفيذ وتشطيبات هندسية متكاملة للأسقف الجبسية، تكسيات الخشب، وتوزيع الإضاءات الحديثة.",
    coverImage: "/img/site-images/IMG-20260809-WA0030.jpg",
  },
  {
    _id: "sample-2",
    slug: "commercial-tower-finishes",
    title: "تصميم وتنفيذ الواجهات والديكورات التجارية",
    location: "دمنهور - شارع الجيش",
    category: "commercial",
    status: "completed",
    description: "إشراف هندسي وتنفيذ ديكورات فاخرة وتصميم إضاءات تخدم المقار التجارية والأبراج.",
    coverImage: "/img/site-images/IMG-20260809-WA0031.jpg",
  },
  {
    _id: "sample-3",
    slug: "modern-apartment-complex",
    title: "تجهيز وتصاميم شقق ومساحات معمارية",
    location: "دمنهور",
    category: "mixed-use",
    status: "under-construction",
    description: "استغلال ذكي للمساحات وتوزيع أثاث وإضاءة يحقق أقصى معايير الفخامة والراحة.",
    coverImage: "/img/site-images/IMG-20260809-WA0033.jpg",
  },
];

export default async function HomePage() {
  const allProjects = await getAllProjects();
  const homepageProjects = allProjects.length > 0 ? allProjects.slice(0, 3) : SAMPLE_PROJECT_FALLBACKS;
  const totalProjectsCount = allProjects.length;

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans scroll-smooth">
      <Navbar />

      {/* Full-Bleed 4K Architectural Hero Section with Real Work Background */}
      <section className="relative overflow-hidden border-b border-border py-28 sm:py-36 px-4 sm:px-6">
        {/* Background Image - Real Site Work Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/img/site-images/IMG-20260809-WA0031.jpg"
            alt="تصاميم معمارية فاخرة - المهندسة أسماء كراوية"
            fill
            priority
            className="object-cover object-center scale-105 transition-transform duration-1000"
            sizes="100vw"
          />
          {/* Rich Ambient Overlay - Keeps Image Visible & Text Crisp */}
          <div className="absolute inset-0 bg-slate-950/60 bg-gradient-to-b from-slate-950/75 via-slate-950/50 to-slate-950/85 backdrop-blur-[1px]" />
        </div>

        {/* Hero Content Floating Directly over Real Image */}
        <div className="relative z-10 mx-auto max-w-5xl text-center space-y-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-5 py-2 text-xs font-semibold text-amber-300 shadow-md">
            ✨ الهندسة المعمارية والتشطيبات الفاخرة
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
            تقدم تصاميم المهندسة أسماء كراوية مفاهيم معمارية رؤيوية تتحول إلى واقع ملموس. متخصصون في التشطيبات والديكورات الفاخرة، المجمعات السكنية، والمشاريع المعمارية الأيقونية.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="#showcase"
              className="inline-flex items-center justify-center bg-amber-600 hover:bg-amber-700 px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition-all shadow-xl shadow-amber-950/60 border border-amber-400/40 hover:scale-105 w-full sm:w-auto"
            >
              استكشف عينات الأعمال الواقعية ↓
            </a>
            <a
              href="#featured"
              className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition-all hover:scale-105 w-full sm:w-auto"
            >
              عرض أحدث المشاريع ←
            </a>
          </div>
        </div>
      </section>

      {/* Statistics Bar */}
      <StatsSection />

      {/* About Us Section with Real Owner Photo */}
      <AboutSection />

      {/* Real Work Showcase Gallery (Featuring 9 Site Work Images) */}
      <div id="showcase">
        <WorkShowcaseGallery />
      </div>

      {/* Featured Projects Section */}
      <section id="featured" className="mx-auto max-w-7xl px-4 sm:px-6 py-20 w-full space-y-12 border-t border-border">
        <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent bg-amber-50 px-3 py-1 border border-amber-200 inline-block">
              أبرز الإنجازات
            </span>
            <h2 className="font-serif text-3xl font-medium text-ink mt-2">
              المشاريع المعمارية المختارة
            </h2>
            <FlowingUnderline className="w-36 h-3 text-accent" />
          </div>

          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent hover:underline"
          >
            عرض جميع المشاريع المعمارية ←
          </Link>
        </div>

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

        <div className="pt-4 text-center">
          <Link
            href="/projects"
            className="inline-flex items-center gap-3 border border-border bg-white hover:border-accent hover:text-accent px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-ink transition-colors shadow-sm"
          >
            <span>انتقل إلى المعرض الشامل لجميع المشاريع</span>
            <span className="text-sm font-bold">←</span>
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <ServicesSection />

      {/* Comprehensive Footer */}
      <Footer />
    </div>
  );
}
