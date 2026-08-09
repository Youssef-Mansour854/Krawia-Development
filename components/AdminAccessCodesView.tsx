"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IAccessCodeData } from "@/models/AccessCode";
import FlowingUnderline from "@/components/FlowingUnderline";
import AdminHeaderNav from "@/components/AdminHeaderNav";

interface AdminAccessCodesViewProps {
  initialCodes: IAccessCodeData[];
}

function generateRandomCode(): string {
  const words = ["krawia", "tanta", "cairo", "design", "arch", "villa", "tower", "plaza"];
  const randomWord = words[Math.floor(Math.random() * words.length)];
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${randomWord}-${randomNum}`;
}

export default function AdminAccessCodesView({
  initialCodes,
}: AdminAccessCodesViewProps) {
  const [codes, setCodes] = useState<IAccessCodeData[]>(initialCodes);
  const [label, setLabel] = useState("");
  const [code, setCode] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const filteredCodes = codes.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.trim().toLowerCase();
    return (
      (item.label && item.label.toLowerCase().includes(term)) ||
      (item.code && item.code.toLowerCase().includes(term))
    );
  });

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  const handleAutoGenerate = () => {
    setCode(generateRandomCode());
  };

  const handleCopyCode = (textToCopy: string) => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setSuccess(`تم نسخ كود الدخول "${textToCopy}" إلى الحافظة بنجاح!`);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !code.trim()) {
      setError("يرجى إدخال الوصف والكود بشكل صحيح.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/access-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim(), code: code.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "فشل إضافة كود الدخول.");
        setLoading(false);
        return;
      }

      setCodes((prev) => [data.data, ...prev]);
      setLabel("");
      setCode("");
      setSuccess(`تم إنشاء كود الدخول "${data.data.label}" بنجاح!`);
      setLoading(false);
      router.refresh();
    } catch {
      setError("حدث خطأ في الاتصال بالشبكة.");
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    setTogglingId(id);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/access-codes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "فشل تعديل حالة الكود.");
        setTogglingId(null);
        return;
      }

      setCodes((prev) =>
        prev.map((item) =>
          item._id.toString() === id ? { ...item, active: !currentActive } : item
        )
      );
      setSuccess(
        !currentActive
          ? "تم تفعيل كود الدخول بنجاح."
          : "تم إلغاء تفعيل كود الدخول (Revoked)."
      );
      setTogglingId(null);
      router.refresh();
    } catch {
      setError("حدث خطأ أثناء تعديل حالة الكود.");
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string, codeLabel: string) => {
    const confirmed = window.confirm(
      `هل أنت محقق من رغبتك في حذف كود الدخول الخاص بـ "${codeLabel}"؟`
    );
    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/access-codes/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "فشل حذف الكود.");
        setDeletingId(null);
        return;
      }

      setCodes((prev) => prev.filter((item) => item._id.toString() !== id));
      setSuccess("تم حذف الكود نهائياً.");
      setDeletingId(null);
      router.refresh();
    } catch {
      setError("حدث خطأ أثناء محاولة حذف الكود.");
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans flex flex-col" dir="rtl">
      {/* Top Header */}
      <AdminHeaderNav titleBadge="لوحة التحكم — أذونات الدخول" activeTab="access" />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-10 flex-1 space-y-6 sm:space-y-8">
        {/* Title Bar */}
        <div className="border-b border-border pb-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted">
            Visitor Access Control
          </span>
          <h2 className="text-2xl font-medium text-ink mt-1">
            أكواد الدخول المخصصة للعملاء ({codes.length})
          </h2>
          <FlowingUnderline className="w-48 h-3 text-accent" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 text-xs font-medium">
            {success}
          </div>
        )}

        {/* Create Code Form Card */}
        <div className="bg-white border border-border p-4 sm:p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">
            + إنشاء كود دخول جديد لعميل
          </h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                الوصف / اسم العميل والمشروع
              </label>
              <input
                type="text"
                placeholder="مثال: Nada - Tanta project"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full border border-border bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-muted">
                  كود الدخول (الكلمة السرية)
                </label>
                <button
                  type="button"
                  onClick={handleAutoGenerate}
                  className="text-[11px] font-semibold text-accent hover:underline"
                >
                  ⚡ توليد كود تلقائي
                </button>
              </div>
              <input
                type="text"
                placeholder="مثال: tanta-2026"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full border border-border bg-paper px-3 py-2 text-sm text-ink font-mono focus:outline-none focus:border-accent"
                required
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-accent-hover text-white text-xs font-semibold uppercase tracking-widest px-6 py-2.5 transition-colors disabled:opacity-50"
              >
                {loading ? "جاري الإضافة..." : "حفظ وإنشاء الكود"}
              </button>
            </div>
          </form>
        </div>

        {/* Brand Search Input Bar */}
        <div className="bg-white border border-border p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-accent text-base">
              🔍
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالوصف أو الكود (مثال: tanta, Nada)..."
              className="w-full border border-border bg-paper pr-10 pl-10 py-2.5 text-sm text-ink focus:outline-none focus:border-accent transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 left-0 px-3 text-xs text-muted hover:text-ink font-bold transition-colors"
                title="إعادة تعيين البحث"
              >
                ✕ مسح
              </button>
            )}
          </div>

          <div className="text-xs font-semibold text-muted bg-paper px-4 py-2.5 border border-border text-center whitespace-nowrap">
            {searchTerm ? (
              <span>
                تم العثور على <strong className="text-accent">{filteredCodes.length}</strong> من أصل{" "}
                {codes.length} كود
              </span>
            ) : (
              <span>
                إجمالي أكواد الدخول: <strong className="text-ink">{codes.length}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Access Codes View */}
        {filteredCodes.length === 0 ? (
          <div className="bg-white border border-border p-8 sm:p-12 text-center text-muted text-sm space-y-3">
            <p>
              {searchTerm
                ? `لا توجد نتائج مطابقة لبحثك: "${searchTerm}"`
                : "لا توجد أكواد دخول حالية. قم بإنشاء أول كود دخول للعملاء أعلاه."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="inline-block bg-accent hover:bg-accent-hover text-white text-xs font-semibold uppercase tracking-wider px-4 py-2 transition-colors"
              >
                عرض جميع الأكواد ({codes.length})
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredCodes.map((item) => (
                <div
                  key={item._id.toString()}
                  className="bg-white border border-border p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                    <span className="font-medium text-ink text-sm">
                      {item.label}
                    </span>
                    {item.active ? (
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5">
                        ✓ مفعل
                      </span>
                    ) : (
                      <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-0.5">
                        ✕ معطل
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 bg-paper p-2.5 border border-border">
                    <span className="font-mono text-accent font-bold text-base">
                      {item.code}
                    </span>
                    <button
                      onClick={() => handleCopyCode(item.code)}
                      className="text-[11px] font-semibold text-ink bg-white border border-border px-2.5 py-1 hover:border-accent transition-colors"
                    >
                      نسخ الكود 📋
                    </button>
                  </div>

                  <div className="text-[11px] text-muted">
                    تاريخ الإنشاء: {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                    <button
                      onClick={() => handleToggleActive(item._id.toString(), item.active)}
                      disabled={togglingId === item._id.toString()}
                      className={`border text-center py-2 text-xs font-medium transition-colors disabled:opacity-50 ${
                        item.active
                          ? "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
                          : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      }`}
                    >
                      {togglingId === item._id.toString()
                        ? "جاري التغيير..."
                        : item.active
                        ? "إلغاء التفعيل"
                        : "تفعيل الكود"}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id.toString(), item.label)}
                      disabled={deletingId === item._id.toString()}
                      className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-center py-2 text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      {deletingId === item._id.toString() ? "حذف..." : "حذف الكود"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white border border-border overflow-x-auto shadow-sm w-full">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-border bg-paper text-[11px] font-semibold uppercase tracking-wider text-muted">
                    <th className="py-3.5 px-4">الوصف / العميل</th>
                    <th className="py-3.5 px-4">كود الدخول</th>
                    <th className="py-3.5 px-4">الحالة</th>
                    <th className="py-3.5 px-4">تاريخ الإنشاء</th>
                    <th className="py-3.5 px-4 text-left">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {filteredCodes.map((item) => (
                    <tr
                      key={item._id.toString()}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-4 px-4 font-medium text-ink">
                        {item.label}
                      </td>

                      <td className="py-4 px-4 font-mono text-accent font-semibold">
                        <div className="flex items-center gap-2">
                          <span>{item.code}</span>
                          <button
                            onClick={() => handleCopyCode(item.code)}
                            className="text-[10px] text-muted hover:text-accent font-sans bg-paper px-1.5 py-0.5 border border-border"
                            title="نسخ الكود"
                          >
                            نسخ 📋
                          </button>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {item.active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            نشط (Active)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-800 bg-red-50 px-2.5 py-1 border border-red-200">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            ملغى (Revoked)
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-xs text-muted">
                        {new Date(item.createdAt).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      <td className="py-4 px-4 text-left space-x-2 space-x-reverse">
                        <button
                          onClick={() =>
                            handleToggleActive(item._id.toString(), item.active)
                          }
                          disabled={togglingId === item._id.toString()}
                          className={`border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                            item.active
                              ? "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                              : "border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                          }`}
                        >
                          {togglingId === item._id.toString()
                            ? "جاري التغيير..."
                            : item.active
                            ? "إلغاء التفعيل (Revoke)"
                            : "تفعيل (Activate)"}
                        </button>

                        <button
                          onClick={() => handleDelete(item._id.toString(), item.label)}
                          disabled={deletingId === item._id.toString()}
                          className="border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {deletingId === item._id.toString() ? "جاري الحذف..." : "حذف"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
