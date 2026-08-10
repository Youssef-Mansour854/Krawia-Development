import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicesSection from "@/components/ServicesSection";

export const metadata = {
  title: "خدماتنا ونطاق العمل | المهندسة أسماء كراوية",
  description: "خدمات معماريّة متكاملة، تشطيبات فاخرة، تصميم داخلي وخارجي، وتطوير عقاري وإشراف هندسي ميداني.",
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-2 sm:py-4 animate-fade-in">
        <ServicesSection />
      </main>

      <Footer />
    </div>
  );
}
