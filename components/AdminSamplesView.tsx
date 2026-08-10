"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import FlowingUnderline from "@/components/FlowingUnderline";
import AdminHeaderNav from "@/components/AdminHeaderNav";
import { ISiteSample } from "@/models/SiteSample";

// Compress heavy image files on client canvas before network transmission
async function compressImageFile(file: File | Blob, maxDim = 1920, quality = 0.82): Promise<File | Blob> {
  if (!(file instanceof File) || !file.type.startsWith("image/") || file.type.includes("svg") || file.type.includes("gif")) {
    return file;
  }

  return new Promise((resolve) => {
    const img = document.createElement("img");
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(file);

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            resolve(new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: "image/jpeg" }));
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

interface AdminSamplesViewProps {
  initialSamples: ISiteSample[];
}

export default function AdminSamplesView({ initialSamples }: AdminSamplesViewProps) {
  const [samples, setSamples] = useState<ISiteSample[]>(initialSamples);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"interiors" | "execution" | "lighting">("interiors");
  const [imageSrc, setImageSrc] = useState("");
  const [location, setLocation] = useState("دمنهور - شارع الضغط العالي");

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit State
  const [editingSample, setEditingSample] = useState<ISiteSample | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<"interiors" | "execution" | "lighting">("interiors");
  const [editImageSrc, setEditImageSrc] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editUploading, setEditUploading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  // Lock body scroll when edit modal is active to prevent backdrop overflow gaps
  useEffect(() => {
    if (editingSample) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [editingSample]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isEdit) setEditUploading(true);
    else setUploading(true);
    setError("");

    try {
      const compressed = await compressImageFile(file);
      const blobResult = await upload(`sample-${Date.now()}-${file.name}`, compressed, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      if (isEdit) setEditImageSrc(blobResult.url);
      else setImageSrc(blobResult.url);
    } catch {
      setError("حدث خطأ أثناء رفع الصورة.");
    } finally {
      if (isEdit) setEditUploading(false);
      else setUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageSrc.trim()) {
      setError("عنوان العينة وصورة العينة مطلوبان.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/site-samples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          imageSrc: imageSrc.trim(),
          location: location.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "فشل إضافة العينة.");
        setLoading(false);
        return;
      }

      setSamples((prev) => [data.data, ...prev]);
      setTitle("");
      setImageSrc("");
      setSuccess(`تم إضافة عينة العمل "${data.data.title}" بنجاح!`);
      setLoading(false);
      router.refresh();
    } catch {
      setError("حدث خطأ في الاتصال بالشبكة.");
      setLoading(false);
    }
  };

  const handleStartEdit = (item: ISiteSample) => {
    setEditingSample(item);
    setEditTitle(item.title);
    setEditCategory(item.category);
    setEditImageSrc(item.imageSrc);
    setEditLocation(item.location);
    setError("");
    setSuccess("");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSample) return;

    setEditLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/site-samples/${editingSample._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          category: editCategory,
          imageSrc: editImageSrc.trim(),
          location: editLocation.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "فشل تحديث العينة.");
        setEditLoading(false);
        return;
      }

      setSamples((prev) =>
        prev.map((s) => (s._id.toString() === editingSample._id.toString() ? data.data : s))
      );
      setSuccess(`تم تحديث عينة العمل "${data.data.title}" بنجاح!`);
      setEditingSample(null);
      setEditLoading(false);
      router.refresh();
    } catch {
      setError("حدث خطأ أثناء تعديل العينة.");
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: string, sampleTitle: string) => {
    const confirmed = window.confirm(
      `هل أنت محقق من رغبتك في حذف عينة العمل "${sampleTitle}"؟`
    );
    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/site-samples/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "فشل حذف العينة.");
        setDeletingId(null);
        return;
      }

      setSamples((prev) => prev.filter((s) => s._id.toString() !== id));
      setSuccess(`تم حذف عينة العمل "${sampleTitle}" بنجاح.`);
      setDeletingId(null);
      router.refresh();
    } catch {
      setError("حدث خطأ أثناء حذف العينة.");
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans flex flex-col" dir="rtl">
      {/* Top Header */}
      <AdminHeaderNav titleBadge="لوحة التحكم — عينات الأعمال" activeTab="samples" />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-10 flex-1 space-y-6 sm:space-y-8">
        {/* Title Bar */}
        <div className="border-b border-border pb-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted">
            WORK SHOWCASE MANAGEMENT
          </span>
          <h2 className="text-2xl font-medium text-ink mt-1">
            عينات من أعمالنا الميدانية ({samples.length})
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

        {/* Create Form Card */}
        <div className="bg-white border border-border p-4 sm:p-6 shadow-sm space-y-4 rounded-sm">
          <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">
            + إضافة عينة عمل ميداني جديدة
          </h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                عنوان العينة *
              </label>
              <input
                type="text"
                placeholder="مثال: تشطيبات فاخرة وتصاميم أسقف"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-border bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                تصنيف العينة *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as "interiors" | "execution" | "lighting")}
                className="w-full border border-border bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent"
              >
                <option value="interiors">تشطيبات وديكورات فاخرة</option>
                <option value="execution">تنفيذ وتطوير معماري</option>
                <option value="lighting">إضاءات وديكورات حديثة</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                الموقع / المدينة *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-border bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-muted">
                صورة العينة *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="/img/site-images/..."
                  value={imageSrc}
                  onChange={(e) => setImageSrc(e.target.value)}
                  className="w-full border border-border bg-paper px-3 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                  required
                />
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-border text-ink px-3 py-2 text-xs font-semibold whitespace-nowrap inline-flex items-center gap-1.5 rounded-sm">
                  {uploading ? (
                    <span>جاري...</span>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span>رفع</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, false)} />
                </label>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-4 pt-2">
              <button
                type="submit"
                disabled={loading || uploading}
                className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-white text-xs font-semibold uppercase tracking-widest px-8 py-3 transition-colors disabled:opacity-50 rounded-sm"
              >
                {loading ? "جاري الإضافة..." : "حفظ وإضافة عينة العمل"}
              </button>
            </div>
          </form>
        </div>

        {/* Edit Modal - 100% Full Viewport Backdrop Overlay */}
        {editingSample && (
          <div
            className="fixed inset-0 top-0 left-0 w-full h-full min-h-screen z-[999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
            onClick={() => setEditingSample(null)}
          >
            <div
              className="relative bg-white border border-border p-6 max-w-lg w-full shadow-2xl space-y-4 rounded-sm my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-ink">
                  تعديل عينة العمل
                </h3>
                <button onClick={() => setEditingSample(null)} className="text-muted hover:text-ink font-bold text-lg">✕</button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">عنوان العينة *</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full border border-border bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">التصنيف *</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as "interiors" | "execution" | "lighting")}
                    className="w-full border border-border bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="interiors">تشطيبات وديكورات فاخرة</option>
                    <option value="execution">تنفيذ وتطوير معماري</option>
                    <option value="lighting">إضاءات وديكورات حديثة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">الموقع *</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full border border-border bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">رابط/رفع الصورة *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editImageSrc}
                      onChange={(e) => setEditImageSrc(e.target.value)}
                      className="w-full border border-border bg-paper px-3 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                      required
                    />
                    <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-border text-ink px-3 py-2 text-xs font-semibold whitespace-nowrap inline-flex items-center gap-1.5 rounded-sm">
                      {editUploading ? (
                        <span>جاري...</span>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>تغيير</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, true)} />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setEditingSample(null)}
                    className="border border-border bg-paper px-4 py-2 text-xs font-medium text-muted rounded-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading || editUploading}
                    className="bg-accent text-white px-5 py-2 text-xs font-semibold uppercase tracking-wider disabled:opacity-50 rounded-sm"
                  >
                    {editLoading ? "جاري..." : "حفظ التعديلات"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Samples Grid View */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {samples.map((item) => (
            <div key={item._id.toString()} className="bg-white border border-border overflow-hidden shadow-sm flex flex-col justify-between group rounded-sm">
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <Image
                  src={item.imageSrc}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2">
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 shadow-sm rounded-sm">
                    {item.categoryLabel}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] text-muted flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{item.location}</span>
                  </p>
                  <h4 className="font-serif font-bold text-ink text-base mt-0.5">{item.title}</h4>
                </div>

                <div className="pt-3 border-t border-border flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(item)}
                    className="flex-1 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 py-1.5 text-xs font-medium transition-colors text-center rounded-sm"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(item._id.toString(), item.title)}
                    disabled={deletingId === item._id.toString()}
                    className="flex-1 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 py-1.5 text-xs font-medium transition-colors text-center disabled:opacity-50 rounded-sm"
                  >
                    {deletingId === item._id.toString() ? "حذف..." : "حذف"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
