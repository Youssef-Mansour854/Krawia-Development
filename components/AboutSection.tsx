import React from "react";
import Image from "next/image";
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
    <section id="about" className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 w-full space-y-12 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left/Text Side */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent bg-amber-50 px-3 py-1 border border-amber-200 inline-block">
              عن المهندسة والشركة
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-ink leading-tight">
              الفلسفة المعمارية وشغف الابتكار
            </h2>
            <FlowingUnderline className="w-40 h-3 text-accent" />
          </div>

          <p className="text-base text-ink leading-relaxed font-normal">
            تأسست <strong className="text-accent font-bold">تصاميم المهندسة أسماء كراوية للتشطيبات والديكور والتطوير العقاري</strong> على رؤية هندسية طموحة تهدف إلى إحداث تحول نوعي في مشهد العمارة والتصميم الداخلي بالمنطقة. نحن نؤمن بأن المبنى ليس مجرد جدران، بل هو تجربة عيش متكاملة ومساحة تلهم قاطنيها.
          </p>

          <p className="text-sm text-muted leading-relaxed font-normal">
            يمتد نطاق عملنا ليشمل تصميم الأبراج التجارية الفاخرة، المجمعات السكنية المغلقة، الفلل المخصصة، والتشطيبات الفاخرة، مع تقديم حلول شاملة تبدأ من المفهوم المعماري الأولي وحسابات المخططات الهندسية وحتى الإشراف التنفيذي الميداني الكامل.
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

        {/* Right/Owner Real Image Card */}
        <div className="lg:col-span-5 border border-border bg-white p-4 sm:p-6 space-y-6 shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-2 h-full bg-accent"></div>
          
          <div className="relative h-80 sm:h-96 w-full border border-border overflow-hidden bg-slate-100 shadow-sm">
            <Image
              src="/img/manger-images/IMG-20260809-WA0024.jpg"
              alt="المهندسة أسماء كراوية - المؤسس والرئيس التنفيذي"
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 40vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-4 right-4 text-white space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-slate-950/80 px-2.5 py-1 border border-amber-400/30 backdrop-blur-md">
                القيادة والإبداع المعماري
              </span>
              <h3 className="font-serif text-xl font-bold text-white">
                م. أسماء كراوية
              </h3>
              <p className="text-xs text-slate-200 font-normal">
                المؤسس والرئيس التنفيذي للشركة
              </p>
            </div>
          </div>

          <blockquote className="border-r-2 border-accent pr-4 text-xs sm:text-sm italic text-muted leading-relaxed">
            "العمارة الحقيقية هي التوازن الدقيق بين الوظيفة الهندسية والجمالية الفنية التي تمنح المكان روحه الهادئة وسحره الخاص."
          </blockquote>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-semibold text-ink">
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10 rounded-full border border-accent overflow-hidden shrink-0">
                <Image
                  src="/img/manger-images/IMG-20260809-WA0026.jpg"
                  alt="م. أسماء كراوية"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-ink">م. أسماء كراوية</p>
                <p className="text-[10px] text-muted font-normal">الإشراف الإبداعي والهندسي</p>
              </div>
            </div>
            <span className="text-accent font-serif font-bold text-base tracking-wider">ASMAA KRAWIA</span>
          </div>
        </div>
      </div>
    </section>
  );
}
