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

      <main className="flex-1 py-8 sm:py-12">
        <ServicesSection />
      </main>

      <Footer />
    </div>
  );
}
