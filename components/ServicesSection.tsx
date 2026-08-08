import React from "react";
import FlowingUnderline from "./FlowingUnderline";

export default function ServicesSection() {
  const services = [
    {
      num: "01",
      title: "التصميم المعماري للهياكل والواجهات",
      description:
        "ابتكار مفاهيم معمارية فريدة وتصميم واجهات فاخرة تجمع بين الأناقة والاستدامة للأبراج، المجمعات، والفلل الخاصة.",
    },
    {
      num: "02",
      title: "التطوير العقاري وإدارة المشاريع",
      description:
        "تخطيط وتطوير المشاريع الاستثمارية بدءاً من دراسات الجدوى المعمارية وحتى الإشراف التنفيذي وتسليم المشاريع المكتملة.",
    },
    {
      num: "03",
      title: "التصميم الداخلي وتخطيط المساحات",
      description:
        "دراسة المساحات الداخلية بعناية، وتوزيع الإضاءة والمواد لتهيئة بيئات عيش وعمل تعكس أرقى معايير الفخامة.",
    },
    {
      num: "04",
      title: "المخططات الهندسية والاستشارات الفنية",
      description:
        "إعداد المخططات التنفيذية والإنشائية المعتمدة (PDF / CAD) وتوفير الاستشارات الهندسية للحصول على التراخيص.",
    },
  ];

  return (
    <section id="services" className="border-t border-border bg-white py-20 px-6 w-full font-sans">
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              خدماتنا ونطاق العمل
            </span>
            <h2 className="font-serif text-3xl font-medium text-ink mt-1">
              مجالات التميز والحلول المعمارية
            </h2>
            <FlowingUnderline className="w-36 h-3 text-accent" />
          </div>
          <p className="text-xs text-muted max-w-md">
            نقدم حزمة خدمات معمارية وهندسية متكاملة تضمن تحويل الرؤية الاستثمارية والسكنية إلى واقع أيقوني ملموس.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="border border-border bg-paper p-8 flex flex-col justify-between space-y-6 hover:border-accent transition-all duration-300 hover:shadow-sm group"
            >
              <div className="space-y-4">
                <span className="font-serif text-3xl font-bold text-accent/60 group-hover:text-accent transition-colors block">
                  {service.num}
                </span>
                <h3 className="font-serif text-xl font-medium text-ink group-hover:text-accent transition-colors leading-snug">
                  {service.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed font-normal">
                  {service.description}
                </p>
              </div>

              <a
                href="/projects"
                className="pt-4 border-t border-border/60 text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-1 group-hover:-translate-x-1 transition-transform"
              >
                تصفح المشاريع ←
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
