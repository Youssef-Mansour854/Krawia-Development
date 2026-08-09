"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FlowingUnderline from "@/components/FlowingUnderline";
import AdminHeaderNav from "@/components/AdminHeaderNav";

interface AdminItem {
  _id: string;
  username: string;
  employeeName?: string;
  createdAt: string;
}

export default function AdminsManagementPage() {
  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [currentUsername, setCurrentUsername] = useState<string>("");
  const [newUsername, setNewUsername] = useState("");
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Edit/Reset Password State
  const [editingAdmin, setEditingAdmin] = useState<AdminItem | null>(null);
  const [editEmployeeName, setEditEmployeeName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

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
          employeeName: newEmployeeName.trim(),
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
      setNewEmployeeName("");
      setNewPassword("");
      setLoading(false);
      fetchAdmins();
    } catch {
      setError("حدث خطأ في الاتصال بالشبكة.");
      setLoading(false);
    }
  };

  const handleStartEdit = (adm: AdminItem) => {
    setEditingAdmin(adm);
    setEditEmployeeName(adm.employeeName || "");
    setEditUsername(adm.username);
    setEditPassword("");
    setShowEditPassword(false);
    setError("");
    setSuccess("");
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    setEditLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/admins/${editingAdmin._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: editUsername.trim(),
          employeeName: editEmployeeName.trim(),
          newPassword: editPassword ? editPassword : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "فشل تحديث بيانات الحساب.");
        setEditLoading(false);
        return;
      }

      setSuccess(`تم تحديث بيانات مسؤول النظام "${data.data.username}" بنجاح!`);
      setEditingAdmin(null);
      setEditLoading(false);
      fetchAdmins();
    } catch {
      setError("حدث خطأ أثناء الاتصال بالشبكة لتحديث البيانات.");
      setEditLoading(false);
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
      <AdminHeaderNav titleBadge={`إدارة المسؤولين والموظفين (${admins.length})`} activeTab="admins" />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-10 flex-1 space-y-6 sm:space-y-8">
        {/* Title Bar */}
        <div className="border-b border-border pb-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted">
            Admin & Staff User Management
          </span>
          <h2 className="text-2xl font-medium text-ink mt-1">
            إدارة حسابات مسؤولين وموظفين النظام ({admins.length})
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
        <div className="bg-white border border-border p-4 sm:p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">
            + إنشاء حساب مسؤول / موظف جديد
          </h3>
          <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                اسم الموظف / مسؤول الحساب
              </label>
              <input
                type="text"
                placeholder="مثال: م. أسماء كراوية"
                value={newEmployeeName}
                onChange={(e) => setNewEmployeeName(e.target.value)}
                className="w-full border border-border bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                اسم الدخول / المستخدم (Username) *
              </label>
              <input
                type="text"
                placeholder="مثال: eng_asmaa"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full border border-border bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                كلمة السر الأولية *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-border bg-paper px-3 py-2 pl-9 text-sm text-ink focus:outline-none focus:border-accent font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-ink px-1"
                  title={showNewPassword ? "إخفاء كلمة السر" : "إظهار كلمة السر"}
                >
                  {showNewPassword ? "🙈" : "👁️"}
                </button>
              </div>
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

        {/* Edit Modal / Floating Overlay Form */}
        {editingAdmin && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setEditingAdmin(null)}
          >
            <div
              className="bg-white border border-border p-6 max-w-lg w-full shadow-2xl space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent bg-amber-50 px-2 py-0.5 border border-amber-200">
                    تحديث الحساب وكلمة السر
                  </span>
                  <h3 className="text-lg font-bold text-ink mt-1">
                    تعديل حساب: {editingAdmin.username}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingAdmin(null)}
                  className="text-muted hover:text-ink font-bold text-base px-2"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateAdmin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    اسم الموظف مسؤول الحساب
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: م. أسماء كراوية"
                    value={editEmployeeName}
                    onChange={(e) => setEditEmployeeName(e.target.value)}
                    className="w-full border border-border bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    اسم الدخول (Username) *
                  </label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full border border-border bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent font-mono"
                    required
                  />
                </div>

                <div className="bg-amber-50/70 border border-amber-200 p-3.5 space-y-2">
                  <label className="block text-xs font-bold text-amber-950">
                    🔑 تعيين كلمة سر جديدة (في حال التعديل أو النسيان)
                  </label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? "text" : "password"}
                      placeholder="اترك الفراغ خالي لعدم التغيير"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full border border-amber-300 bg-white px-3 py-2 pl-9 text-sm text-ink focus:outline-none focus:border-accent font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-ink px-1"
                      title={showEditPassword ? "إخفاء" : "إظهار كلمة السر"}
                    >
                      {showEditPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    💡 أدخل كلمة سر جديدة فقط إذا كنت تريد تغييرها أو في حال نسيتها.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setEditingAdmin(null)}
                    className="border border-border bg-paper px-4 py-2 text-xs font-medium text-muted hover:text-ink"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="bg-accent hover:bg-accent-hover text-white px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    {editLoading ? "جاري التحديث..." : "حفظ التعديلات"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Admins List View */}
        {/* Mobile Cards View */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {admins.map((adm) => {
            const isSelf = adm.username.toLowerCase() === currentUsername.toLowerCase();

            return (
              <div key={adm._id} className="bg-white border border-border p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                  <div className="space-y-0.5">
                    <p className="font-bold text-ink text-base">
                      {adm.employeeName ? adm.employeeName : "مسؤول بدون اسم"}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted">@{adm.username}</span>
                      {isSelf && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5">
                          حسابك الحالي
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5">
                    مسؤول معتمد
                  </span>
                </div>

                <div className="text-[11px] text-muted">
                  تاريخ الإنشاء: {new Date(adm.createdAt).toLocaleDateString("ar-EG")}
                </div>

                <div className="pt-2 border-t border-border flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(adm)}
                    className="flex-1 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 py-2 text-xs font-medium transition-colors"
                  >
                    🔑 تعديل / كلمة السر
                  </button>
                  <button
                    onClick={() => handleDeleteAdmin(adm._id, adm.username)}
                    disabled={deletingId === adm._id}
                    className="flex-1 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 py-2 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {deletingId === adm._id ? "حذف..." : "حذف الحساب"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white border border-border overflow-x-auto shadow-sm w-full">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-border bg-paper text-[11px] font-semibold uppercase tracking-wider text-muted">
                <th className="py-3.5 px-4">اسم الموظف / المسؤول</th>
                <th className="py-3.5 px-4">اسم الدخول (Username)</th>
                <th className="py-3.5 px-4">تاريخ الإنشاء</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4 text-left">الإجراءات والكلمة السرية</th>
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
                    <td className="py-4 px-4 font-bold text-ink">
                      {adm.employeeName ? adm.employeeName : <span className="text-muted font-normal italic">غير محدد</span>}
                    </td>

                    <td className="py-4 px-4 font-medium text-ink">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-800">@{adm.username}</span>
                        {isSelf && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                            أنت (حسابك الحالي)
                          </span>
                        )}
                      </div>
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

                    <td className="py-4 px-4 text-left space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleStartEdit(adm)}
                        className="border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-3 py-1.5 text-xs font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        🔑 تعديل / كلمة السر
                      </button>
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
