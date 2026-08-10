import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import StatsSection from "@/components/StatsSection";

export const metadata = {
  title: "عن المهندسة أسماء كراوية | التشطيبات والديكور والتطوير العقاري",
  description: "تعرف على الخبرات والفلسفة المعمارية للمهندسة أسماء كراوية وسجل النجاحات في التشطيبات الفاخرة والديكور.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-2 sm:py-4">
        <AboutSection />
        <StatsSection />
      </main>

      <Footer />
    </div>
  );
}
