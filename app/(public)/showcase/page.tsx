import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WorkShowcaseGallery from "@/components/WorkShowcaseGallery";
import FlowingUnderline from "@/components/FlowingUnderline";
import { connectToDatabase } from "@/lib/db";
import { SiteSample, ISiteSample } from "@/models/SiteSample";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "عينات الأعمال الواقعية | المهندسة أسماء كراوية",
  description: "استعرض صور ومستندات وفيديوهات عينات الأعمال الواقعية والتنفيذ الميداني للأسقف والديكورات والتشطيبات.",
};

async function getDynamicSiteSamples(): Promise<ISiteSample[]> {
  try {
    await connectToDatabase();
    const samples = await SiteSample.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(samples));
  } catch (err) {
    console.error("Error fetching site samples for showcase page:", err);
    return [];
  }
}

export default async function ShowcasePage() {
  const siteSamples = await getDynamicSiteSamples();

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <Navbar />

      {/* Hero Subpage Header */}
      <section className="bg-slate-950 text-white py-16 px-4 sm:px-6 relative overflow-hidden border-b border-border">
        <div className="mx-auto max-w-5xl text-center space-y-4 relative z-10">
          <span className="text-amber-400 text-xs uppercase font-semibold tracking-widest bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full inline-block">
            عينات التنفيذ الميداني 100%
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-white">
            معرض عينات الأعمال الواقعية
          </h1>
          <div className="flex justify-center">
            <FlowingUnderline className="w-48 h-3 text-amber-500" />
          </div>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            مجموعة مختارة من صور المواقع التنفيذية، التشطيبات الفاخرة للأسقف والمساحات الديكورية، ومستندات المخططات الهندسية.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <WorkShowcaseGallery initialSamples={siteSamples} />
      </main>

      <Footer />
    </div>
  );
}
