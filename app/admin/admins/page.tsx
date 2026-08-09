"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FlowingUnderline from "@/components/FlowingUnderline";

interface AdminItem {
  _id: string;
  username: string;
  createdAt: string;
}

export default function AdminsManagementPage() {
  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [currentUsername, setCurrentUsername] = useState<string>("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admin/admins");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setAdmins(json.admins || []);
          if (json.currentUsername) {
            setCurrentUsername(json.currentUsername);
          }
        }
      }
    } catch {
      setError("فشل جلب قائمة الحسابات الإدارية.");
    }
  };

  useEffect(() => {
    fetchAdmins();
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

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newUsername.trim() || !newPassword) {
      setError("اسم المستخدم وكلمة السر مطلوبان.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "فشل إضافة حساب المسؤول الجديد.");
        setLoading(false);
        return;
      }

      setSuccess(`تم إنشاء حساب المسؤول "${data.data.username}" بنجاح!`);
      setNewUsername("");
      setNewPassword("");
      setLoading(false);
      fetchAdmins();
    } catch {
      setError("حدث خطأ في الاتصال بالشبكة.");
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (id: string, targetUsername: string) => {
    if (admins.length <= 1) {
      setError("لا يمكن حذف حساب المسؤول الأخير في النظام لمنع الإغلاق النهائي (Lockout).");
      return;
    }

    const isSelf = targetUsername.toLowerCase() === currentUsername.toLowerCase();
    const confirmText = isSelf
      ? `تحذير: أنت على وشك حذف حسابك الحالي ("${targetUsername}"). هل أنت تأكد تماماً؟`
      : `هل أنت تأكد من رغبتك في حذف حساب المسؤول "${targetUsername}"؟`;

    const confirmed = window.confirm(confirmText);
    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/admins/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "فشل حذف حساب المسؤول.");
        setDeletingId(null);
        return;
      }

      setSuccess(`تم حذف حساب المسؤول "${targetUsername}" بنجاح.`);
      setDeletingId(null);
      
      if (isSelf) {
        // If logged-in admin deleted themselves, redirect to login
        router.push("/admin/login");
        router.refresh();
      } else {
        fetchAdmins();
      }
    } catch {
      setError("حدث خطأ أثناء محاولة حذف الحساب.");
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans flex flex-col" dir="rtl">
      {/* Top Header */}
      <header className="border-b border-border bg-white px-6 py-4">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent bg-amber-50 px-2.5 py-1 border border-amber-200">
              لوحة التحكم
            </span>
            <h1 className="text-lg font-medium text-ink">
              إدارة حسابات المسؤولين ({admins.length})
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin/account"
              className="text-xs font-medium text-muted hover:text-ink transition-colors"
            >
              🔒 كلمة السر
            </Link>
            <Link
              href="/admin/access"
              className="text-xs font-medium text-muted hover:text-ink transition-colors"
            >
              🔑 أكواد الدخول
            </Link>
            <Link
              href="/"
              className="text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 transition-colors flex items-center gap-1.5"
              title="معاينة البورتفوليو الخاص بالعملاء"
            >
              🌐 معرض الأعمال (البورتفوليو) ←
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
      <main className="mx-auto max-w-7xl w-full px-6 py-10 flex-1 space-y-8">
        {/* Title Bar */}
        <div className="border-b border-border pb-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted">
            Admin Accounts Management
          </span>
          <h2 className="text-2xl font-medium text-ink mt-1">
            حسابات المسؤولين المعتمدة ({admins.length})
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

        {/* Create Admin Form Card */}
        <div className="bg-white border border-border p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">
            + إضافة حساب مسؤول جديد
          </h3>
          <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                اسم المستخدم *
              </label>
              <input
                type="text"
                placeholder="مثال: yossif"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full border border-border bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                كلمة السر الأولية *
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-border bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent"
                required
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-accent-hover text-white text-xs font-semibold uppercase tracking-widest px-6 py-2.5 transition-colors disabled:opacity-50"
              >
                {loading ? "جاري الإضافة..." : "إنشاء حساب المسؤول"}
              </button>
            </div>
          </form>
        </div>

        {/* Admins List Table */}
        <div className="bg-white border border-border overflow-x-auto shadow-sm">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-border bg-paper text-[11px] font-semibold uppercase tracking-wider text-muted">
                <th className="py-3.5 px-4">اسم المستخدم</th>
                <th className="py-3.5 px-4">تاريخ الإنشاء</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {admins.map((adm) => {
                const isSelf = adm.username.toLowerCase() === currentUsername.toLowerCase();

                return (
                  <tr
                    key={adm._id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-ink flex items-center gap-2">
                      <span className="font-mono">{adm.username}</span>
                      {isSelf && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                          أنت (حسابك الحالي)
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-xs text-muted">
                      {new Date(adm.createdAt).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        مسؤول معتمد
                      </span>
                    </td>

                    <td className="py-4 px-4 text-left">
                      <button
                        onClick={() => handleDeleteAdmin(adm._id, adm.username)}
                        disabled={deletingId === adm._id}
                        className="border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {deletingId === adm._id ? "جاري الحذف..." : "حذف الحساب"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
