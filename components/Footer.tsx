import Link from "next/link";
import FlowingUnderline from "./FlowingUnderline";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-slate-950 text-white font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Column 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="group inline-flex items-center">
              <img
                src="/img/logo/logo_shafaf.png"
                alt="شعار المهندسة أسماء كراوية للتشطيبات والديكور"
                className="h-20 sm:h-24 md:h-28 w-auto object-contain filter brightness-110 drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              شركة رائدة في التشطيبات والديكور والتطوير العقاري، تبتكر معالم فاخرة تدمج بين الأصالة الاستثنائية والتصميم الرؤيوي المعاصر.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">
              روابط سريعة
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link href="/about" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span>←</span> عن الشركة والفلسفة
                </Link>
              </li>
              <li>
                <Link href="/showcase" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span>←</span> عينات الأعمال الواقعية
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span>←</span> معرض المشاريع المعمارية
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span>←</span> خدماتنا ونطاق العمل
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">
              مجالات التميز
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>التصميم المعماري والديكور</li>
              <li>التطوير والاستثمار العقاري</li>
              <li>التخطيط والتصميم الداخلي</li>
              <li>إدارة وتحديث المشاريع الفاخرة</li>
              <li>المخططات والاستشارات الهندسية</li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">
              المقر الرئيسي
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <p className="flex items-start gap-2">
                <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>جمهورية مصر العربية - دمنهور (شارع الضغط العالي - محافظة البحيرة)</span>
              </p>

              <p className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span dir="ltr">+20 10 1234 5678</span>
              </p>

              <p className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@asmaakrawia.com</span>
              </p>

              <p className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>الأحد - الخميس | 9:00 ص - 6:00 م</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Rights Bar */}
        <div className="pt-8 flex items-center justify-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} تصاميم المهندسة أسماء كراوية للتشطيبات والديكور والتطوير العقاري. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
