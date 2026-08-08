"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { upload } from "@vercel/blob/client";
import { pdfjs } from "react-pdf";
import { IProject } from "@/models/Project";

// Configure pdfjs worker for PDF thumbnail generation
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface BlueprintItem {
  name: string;
  pdfUrl: string;
  thumbnailUrl: string;
}

interface ProjectFormProps {
  mode: "create" | "edit";
  initialData?: IProject;
}

async function uploadFileToBlob(
  file: File | Blob,
  filename: string
): Promise<string> {
  try {
    const blob = await upload(filename, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
    });
    return blob.url;
  } catch (err) {
    console.warn(
      "[Blob Upload Warning] Falling back to Data URL for dev environment:",
      err
    );
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
}

async function generatePdfThumbnailBlob(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const page = await pdfDoc.getPage(1);

  const viewport = page.getViewport({ scale: 1.0 });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  if (!context) throw new Error("Could not initialize canvas context");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await page.render({ canvasContext: context, viewport, canvas: canvas as any }).promise;

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas conversion to Blob failed"));
      },
      "image/jpeg",
      0.85
    );
  });
}

export default function ProjectForm({ mode, initialData }: ProjectFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [fullDescription, setFullDescription] = useState(
    initialData?.fullDescription || ""
  );
  const [location, setLocation] = useState(initialData?.location || "");
  const [category, setCategory] = useState(
    initialData?.category || "residential"
  );
  const [status, setStatus] = useState(
    initialData?.status || "under-construction"
  );
  const [featured, setFeatured] = useState(initialData?.featured || false);

  // File states
  const [coverImage, setCoverImage] = useState<string>(
    initialData?.coverImage || ""
  );
  const [gallery, setGallery] = useState<string[]>(initialData?.gallery || []);
  const [blueprints, setBlueprints] = useState<BlueprintItem[]>(
    initialData?.blueprints || []
  );

  // Loading & error states
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingBlueprint, setUploadingBlueprint] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Handle Cover Image Upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setError("");

    try {
      const url = await uploadFileToBlob(file, `cover-${Date.now()}-${file.name}`);
      setCoverImage(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "فشل رفع صورة الغلاف."
      );
    } finally {
      setUploadingCover(false);
    }
  };

  // Handle Gallery Images Upload
  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    setError("");

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await uploadFileToBlob(
          file,
          `gallery-${Date.now()}-${i}-${file.name}`
        );
        uploadedUrls.push(url);
      }
      setGallery((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "فشل رفع صور المعرض."
      );
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setGallery((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Handle Blueprint Upload (PDF + Client Canvas Thumbnail Extraction)
  const handleBlueprintUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingBlueprint(true);
    setError("");

    try {
      const newBlueprints: BlueprintItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const pdfFile = files[i];

        // 1. Upload original PDF
        const pdfUrl = await uploadFileToBlob(
          pdfFile,
          `blueprint-${Date.now()}-${pdfFile.name}`
        );

        // 2. Render Page 1 to Canvas & Upload Thumbnail
        let thumbnailUrl = "";
        try {
          const thumbnailBlob = await generatePdfThumbnailBlob(pdfFile);
          thumbnailUrl = await uploadFileToBlob(
            thumbnailBlob,
            `thumb-${Date.now()}-${pdfFile.name}.jpg`
          );
        } catch (thumbErr) {
          console.warn("Failed to generate PDF thumbnail canvas:", thumbErr);
          thumbnailUrl =
            "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80";
        }

        const defaultLabel =
          pdfFile.name.replace(/\.[^/.]+$/, "") || "المخطط المعماري";

        newBlueprints.push({
          name: defaultLabel,
          pdfUrl,
          thumbnailUrl,
        });
      }

      setBlueprints((prev) => [...prev, ...newBlueprints]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "فشل رفع المخطط المعماري (PDF)."
      );
    } finally {
      setUploadingBlueprint(false);
    }
  };

  const updateBlueprintName = (index: number, newName: string) => {
    setBlueprints((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], name: newName };
      return updated;
    });
  };

  const removeBlueprint = (indexToRemove: number) => {
    setBlueprints((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("اسم المشروع مطلوب.");
      return;
    }
    if (!location.trim()) {
      setError("الموقع مطلوب.");
      return;
    }
    if (!description.trim()) {
      setError("الوصف المختصر مطلوب.");
      return;
    }
    if (!coverImage) {
      setError("صورة الغلاف مطلوبة. يرجى رفع صورة الغلاف للمشروع.");
      return;
    }

    setSubmitting(true);

    const payload = {
      title,
      description,
      fullDescription,
      location,
      category,
      status,
      featured,
      coverImage,
      gallery,
      blueprints,
    };

    try {
      const targetUrl =
        mode === "create"
          ? "/api/projects"
          : `/api/projects/${initialData?.slug}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(targetUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "فشل حفظ بيانات المشروع.");
        setSubmitting(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("حدث خطأ غير متوقع في الشبكة أثناء الحفظ.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl font-sans">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Basic Info Section */}
      <div className="bg-white border border-border p-6 space-y-6">
        <h3 className="text-lg font-medium text-ink border-b border-border pb-3">
          معلومات المشروع الأساسية
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink">
              اسم المشروع *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: مشروع برج الأمل السكني"
              className="w-full border border-border bg-paper px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink">
              الموقع (المدينة - الحي) *
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="مثال: الرياض - حي حطين"
              className="w-full border border-border bg-paper px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink">
              التصنيف *
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value as "residential" | "commercial" | "mixed-use"
                )
              }
              className="w-full border border-border bg-paper px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
            >
              <option value="residential">سكني (Residential)</option>
              <option value="commercial">تجاري (Commercial)</option>
              <option value="mixed-use">متعدد الاستخدامات (Mixed-Use)</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink">
              حالة المشروع *
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as "upcoming" | "under-construction" | "completed"
                )
              }
              className="w-full border border-border bg-paper px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
            >
              <option value="under-construction">قيد الإنشاء (Under Construction)</option>
              <option value="completed">مكتمل (Completed)</option>
              <option value="upcoming">قريباً (Upcoming)</option>
            </select>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center space-x-3 space-x-reverse pt-6">
            <input
              type="checkbox"
              id="featured"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 text-accent border-border focus:ring-accent accent-accent"
            />
            <label
              htmlFor="featured"
              className="text-sm font-medium text-ink cursor-pointer"
            >
              تحديد كمشروع مميز (يظهر في قسم المشاريع المميزة الرئيسية)
            </label>
          </div>

          {/* Short Description */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink">
              الوصف المختصر *
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ملخص قصير يظهر في كروت المعرض..."
              className="w-full border border-border bg-paper px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>

          {/* Full Description */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink">
              الوصف التفصيلي الكامل
            </label>
            <textarea
              rows={4}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="تفاصيل المشروع، المفهوم المعماري، والمواصفات الكاملة..."
              className="w-full border border-border bg-paper px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Media Uploads Section */}
      <div className="bg-white border border-border p-6 space-y-6">
        <h3 className="text-lg font-medium text-ink border-b border-border pb-3">
          وسائط وأصول المشروع
        </h3>

        {/* Cover Image Upload */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink">
            صورة الغلاف (Cover Image) *
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              disabled={uploadingCover}
              className="text-xs text-muted file:ml-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-semibold file:bg-paper file:text-ink hover:file:bg-slate-100"
            />
            {uploadingCover && (
              <span className="text-xs text-accent animate-pulse font-medium">
                جاري رفع صورة الغلاف...
              </span>
            )}
          </div>

          {coverImage && (
            <div className="relative h-48 w-72 border border-border overflow-hidden bg-slate-100 mt-2">
              <Image
                src={coverImage}
                alt="معاينة الغلاف"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Gallery Upload */}
        <div className="space-y-3 border-t border-border pt-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink">
            معرض الصور (Gallery Images)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryUpload}
            disabled={uploadingGallery}
            className="text-xs text-muted file:ml-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-semibold file:bg-paper file:text-ink hover:file:bg-slate-100"
          />
          {uploadingGallery && (
            <p className="text-xs text-accent animate-pulse font-medium">
              جاري رفع صور المعرض...
            </p>
          )}

          {gallery.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
              {gallery.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative group h-28 border border-border overflow-hidden bg-slate-100"
                >
                  <Image
                    src={imgUrl}
                    alt={`صورة المعرض ${idx}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute top-1 left-1 bg-red-600 text-white text-[10px] px-2 py-0.5 opacity-90 hover:opacity-100 transition-opacity"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PDF Blueprints Upload */}
        <div className="space-y-3 border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink">
              المخططات الهندسية والمعمارية (PDF Blueprints)
            </label>
          </div>
          <p className="text-xs text-muted">
            حدد ملفات PDF. سيتم تلقائياً استخراج الصفحة الأولى كصورة مصغرة للمخطط.
          </p>

          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleBlueprintUpload}
            disabled={uploadingBlueprint}
            className="text-xs text-muted file:ml-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-semibold file:bg-paper file:text-ink hover:file:bg-slate-100"
          />
          {uploadingBlueprint && (
            <p className="text-xs text-accent animate-pulse font-medium">
              جاري معالجة الـ PDF واستخراج المعاينة...
            </p>
          )}

          {blueprints.length > 0 && (
            <div className="space-y-3 mt-4">
              {blueprints.map((bp, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-border bg-paper"
                >
                  <div className="flex items-center gap-4">
                    {bp.thumbnailUrl ? (
                      <div className="relative w-16 h-16 border border-border overflow-hidden bg-white shrink-0">
                        <Image
                          src={bp.thumbnailUrl}
                          alt={bp.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 border border-border bg-slate-200 flex items-center justify-center text-[10px] text-muted shrink-0">
                        PDF
                      </div>
                    )}

                    <div className="space-y-1">
                      <input
                        type="text"
                        value={bp.name}
                        onChange={(e) => updateBlueprintName(idx, e.target.value)}
                        placeholder="عنوان المخطط..."
                        className="border border-border bg-white px-3 py-1.5 text-xs text-ink focus:border-accent focus:outline-none w-64"
                      />
                      <p className="text-[10px] text-muted truncate max-w-xs" dir="ltr">
                        {bp.pdfUrl}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeBlueprint(idx)}
                    className="border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    حذف المخطط
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end space-x-4 space-x-reverse border-t border-border pt-6">
        <Link
          href="/admin"
          className="border border-border bg-white hover:border-ink px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink transition-colors"
        >
          إلغاء
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="bg-accent hover:bg-accent-hover text-white text-xs font-semibold uppercase tracking-widest px-8 py-3.5 transition-colors disabled:opacity-50"
        >
          {submitting
            ? "جاري الحفظ..."
            : mode === "create"
            ? "إنشاء المشروع"
            : "تحديث بيانات المشروع"}
        </button>
      </div>
    </form>
  );
}
