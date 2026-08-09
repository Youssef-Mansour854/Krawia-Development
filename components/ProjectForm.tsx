"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { upload } from "@vercel/blob/client";
import { IProject } from "@/models/Project";

interface BlueprintItem {
  name: string;
  pdfUrl: string;
  thumbnailUrl: string;
  category?: string;
}

const BLUEPRINT_PRESETS = ["معماري", "كهرباء", "سباكة", "تكييف", "تصميم 3D"];

interface ProjectFormProps {
  mode: "create" | "edit";
  initialData?: IProject;
}

// Upload file to Vercel Blob with a 60-second timeout
async function uploadFileToBlob(
  file: File | Blob,
  filename: string
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60_000);
  try {
    const blob = await upload(filename, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
      abortSignal: controller.signal,
    });
    return blob.url;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Render Page 1 of PDF file into a scaled canvas thumbnail Blob (max dimension 600px)
async function generatePdfThumbnailBlob(file: File): Promise<Blob> {
  // Dynamically import react-pdf/pdfjs only in browser to avoid Node SSR DOMMatrix errors
  const { pdfjs } = await import("react-pdf");

  if (typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }

  const objectUrl = URL.createObjectURL(file);
  let pdfDoc;
  try {
    const loadingTask = pdfjs.getDocument({ url: objectUrl });
    pdfDoc = await loadingTask.promise;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  const page = await pdfDoc.getPage(1);

  const unscaledViewport = page.getViewport({ scale: 1.0 });

  // Scale down canvas to max 600px wide/high to prevent browser freeze/OOM on huge blueprints
  const TARGET_MAX_DIM = 600;
  const maxDim = Math.max(unscaledViewport.width, unscaledViewport.height);
  const scale = Math.min(TARGET_MAX_DIM / maxDim, 1.0);

  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("فشل إنشاء سياق رسم الـ Canvas في المتصفح");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await page.render({ canvasContext: context, viewport, canvas: canvas as any }).promise;

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("فشل تحويل الرسم إلى صورة Blob"));
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
            `thumb-${Date.now()}-${pdfFile.name.replace(/\.[^/.]+$/, "")}.jpg`
          );
        } catch (thumbErr) {
          const errMessage =
            thumbErr instanceof Error ? thumbErr.message : String(thumbErr);
          const errStack = thumbErr instanceof Error ? thumbErr.stack : "";
          console.error("PDF Thumbnail Generation Error Details:", errMessage, errStack, thumbErr);
          throw new Error(
            `فشل استخراج المعاينة للمخطط (${pdfFile.name}): ${errMessage}`
          );
        }

        const defaultLabel =
          pdfFile.name.replace(/\.[^/.]+$/, "") || "المخطط الهندي";

        newBlueprints.push({
          name: defaultLabel,
          pdfUrl,
          thumbnailUrl,
          category: "معماري",
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

  const updateBlueprintCategory = (index: number, newCategory: string) => {
    setBlueprints((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], category: newCategory };
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
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: { success?: boolean; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        setError(`خطأ في الخادم (${res.status}): ${res.statusText || "لم يتم استلام رد من الخادم"}`);
        setSubmitting(false);
        return;
      }

      if (!res.ok || !data.success) {
        setError(data.error || `خطأ (${res.status}): فشل حفظ بيانات المشروع.`);
        setSubmitting(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`خطأ في الاتصال: ${msg}`);
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
            <div className="relative h-48 w-full max-w-xs sm:w-72 border border-border overflow-hidden bg-slate-100 mt-2">
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
              المستندات والمخططات الفنية (PDF Documents)
            </label>
          </div>
          <p className="text-xs text-muted">
            حدد ملفات PDF. سيتم تلقائياً استخراج الصفحة الأولى كصورة مصغرة للمستند.
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
            <div className="space-y-4 mt-4">
              {blueprints.map((bp, idx) => {
                const currentCategory = bp.category || "معماري";
                const isPreset = BLUEPRINT_PRESETS.includes(currentCategory);
                const selectValue = isPreset ? currentCategory : "أخرى";

                return (
                  <div
                    key={idx}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border border-border bg-paper"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
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

                      <div className="space-y-2 w-full sm:w-auto">
                        <div className="flex flex-wrap items-center gap-3">
                          <div>
                            <label className="block text-[10px] text-muted mb-0.5 font-semibold">
                              اسم المستند:
                            </label>
                            <input
                              type="text"
                              value={bp.name}
                              onChange={(e) => updateBlueprintName(idx, e.target.value)}
                              placeholder="عنوان المستند..."
                              className="border border-border bg-white px-3 py-1.5 text-xs text-ink focus:border-accent focus:outline-none w-full sm:w-52"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-muted mb-0.5 font-semibold">
                              تصنيف المستند:
                            </label>
                            <select
                              value={selectValue}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val !== "أخرى") {
                                  updateBlueprintCategory(idx, val);
                                } else {
                                  updateBlueprintCategory(idx, "");
                                }
                              }}
                              className="border border-border bg-white px-3 py-1.5 text-xs text-ink focus:border-accent focus:outline-none"
                            >
                              <option value="معماري">معماري (Architectural)</option>
                              <option value="كهرباء">كهرباء (Electrical)</option>
                              <option value="سباكة">سباكة (Plumbing)</option>
                              <option value="تكييف">تكييف (HVAC/AC)</option>
                              <option value="تصميم 3D">تصميم 3D (3D Design)</option>
                              <option value="أخرى">أخرى (Other / Custom)</option>
                            </select>
                          </div>

                          {selectValue === "أخرى" && (
                            <div>
                              <label className="block text-[10px] text-muted mb-0.5 font-semibold">
                                التسمية المخصصة:
                              </label>
                              <input
                                type="text"
                                value={bp.category === "أخرى" ? "" : bp.category || ""}
                                onChange={(e) => updateBlueprintCategory(idx, e.target.value)}
                                placeholder="أدخل تصنيف المستند..."
                                className="border border-border bg-white px-3 py-1.5 text-xs text-ink focus:border-accent focus:outline-none w-full sm:w-40"
                              />
                            </div>
                          )}
                        </div>

                        <p className="text-[10px] text-muted truncate max-w-xs" dir="ltr">
                          {bp.pdfUrl}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeBlueprint(idx)}
                      className="border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 text-xs font-medium transition-colors shrink-0"
                    >
                      حذف المستند
                    </button>
                  </div>
                );
              })}
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
