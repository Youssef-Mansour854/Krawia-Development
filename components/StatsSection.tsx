import React from "react";

export default function StatsSection() {
  const stats = [
    {
      value: "+15",
      label: "عاماً من الخبرة والريادة",
      description: "صياغة مفاهيم معمارية أيقونية",
    },
    {
      value: "+35",
      label: "مشروعاً معمارياً فاخراً",
      description: "أبراج تجارية ومجمعات سكنية",
    },
    {
      value: "+500K",
      label: "متر مربع مطور",
      description: "مساحات مصممة بأعلى معايير الجودة",
    },
    {
      value: "100%",
      label: "التزام بالجودة والدقة",
      description: "تسليم المشاريع طبقاً للمخططات",
    },
  ];

  return (
    <section className="border-y border-border bg-slate-900 text-white py-12 px-6 font-sans">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-x-reverse divide-white/10">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-1 p-2">
              <span className="font-serif text-3xl sm:text-5xl font-medium text-amber-400 block tracking-tight">
                {stat.value}
              </span>
              <h4 className="text-sm font-semibold text-white mt-1">
                {stat.label}
              </h4>
              <p className="text-xs text-slate-400 font-normal">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
