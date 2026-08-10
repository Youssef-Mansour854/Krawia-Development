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

export default async function HomePage() {
  const allProjects = await getAllProjects();
  const homepageProjects = allProjects.length > 0 ? allProjects.slice(0, 3) : SAMPLE_PROJECT_FALLBACKS;

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <Navbar />

      {/* 4K Architectural Hero Section (100vh Full Viewport Screen) */}
      <section className="relative overflow-hidden border-b border-border min-h-[calc(100vh-68px)] flex flex-col justify-between items-center px-4 sm:px-6 py-10 sm:py-16">
        {/* Real Site Work Image Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/img/site-images/IMG-20260809-WA0031.jpg"
            alt="تصاميم معمارية فاخرة - المهندسة أسماء كراوية"
            fill
            priority
            className="object-cover object-center scale-105 transition-transform duration-1000"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-slate-950/75 bg-gradient-to-b from-slate-950/85 via-slate-950/65 to-slate-950/95 backdrop-blur-[1px]" />
        </div>

        {/* Hero Central Header */}
        <div className="relative z-10 mx-auto max-w-5xl text-center space-y-6 sm:space-y-8 text-white my-auto pt-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-slate-950/85 backdrop-blur-md px-5 py-2 text-xs font-semibold text-amber-300 shadow-md">
            <svg className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>الهندسة المعمارية والتشطيبات الفاخرة</span>
          </div>

          <div className="space-y-4">
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight drop-shadow-lg">
              مساحات مبتكرة ومعالم معمارية فاخرة
            </h1>
            <div className="flex justify-center">
              <FlowingUnderline className="w-64 sm:w-80 h-4 text-amber-500" />
            </div>
          </div>

          <p className="mx-auto max-w-3xl text-sm sm:text-lg md:text-xl text-slate-200 leading-relaxed font-normal drop-shadow-sm px-2">
            تصاميم المهندسة أسماء كراوية للتشطيبات والديكور والتطوير العقاري. اختر القسم المطلوب أدناه للانتقال المباشر بدون سكرول طويل.
          </p>

          {/* Scroll Down Hint Arrow */}
          <div className="pt-8 flex flex-col items-center gap-1.5 text-slate-400 text-xs font-semibold animate-bounce cursor-pointer">
            <span>استكشف الأقسام أدناه</span>
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Architectural Navigation Hub Cards (Section 1 Below Hero) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-slate-900 text-white border-b border-border font-sans">
        <div className="mx-auto max-w-7xl space-y-10">
          <div className="text-center space-y-2">
            <h2 className="font-serif text-2xl sm:text-4xl font-medium text-white">
              أقسام البورتفليو والرئيسية
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              اضغط على أي قسم للانتقال المباشر للصفحة والتفاصيل الكاملة
            </p>
          </div>

          {/* 4 Main Section Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: About */}
            <Link
              href="/about"
              className="group relative overflow-hidden rounded-md border border-amber-500/30 bg-slate-950 p-5 sm:p-6 transition-all duration-300 hover:border-amber-400 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/20 flex flex-col justify-between h-60 sm:h-64"
            >
              <div className="absolute inset-0 opacity-30 group-hover:opacity-45 transition-opacity">
                <Image
                  src="/img/manger-images/IMG-20260809-WA0026.jpg"
                  alt="المهندسة أسماء كراوية - عن الشركة"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/30" />
              </div>
              <div className="relative z-10 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-950/90 border border-amber-500/40 px-2.5 py-1 rounded-sm inline-block backdrop-blur-xs">
                  الرؤية والخبرة
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-white group-hover:text-amber-300 transition-colors">
                  عن الشركة
                </h3>
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  تعرف على الخبرة المعمارية وفلسفة المهندسة أسماء كراوية وسجل النجاحات.
                </p>
              </div>
              <div className="relative z-10 pt-3 flex items-center gap-2 text-xs font-semibold text-amber-400 group-hover:translate-x-[-4px] transition-transform">
                <span>تصفح عن المهندسة</span>
                <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
            </Link>

            {/* Card 2: Showcase */}
            <Link
              href="/showcase"
              className="group relative overflow-hidden rounded-md border border-amber-500/30 bg-slate-950 p-5 sm:p-6 transition-all duration-300 hover:border-amber-400 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/20 flex flex-col justify-between h-60 sm:h-64"
            >
              <div className="absolute inset-0 opacity-25 group-hover:opacity-40 transition-opacity">
                <Image
                  src="/img/site-images/IMG-20260809-WA0030.jpg"
                  alt="عينات الأعمال الواقعية"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/30" />
              </div>
              <div className="relative z-10 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-950/90 border border-amber-500/40 px-2.5 py-1 rounded-sm inline-block backdrop-blur-xs">
                  تنفيذ ميداني 100%
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-white group-hover:text-amber-300 transition-colors">
                  عينات الأعمال
                </h3>
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  استعرض الصور الواقعية والفيديوهات الميدانية ومخططات الأسقف والديكور.
                </p>
              </div>
              <div className="relative z-10 pt-3 flex items-center gap-2 text-xs font-semibold text-amber-400 group-hover:translate-x-[-4px] transition-transform">
                <span>استعرض المعرض الواقعي</span>
                <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
            </Link>

            {/* Card 3: Projects */}
            <Link
              href="/projects"
              className="group relative overflow-hidden rounded-md border border-amber-500/30 bg-slate-950 p-5 sm:p-6 transition-all duration-300 hover:border-amber-400 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/20 flex flex-col justify-between h-60 sm:h-64"
            >
              <div className="absolute inset-0 opacity-25 group-hover:opacity-40 transition-opacity">
                <Image
                  src="/img/site-images/IMG-20260809-WA0033.jpg"
                  alt="معرض المشاريع الكاملة"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/30" />
              </div>
              <div className="relative z-10 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-950/90 border border-amber-500/40 px-2.5 py-1 rounded-sm inline-block backdrop-blur-xs">
                  المشروعات والمعارض
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-white group-hover:text-amber-300 transition-colors">
                  المشاريع المعمارية
                </h3>
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  تصفح المشاريع السكنية والتجارية الكاملة مع ميزة البحث والفلترة.
                </p>
              </div>
              <div className="relative z-10 pt-3 flex items-center gap-2 text-xs font-semibold text-amber-400 group-hover:translate-x-[-4px] transition-transform">
                <span>تصفح معرض المشاريع</span>
                <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
            </Link>

            {/* Card 4: Services */}
            <Link
              href="/services"
              className="group relative overflow-hidden rounded-md border border-amber-500/30 bg-slate-950 p-5 sm:p-6 transition-all duration-300 hover:border-amber-400 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/20 flex flex-col justify-between h-60 sm:h-64"
            >
              <div className="absolute inset-0 opacity-25 group-hover:opacity-40 transition-opacity">
                <Image
                  src="/img/site-images/IMG-20260809-WA0031.jpg"
                  alt="خدمات التشطيبات والديكور"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/30" />
              </div>
              <div className="relative z-10 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-950/90 border border-amber-500/40 px-2.5 py-1 rounded-sm inline-block backdrop-blur-xs">
                  التشطيب والإشراف
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-white group-hover:text-amber-300 transition-colors">
                  خدماتنا ونطاق العمل
                </h3>
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  تفاصيل خدمات الديكور، الإشراف المعماري، وتجهيز العقارات بالكامل.
                </p>
              </div>
              <div className="relative z-10 pt-3 flex items-center gap-2 text-xs font-semibold text-amber-400 group-hover:translate-x-[-4px] transition-transform">
                <span>استكشف الخدمات</span>
                <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects Preview Grid (Section 2 Below Hero) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 w-full space-y-10 font-sans">
        <div className="border-b border-border pb-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
              أحدث المشاريع المضافة
            </h2>
            <p className="text-xs sm:text-sm text-muted pt-1">معاينة سريعة لأحدث الأعمال الهندسية</p>
          </div>
          <Link
            href="/projects"
            className="text-xs sm:text-sm font-semibold text-accent hover:underline flex items-center gap-1"
          >
            <span>جميع المشاريع</span>
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {homepageProjects.map((project) => (
            <Link
              key={project._id.toString()}
              href={`/projects/${project.slug}`}
              className="group border border-border bg-white overflow-hidden transition-all duration-300 hover:border-accent hover:shadow-lg flex flex-col rounded-sm"
            >
              <div className="relative h-52 sm:h-60 w-full bg-slate-100 overflow-hidden">
                <Image
                  src={project.coverImage}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-3 right-3 flex gap-1.5">
                  <span className="bg-slate-950/80 text-white text-[9px] uppercase font-semibold px-2 py-0.5 rounded-sm">
                    {getCategoryLabel(project.category)}
                  </span>
                  <span className="bg-amber-500 text-slate-950 text-[9px] uppercase font-bold px-2 py-0.5 rounded-sm">
                    {getStatusLabel(project.status)}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-serif text-lg font-medium text-ink group-hover:text-accent transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-muted mt-1.5 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>
                <div className="pt-2 text-xs font-semibold text-accent flex items-center gap-1 group-hover:-translate-x-1 transition-transform">
                  <span>تفاصيل المشروع</span>
                  <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
