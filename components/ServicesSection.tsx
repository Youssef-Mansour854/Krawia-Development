import React from "react";
import FlowingUnderline from "./FlowingUnderline";

export default function ServicesSection() {
  const services = [
    {
      num: "01",
      title: "التصميم المعماري والديكور",
      description:
        "ابتكار مفاهيم معمارية فريدة وتصميم واجهات فاخرة تجمع بين الأناقة والاستدامة للأبراج، المجمعات، والفلل الخاصة.",
      icon: (
        <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0H9m4 0h2m-4 0v-4m0 0H9m4 0h2m-6 4v4m0 0H9m4 0h2" />
        </svg>
      ),
    },
    {
      num: "02",
      title: "التطوير العقاري وإدارة المشاريع",
      description:
        "تخطيط وتطوير المشاريع الاستثمارية بدءاً من دراسات الجدوى المعمارية وحتى الإشراف التنفيذي وتسليم المشاريع المكتملة.",
      icon: (
        <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      num: "03",
      title: "التصميم الداخلي وتخطيط المساحات",
      description:
        "دراسة المساحات الداخلية بعناية، وتوزيع الإضاءة والمواد لتهيئة بيئات عيش وعمل تعكس أرقى معايير الفخامة.",
      icon: (
        <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      num: "04",
      title: "المخططات الهندسية والاستشارات الفنية",
      description:
        "إعداد المخططات التنفيذية والإنشائية المعتمدة وتوفير الاستشارات الهندسية الميدانية بأعلى احترافية.",
      icon: (
        <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="services" className="border-t border-border bg-white py-20 px-4 sm:px-6 w-full font-sans">
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="border-b border-border pb-6 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent bg-amber-50 px-3 py-1 border border-amber-200 inline-block rounded-sm">
            خدماتنا ونطاق العمل
          </span>
          <h2 className="font-serif text-3xl font-medium text-ink">
            مجالات التميز والحلول المعمارية
          </h2>
          <FlowingUnderline className="w-36 h-3 text-accent" />
          <p className="text-xs text-muted max-w-2xl pt-2 leading-relaxed font-normal">
            نقدم حزمة خدمات معمارية وهندسية متكاملة تضمن تحويل الرؤية الاستثمارية والسكنية إلى واقع أيقوني ملموس.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="border border-border bg-paper p-8 flex flex-col justify-between space-y-6 hover:border-accent transition-all duration-300 hover:shadow-md group rounded-sm"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-2xl font-bold text-accent/70 group-hover:text-accent transition-colors block">
                    {service.num}
                  </span>
                  <div className="p-2 bg-white border border-border group-hover:border-accent transition-colors rounded-sm">
                    {service.icon}
                  </div>
                </div>

                <h3 className="font-serif text-xl font-medium text-ink group-hover:text-accent transition-colors leading-snug">
                  {service.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed font-normal">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
