import React from "react";
import FlowingUnderline from "./FlowingUnderline";

export default function AboutSection() {
  const pillars = [
    {
      title: "ابتكار التصميم المعماري",
      desc: "نصمم مباني تجمع بين الجمالية النحتية والرؤية العصرية لتشكل معالم حضارية فريدة تترك أثراً دائماً.",
      icon: "🏛️",
    },
    {
      title: "دقة التنفيذ الهندسي",
      desc: "نلتزم بأعلى معايير الهندسة الإنشائية والتنفيذ الدقيق للمخططات مع اختيار أنبل المواد والخامات.",
      icon: "📐",
    },
    {
      title: "الاستدامة ورفاهية العيش",
      desc: "ندمج الحلول البيئية الذكية والمساحات الخضراء لتهيئة بيئات سكنية وتجارية تحقق أقصى درجات الراحة.",
      icon: "🌿",
    },
  ];

  return (
    <section id="about" className="mx-auto max-w-7xl px-6 py-20 w-full space-y-12 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left/Text Side */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              عن المهندسة والشركة
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-ink leading-tight">
              الفلسفة المعمارية وشغف الابتكار
            </h2>
            <FlowingUnderline className="w-40 h-3 text-accent" />
          </div>

          <p className="text-base text-ink leading-relaxed font-normal">
            تأسست **تصاميم أسماء كراوية للتطوير العقاري** على رؤية هندسية طموحة تهدف إلى إحداث تحول نوعي في مشهد العمارة والتطوير العقاري بالمنطقة. نحن نؤمن بأن المبنى ليس مجرد جدران، بل هو تجربة عيش متكاملة ومساحة تلهم قاطنيها.
          </p>

          <p className="text-sm text-muted leading-relaxed font-normal">
            يمتد نطاق عملنا ليشمل تصميم الأبراج التجارية الفاخرة، المجمعات السكنية المغلقة، والفلل المخصصة، مع تقديم حلول شاملة تبدأ من المفهوم المعماري الأولي وحسابات المخططات الهندسية وحتى الإشراف الكامل والتسليم المكتمل.
          </p>

          {/* Pillars List */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-border">
            {pillars.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <span className="text-2xl">{item.icon}</span>
                <h4 className="text-sm font-semibold text-ink">{item.title}</h4>
                <p className="text-xs text-muted leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right/Card Image Box */}
        <div className="lg:col-span-5 border border-border bg-white p-8 space-y-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-accent"></div>
          
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              رؤيتنا المستقبليّة
            </span>
            <h3 className="font-serif text-2xl font-medium text-ink">
              صناعة معالم تعيد تعريف الفخامة
            </h3>
          </div>

          <blockquote className="border-r-2 border-accent pr-4 text-sm italic text-muted leading-relaxed">
            "العمارة الحقيقية هي التوازن الدقيق بين الوظيفة الهندسية والجمالية الفنية التي تمنح المكان روحه الهادئة."
          </blockquote>

          <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-semibold text-ink">
            <div>
              <p className="text-sm font-bold text-ink">م. أسماء كراوية</p>
              <p className="text-xs text-muted font-normal">المؤسس والمدير الإبداعي</p>
            </div>
            <span className="text-amber-500 font-serif font-bold text-lg">ASMAA KRAWIA</span>
          </div>
        </div>
      </div>
    </section>
  );
}
