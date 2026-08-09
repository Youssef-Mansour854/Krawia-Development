"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FlowingUnderline from "@/components/FlowingUnderline";

export default function AdminAccountPage() {
  const [username, setUsername] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (json.username) {
            setUsername(json.username);
          }
        }
      } catch {
        // ignore
      }
    }
    fetchMe();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword) {
      setError("يرجى إدخال كلمة السر الحالية.");
      return;
    }
    if (newPassword.length < 8) {
      setError("كلمة السر الجديدة يجب أن تكون 8 أحرف على الأقل.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("كلمة السر الجديدة وتأكيدها غير متطابقين.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "فشل تغيير كلمة السر.");
        setLoading(false);
        return;
      }

      setSuccess("تم تغيير كلمة السر بنجاح!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setLoading(false);
    } catch {
      setError("حدث خطأ في الاتصال بالشبكة.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans flex flex-col" dir="rtl">
      {/* Top Header */}
      <header className="border-b border-border bg-white px-6 py-4">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/img/logo/logo_shafaf.png"
              alt="شعار المهندسة أسماء كراوية للتشطيبات والديكور"
              className="h-11 sm:h-13 w-auto object-contain drop-shadow-sm"
            />
            <span className="text-xs font-semibold uppercase tracking-widest text-accent bg-amber-50 px-2.5 py-1 border border-amber-200">
              إعدادات حساب المسؤول {username && <span className="text-accent font-bold">({username})</span>}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin/admins"
              className="text-xs font-medium text-muted hover:text-ink transition-colors"
            >
              👥 الحسابات الإدارية
            </Link>
            <Link
              href="/admin/access"
              className="text-xs font-medium text-muted hover:text-ink transition-colors"
            >
              🔑 أكواد الدخول
            </Link>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 transition-colors flex items-center gap-1.5"
              title="معاينة البورتفوليو الخاص بالعملاء في تبويب جديد"
            >
              🌐 معرض الأعمال (البورتفوليو) ↗
            </Link>
            <Link
              href="/admin"
              className="text-xs font-medium text-muted hover:text-ink transition-colors"
            >
              ← إدارة المشاريع
            </Link>
            <button
              onClick={handleLogout}
              className="border border-border bg-paper hover:bg-red-50 hover:text-red-700 hover:border-red-200 px-3.5 py-1.5 text-xs font-medium text-ink transition-colors"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl w-full px-6 py-12 flex-1 space-y-8">
        <div className="border-b border-border pb-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted">
            Account Security
          </span>
          <h2 className="text-2xl font-medium text-ink mt-1">
            تغيير كلمة السر الحالية
          </h2>
          <FlowingUnderline className="w-36 h-3 text-accent" />
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

        <div className="bg-white border border-border p-8 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink">
                كلمة السر الحالية *
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="أدخل كلمة السر الحالية..."
                className="w-full border border-border bg-paper px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink">
                كلمة السر الجديدة *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="6 أحرف على الأقل..."
                className="w-full border border-border bg-paper px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink">
                تأكيد كلمة السر الجديدة *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد إدخال كلمة السر الجديدة..."
                className="w-full border border-border bg-paper px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-white text-xs font-semibold uppercase tracking-widest py-3.5 px-4 transition-colors disabled:opacity-50"
            >
              {loading ? "جاري الحفظ..." : "تحديث كلمة السر"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
