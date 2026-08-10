import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WorkShowcaseGallery from "@/components/WorkShowcaseGallery";
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

      <main className="flex-1 py-8 sm:py-12">
        <WorkShowcaseGallery initialSamples={siteSamples} />
      </main>

      <Footer />
    </div>
  );
}
