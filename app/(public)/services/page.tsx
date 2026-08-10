import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicesSection from "@/components/ServicesSection";
import FlowingUnderline from "@/components/FlowingUnderline";
import Link from "next/link";

export const metadata = {
  title: "خدماتنا ونطاق العمل | المهندسة أسماء كراوية",
  description: "خدمات معماريّة متكاملة، تشطيبات فاخرة، تصميم داخلي وخارجي، وتطوير عقاري وإشراف هندسي ميداني.",
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <Navbar />

      {/* Hero Subpage Header */}
      <section className="bg-slate-950 text-white py-16 px-4 sm:px-6 relative overflow-hidden border-b border-border">
        <div className="mx-auto max-w-5xl text-center space-y-4 relative z-10">
          <span className="text-amber-400 text-xs uppercase font-semibold tracking-widest bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full inline-block">
            مجالات الاختصاص والخدمات
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-white">
            خدماتنا المعمارية والهندسية
          </h1>
          <div className="flex justify-center">
            <FlowingUnderline className="w-48 h-3 text-amber-500" />
          </div>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            نوفر حلولاً معمارية شاملة تبدأ من الفكرة والمخطط، حتى التسليم الفعلي لأفخم التشطيبات والديكورات الفاخرة.
          </p>
        </div>
      </section>

      {/* Main Services Section */}
      <main className="flex-1">
        <ServicesSection />
      </main>

      {/* Detailed Services Grid / Extra Highlights */}
      <section className="bg-white py-16 px-4 sm:px-6 border-t border-border">
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="text-center space-y-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
              لماذا تختار التعامل مع مكتب المهندسة أسماء كراوية؟
            </h2>
            <p className="text-muted text-xs sm:text-sm max-w-2xl mx-auto">
              نضمن دقة المواعيد والالتزام التام بأساليب التنفيذ الهندسي الحديثة والمواصفات المعمارية القياسية.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border border-border bg-paper rounded-sm space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="font-serif text-lg font-medium text-ink">إشراف هندسي مباشر</h3>
              <p className="text-xs text-muted leading-relaxed">
                متابعة دقيقة لكافة المراحل التنفيذية في الموقع لضمان مطابقة التنفيذ للتصاميم المعتمدة بأعلى مستويات الجودة.
              </p>
            </div>

            <div className="p-6 border border-border bg-paper rounded-sm space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="font-serif text-lg font-medium text-ink">خامات عالية الفخامة</h3>
              <p className="text-xs text-muted leading-relaxed">
                اختيار وتوريد أرقى الخامات والمواد مع تناسق الإضاءات الجبسية، الأرضيات، وتكسيات الرخام والخشب.
              </p>
            </div>

            <div className="p-6 border border-border bg-paper rounded-sm space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="font-serif text-lg font-medium text-ink">التزام بالميزانية والجدول الزمنية</h3>
              <p className="text-xs text-muted leading-relaxed">
                دراسة تكاليف ومقايسات دقيقة ومسبقة دون مفاجآت، وتسليم المشاريع والمساحات وفق الجدول الزمني المحدد.
              </p>
            </div>
          </div>

          <div className="text-center pt-6">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-8 py-3.5 uppercase tracking-widest transition-all shadow-md"
            >
              <span>مشاهدة مشاريعنا المنفذة</span>
              <svg className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
