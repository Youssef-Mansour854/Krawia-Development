"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FlowingUnderline from "@/components/FlowingUnderline";

function EnterForm() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectUrl = searchParams.get("redirect") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("يرجى إدخال كود الدخول الخاص بك");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/viewer-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "كود الدخول غير صحيح أو غير مفعل");
        setLoading(false);
        return;
      }

      // Successfully authenticated
      router.push(redirectUrl);
      router.refresh();
    } catch {
      setError("حدث خطأ أثناء محاولة الدخول. يرجى المحاولة مرة أخرى.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-border p-8 md:p-10 shadow-xl space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent bg-amber-50 px-3 py-1 border border-amber-200 inline-block">
          معرض الأعمال والابتكارات المعمارية
        </span>
        <h1 className="text-2xl font-bold text-ink tracking-tight">
          أسماء كراوية للتطوير العقاري
        </h1>
        <p className="text-xs text-muted leading-relaxed">
          يرجى إدخال كود الدخول الخاص بك لاستعراض المشاريع والتفاصيل المعمارية.
        </p>
        <div className="flex justify-center pt-1">
          <FlowingUnderline className="w-32 h-3 text-accent" />
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs font-medium text-center">
          {error}
        </div>
      )}

      {/* Password Entry Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
            كود الدخول (Access Code)
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل الكود الخاص بك هنا..."
              className="w-full border border-border bg-paper px-4 py-3 text-sm text-ink font-mono focus:outline-none focus:border-accent transition-colors"
              required
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-ink px-2 py-1"
            >
              {showPassword ? "إخفاء" : "إظهار"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase tracking-widest py-3.5 px-6 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {loading ? "جاري التحقق من الكود..." : "دخول المعرض →"}
        </button>
      </form>

      <div className="text-center pt-2 border-t border-border">
        <p className="text-[11px] text-muted">
          للحصول على كود دخول خاص بك، يرجى التواصل مع المكتب الرئيسي.
        </p>
      </div>
    </div>
  );
}

export default function EnterPage() {
  return (
    <div
      className="min-h-screen bg-paper text-ink font-sans flex items-center justify-center p-4"
      dir="rtl"
    >
      <Suspense fallback={<div className="text-sm text-muted">جاري التحميل...</div>}>
        <EnterForm />
      </Suspense>
    </div>
  );
}
