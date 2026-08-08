"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FlowingUnderline from "@/components/FlowingUnderline";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "فشل التحقق من كلمة المرور.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("حدث خطأ غير متوقع في الشبكة.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col justify-center py-12 px-6 font-sans">
      <div className="mx-auto w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            تصاميم أسماء كراوية
          </span>
          <h1 className="font-sans text-3xl font-medium text-ink tracking-tight">
            تسجيل دخول الأدمن
          </h1>
          <div className="flex justify-center">
            <FlowingUnderline className="w-40 h-3 text-accent" />
          </div>
          <p className="text-xs text-muted font-normal">
            يرجى إدخال كلمة المرور السرية للوصول إلى لوحة إدارة المعرض
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-border p-8 shadow-sm space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-ink"
              >
                كلمة المرور *
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full border border-border bg-paper px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-white text-xs font-semibold uppercase tracking-widest py-3.5 px-4 transition-colors disabled:opacity-50"
            >
              {loading ? "جاري التحقق..." : "تسجيل الدخول إلى لوحة التحكم"}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-border">
            <Link
              href="/"
              className="text-xs text-muted hover:text-accent transition-colors"
            >
              ← العودة إلى الموقع الرئيسي
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
