import Link from "next/link";
import FlowingUnderline from "./FlowingUnderline";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-slate-950 text-white font-sans">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Column 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="group inline-flex flex-col" dir="ltr">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl font-semibold tracking-tight text-white">
                  Asmaa Krawia
                </span>
                <span className="text-xs font-light tracking-widest text-amber-400 uppercase">
                  Designs
                </span>
              </div>
              <FlowingUnderline className="w-28 h-2 -mt-1 text-amber-500" />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              شركة رائدة في التطوير العقاري والهندسة المعمارية، تبتكر معالم فاخرة تدمج بين الأصالة الاستثنائية والتصميم الرؤيوي المعاصر.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              روابط سريعة
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link href="/projects" className="hover:text-amber-400 transition-colors">
                  معرض جميع المشاريع
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-amber-400 transition-colors">
                  عن الشركة والفلسفة
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-amber-400 transition-colors">
                  خدماتنا ونطاق العمل
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              مجالات التميز
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>التصميم المعماري والهندسي</li>
              <li>التطوير والاستثمار العقاري</li>
              <li>التخطيط والتصميم الداخلي</li>
              <li>إدارة وتحديث المشاريع الفاخرة</li>
              <li>المخططات والاستشارات الهندسية</li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              المقر الرئيسي
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <p>📍 جمهورية مصر العربية - دمنهور</p>
              <p>شارع الجمهورية - محافظة البحيرة</p>
              <p>📞 هاتف: +20 10 1234 5678</p>
              <p>✉️ البريد: info@asmaakrawia.com</p>
              <p>🕒 أوقات العمل: الأحد - الخميس | 9:00 ص - 6:00 م</p>
            </div>
          </div>
        </div>

        {/* Bottom Rights Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} تصاميم أسماء كراوية للتطوير العقاري. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-6">
            <Link href="/admin" className="hover:text-amber-400 transition-colors">
              بوابة الأدمن
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
