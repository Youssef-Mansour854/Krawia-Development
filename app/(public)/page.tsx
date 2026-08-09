import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import StatsSection from "@/components/StatsSection";
import WorkShowcaseGallery from "@/components/WorkShowcaseGallery";
import FlowingUnderline from "@/components/FlowingUnderline";
import { getAllProjects } from "@/lib/projects";
import { connectToDatabase } from "@/lib/db";
import { SiteSample, ISiteSample } from "@/models/SiteSample";
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
    location: "دمنهور - شارع الضغط العالي",
    category: "residential",
    status: "completed",
    description: "تنفيذ وتشطيبات هندسية متكاملة للأسقف الجبسية، تكسيات الخشب، وتوزيع الإضاءات الحديثة.",
    coverImage: "/img/site-images/IMG-20260809-WA0030.jpg",
  },
  {
    _id: "sample-2",
    slug: "commercial-tower-finishes",
    title: "تصميم وتنفيذ الواجهات والديكورات التجارية",
    location: "دمنهور - شارع الضغط العالي",
    category: "commercial",
    status: "completed",
    description: "إشراف هندسي وتنفيذ ديكورات فاخرة وتصميم إضاءات تخدم المقار التجارية والأبراج.",
    coverImage: "/img/site-images/IMG-20260809-WA0031.jpg",
  },
  {
    _id: "sample-3",
    slug: "modern-apartment-complex",
    title: "تجهيز وتصاميم شقق ومساحات معمارية",
    location: "دمنهور - شارع الضغط العالي",
    category: "mixed-use",
    status: "under-construction",
    description: "استغلال ذكي للمساحات وتوزيع أثاث وإضاءة يحقق أقصى معايير الفخامة والراحة.",
    coverImage: "/img/site-images/IMG-20260809-WA0033.jpg",
  },
];

async function getDynamicSiteSamples(): Promise<ISiteSample[]> {
  try {
    await connectToDatabase();
    const samples = await SiteSample.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(samples));
  } catch (err) {
    console.error("Error fetching site samples for homepage:", err);
    return [];
  }
}

export default async function HomePage() {
  const allProjects = await getAllProjects();
  const siteSamples = await getDynamicSiteSamples();

  const homepageProjects = allProjects.length > 0 ? allProjects.slice(0, 3) : SAMPLE_PROJECT_FALLBACKS;

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
          <div className="absolute inset-0 bg-slate-950/60 bg-gradient-to-b from-slate-950/80 via-slate-950/55 to-slate-950/90 backdrop-blur-[1px]" />
        </div>

        {/* Hero Content Floating Directly over Real Image */}
        <div className="relative z-10 mx-auto max-w-5xl text-center space-y-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-slate-950/70 backdrop-blur-md px-5 py-2 text-xs font-semibold text-amber-300 shadow-md border-amber-400/20">
            <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            الهندسة المعمارية والتشطيبات الفاخرة
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
              className="inline-flex items-center justify-center bg-amber-600 hover:bg-amber-700 px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition-all shadow-xl shadow-amber-950/60 border border-amber-400/40 hover:scale-105 w-full sm:w-auto gap-2"
            >
              <span>استكشف عينات الأعمال الواقعية</span>
              <svg className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
            <a
              href="#featured"
              className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition-all hover:scale-105 w-full sm:w-auto gap-2"
            >
              <span>عرض أحدث المشاريع</span>
              <svg className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Statistics Bar */}
      <StatsSection />

      {/* About Us Section with Real Owner Photo */}
      <AboutSection />

      {/* Real Work Showcase Gallery (Dynamic from Database) */}
      <div id="showcase">
        <WorkShowcaseGallery initialSamples={siteSamples} />
      </div>

      {/* Featured Projects Section (Latest 3 Projects) */}
      <section id="featured" className="mx-auto max-w-7xl px-4 sm:px-6 py-20 w-full space-y-12 border-t border-border">
        <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent bg-amber-50 px-3 py-1 border border-amber-200 inline-block rounded-sm">
              أحدث 3 مشاريع مضافة
            </span>
            <h2 className="font-serif text-3xl font-medium text-ink">
              المشاريع المعمارية المختارة
            </h2>
            <FlowingUnderline className="w-36 h-3 text-accent" />
            <p className="text-xs text-muted pt-1 font-normal">
              عرض أحدث 3 مشاريع تم تنفيذها مؤخراً. لتصفح جميع المشاريع المعمارية يمكنك الانتقال للمعرض الشامل.
            </p>
          </div>

          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent hover:underline shrink-0"
          >
            <span>تصفح باقي المشاريع الكاملة</span>
            <svg className="w-4 h-4 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {homepageProjects.map((project) => (
            <Link
              key={project._id.toString()}
              href={`/projects/${project.slug}`}
              className="group border border-border bg-white overflow-hidden transition-all duration-300 hover:border-accent hover:shadow-md flex flex-col rounded-sm"
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
                  <span className="bg-slate-950/80 backdrop-blur-md text-white text-[10px] uppercase font-semibold tracking-wider px-2.5 py-1 rounded-sm">
                    {getCategoryLabel(project.category)}
                  </span>
                  <span className="bg-amber-500 text-slate-950 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-sm">
                    {getStatusLabel(project.status)}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <p className="text-xs text-muted tracking-wider flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {project.location}
                  </p>
                  <h3 className="font-serif text-xl font-medium text-ink group-hover:text-accent transition-colors mt-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-muted mt-2 line-clamp-2 leading-relaxed font-normal">
                    {project.description}
                  </p>
                </div>

                <div className="pt-2 text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-1 group-hover:-translate-x-1 transition-transform">
                  <span>عرض تفاصيل المشروع</span>
                  <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="pt-4 text-center">
          <Link
            href="/projects"
            className="inline-flex items-center gap-3 border border-accent bg-amber-50 hover:bg-accent hover:text-white px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-accent transition-all shadow-sm hover:shadow-md rounded-sm"
          >
            <span>استعرض جميع باقي المشاريع المعمارية الكاملة</span>
            <svg className="w-4 h-4 text-current shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
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
