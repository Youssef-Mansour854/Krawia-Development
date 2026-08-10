import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import StatsSection from "@/components/StatsSection";
import FlowingUnderline from "@/components/FlowingUnderline";
import Link from "next/link";

export const metadata = {
  title: "عن المهندسة أسماء كراوية | التشطيبات والديكور والتطوير العقاري",
  description: "تعرف على الخبرات والفلسفة المعمارية للمهندسة أسماء كراوية وسجل النجاحات في التشطيبات الفاخرة والديكور.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <Navbar />

      {/* Hero Subpage Header */}
      <section className="bg-slate-950 text-white py-16 px-4 sm:px-6 relative overflow-hidden border-b border-border">
        <div className="mx-auto max-w-5xl text-center space-y-4 relative z-10">
          <span className="text-amber-400 text-xs uppercase font-semibold tracking-widest bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full inline-block">
            الرؤية والخبرات المعمارية
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-white">
            عن المهندسة أسماء كراوية
          </h1>
          <div className="flex justify-center">
            <FlowingUnderline className="w-48 h-3 text-amber-500" />
          </div>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            خبرة هندسية متكاملة في التخطيط المعماري، التشطيبات والديكورات الفاخرة، وإدارة المشاريع العصرية بدمنهور والبحيرة.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1">
        <AboutSection />
        <StatsSection />
      </main>

      {/* Call To Action Banner */}
      <section className="bg-amber-600 text-white py-12 px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium">هل تريد البدء في تصميم أو تشطيب مشروعك الآن؟</h2>
          <p className="text-amber-100 text-sm max-w-xl mx-auto">
            تواصل معنا مباشرة للاستشارة المعمارية والمعاينة الهندسية على أرض الواقع.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link
              href="/showcase"
              className="bg-slate-950 hover:bg-slate-900 text-white text-xs font-semibold px-6 py-3 uppercase tracking-wider transition-all"
            >
              استعرض عينات الأعمال
            </Link>
            <Link
              href="/projects"
              className="bg-white hover:bg-amber-50 text-slate-950 text-xs font-semibold px-6 py-3 uppercase tracking-wider transition-all"
            >
              معرض المشاريع
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
