import React from "react";

export default function StatsSection() {
  const stats = [
    {
      value: "15+",
      label: "عاماً من الخبرة والريادة",
      description: "صياغة مفاهيم معمارية وديكورات أيقونية",
    },
    {
      value: "35+",
      label: "مشروعاً معمارياً فاخراً",
      description: "أبراج تجارية ومجمعات سكنية وتستطيبات",
    },
    {
      value: "+500K",
      label: "متر مربع مطور",
      description: "مساحات مصممة بأعلى معايير الجودة العالمية",
    },
    {
      value: "100%",
      label: "التزام بالجودة والدقة",
      description: "تسليم المشاريع طبقاً للمخططات والمواعيد",
    },
  ];

  return (
    <section className="border-y border-amber-900/30 bg-slate-950 text-white py-12 px-4 sm:px-6 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-950 to-slate-950 opacity-70 pointer-events-none" />
      <div className="mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-white/10">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-2 py-4 md:py-0 px-2 group cursor-default transition-transform duration-300 hover:-translate-y-1">
              <span className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent block tracking-tight transition-all duration-300 group-hover:scale-105" dir="ltr">
                {stat.value}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white mt-1">
                {stat.label}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 font-normal leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
