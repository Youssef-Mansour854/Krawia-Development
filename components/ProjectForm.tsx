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
  note?: string;
}

const BLUEPRINT_PRESETS = [
  "المخططات والمعمار (Plans)",
  "التصميم (Design)",
  "الرسومات التنفيذية (Working Drawings)",
  "مخططات الكهرباء والسباكة (Electrical & Plumbing)",
  "ملاحظات واستشارات هندسية (Notes & Recommendations)",
];

const BLUEPRINT_WINDOWS = [
  {
    key: "المخططات والمعمار (Plans)",
    title: "1. المخططات والمعمار (Plans)",
    subtitle: "مخططات المساقط الأفقية، الواجهات، والقطاعات المعمارية",
    icon: "📐",
  },
  {
    key: "التصميم (Design)",
    title: "2. التصميم (Design)",
    subtitle: "التصاميم ثلاثية الأبعاد 3D والديكورات الداخلية",
    icon: "🎨",
  },
  {
    key: "الرسومات التنفيذية (Working Drawings)",
    title: "3. الرسومات التنفيذية (Working Drawings)",
    subtitle: "مخططات تفاصيل التنفيذ والأسقف وشوب دروينج الموقع",
    icon: "🏗️",
  },
  {
    key: "مخططات الكهرباء والسباكة (Electrical & Plumbing)",
    title: "4. مخططات الكهرباء والسباكة (Electrical & Plumbing)",
    subtitle: "مخططات التغذية والصرف، الكهرباء والإنارة والتكييف",
    icon: "⚡",
  },
  {
    key: "ملاحظات واستشارات هندسية (Notes & Recommendations)",
    title: "5. ملاحظات واستشارات هندسية (Notes & Recommendations)",
    subtitle: "الملاحظات الفنية، شروط التنفيذ والتوصيات الهندسية",
    icon: "📝",
  },
];

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

  // Custom category windows added dynamically by user
  const [customWindows, setCustomWindows] = useState<
    { key: string; title: string; subtitle: string; icon: string; isPreset?: boolean }[]
  >(() => {
    if (!initialData?.blueprints) return [];
    const presetKeys = new Set(BLUEPRINT_WINDOWS.map((w) => w.key));
    const existingCustomKeys = new Set<string>();
    initialData.blueprints.forEach((bp) => {
      if (bp.category && !presetKeys.has(bp.category)) {
        existingCustomKeys.add(bp.category);
      }
    });
    return Array.from(existingCustomKeys).map((catName) => ({
      key: catName,
      title: catName,
      subtitle: "قسم / تصنيف مستندات مخصص",
      icon: "📁",
      isPreset: false,
    }));
  });

  const [newWindowName, setNewWindowName] = useState("");
  const [showAddWindowForm, setShowAddWindowForm] = useState(false);

  const handleAddCustomWindow = () => {
    const trimmed = newWindowName.trim();
    if (!trimmed) return;

    const allExistingKeys = [
      ...BLUEPRINT_WINDOWS.map((w) => w.key),
      ...customWindows.map((w) => w.key),
    ];

    if (allExistingKeys.includes(trimmed)) {
      setError("هذه النافذة / التصنيف موجودة بالفعل.");
      return;
    }

    let formattedTitle = trimmed;
    const totalCount = BLUEPRINT_WINDOWS.length + customWindows.length + 1;
    if (!/^\d+\./.test(trimmed)) {
      formattedTitle = `${totalCount}. ${trimmed}`;
    }

    const newWindowObj = {
      key: formattedTitle,
      title: formattedTitle,
      subtitle: "قسم / تصنيف مستندات مخصص",
      icon: "📁",
      isPreset: false,
    };

    setCustomWindows((prev) => [...prev, newWindowObj]);
    setNewWindowName("");
    setShowAddWindowForm(false);
    setError("");
  };

  const handleRemoveCustomWindow = (keyToRemove: string) => {
    setCustomWindows((prev) => prev.filter((w) => w.key !== keyToRemove));
    setBlueprints((prev) => prev.filter((bp) => bp.category !== keyToRemove));
  };

  // Loading & error states
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingBlueprint, setUploadingBlueprint] = useState(false);
  const [uploadingWindowCategory, setUploadingWindowCategory] = useState<string | null>(null);
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

  // Handle Blueprint Upload for a specific category window
  const handleBlueprintUploadForCategory = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetCategory: string
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingBlueprint(true);
    setUploadingWindowCategory(targetCategory);
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
          console.error("PDF Thumbnail Generation Error Details:", errMessage, thumbErr);
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
          category: targetCategory,
          note: "",
        });
      }

      setBlueprints((prev) => [...prev, ...newBlueprints]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "فشل رفع المخطط المعماري (PDF)."
      );
    } finally {
      setUploadingBlueprint(false);
      setUploadingWindowCategory(null);
      e.target.value = "";
    }
  };

  const updateBlueprintName = (index: number, newName: string) => {
    setBlueprints((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], name: newName };
      return updated;
    });
  };

  const updateBlueprintNote = (index: number, newNote: string) => {
    setBlueprints((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], note: newNote };
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

        {/* PDF Blueprints Upload - Section Title */}
        <div className="space-y-6 border-t-2 border-accent/40 pt-8">
          <div className="bg-slate-900 text-white p-5 sm:p-6 border-r-4 border-amber-500 rounded-sm">
            <span className="text-amber-400 text-[11px] font-bold uppercase tracking-widest block mb-1">
              أرشيف وتصنيفات المخططات الهندسية (PDF DOCUMENTS)
            </span>
            <h3 className="font-serif text-2xl font-medium text-white">
              المستندات والمخططات الفنية للمشروع
            </h3>
            <p className="text-xs text-slate-300 font-normal mt-1 leading-relaxed">
              تم تقسيم رفع المستندات إلى نوافذ مخصصة (Windows). قم برفع ملفات PDF مباشرة في النافذة المناسبة أو قم بإنشاء نوافذ وتصنيفات جديدة حسب الحاجة.
            </p>
          </div>

          {/* Render All Upload Windows (Presets + Custom) */}
          <div className="space-y-6">
            {[...BLUEPRINT_WINDOWS, ...customWindows].map((win) => {
              const isCustomWin = customWindows.some((c) => c.key === win.key);
              // Filter blueprints belonging to this category window
              const windowBlueprints = blueprints
                .map((bp, originalIndex) => ({ bp, originalIndex }))
                .filter(
                  ({ bp }) =>
                    (bp.category || "المخططات والمعمار (Plans)") === win.key
                );

              const isUploadingThisWindow =
                uploadingBlueprint && uploadingWindowCategory === win.key;

              return (
                <div
                  key={win.key}
                  className="border border-border bg-white p-5 sm:p-6 space-y-4 shadow-xs hover:border-amber-400 transition-colors"
                >
                  {/* Window Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{win.icon}</span>
                      <div>
                        <h4 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
                          <span>{win.title}</span>
                          {isCustomWin && (
                            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-xs font-sans">
                              نافذة مخصصة
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-muted font-normal">
                          {win.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <span className="text-xs font-semibold bg-amber-50 text-accent border border-amber-200 px-3 py-1">
                        {windowBlueprints.length}{" "}
                        {windowBlueprints.length === 1
                          ? "مستند مرفوع"
                          : "مستندات مرفوعة"}
                      </span>

                      {isCustomWin && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomWindow(win.key)}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 bg-red-50 hover:bg-red-100 px-2.5 py-1 transition-colors"
                          title="حذف هذه النافذة بجميع مستنداتها"
                        >
                          🗑️ حذف النافذة
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Window Upload File Input Button */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-paper p-3 border border-dashed border-border hover:border-accent transition-colors">
                    <label className="cursor-pointer inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2.5 uppercase tracking-wider transition-colors shrink-0 shadow-xs">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span>رفع مستند PDF في هذه النافذة</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        multiple
                        onChange={(e) =>
                          handleBlueprintUploadForCategory(e, win.key)
                        }
                        disabled={uploadingBlueprint}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-muted">
                      انقر هنا لاختيار ملفات PDF المخصصة لقسم ({win.title})
                    </span>
                  </div>

                  {/* Per-Window Loading Progress Indicator */}
                  {isUploadingThisWindow && (
                    <div className="bg-amber-50 border border-amber-300 p-3 text-xs font-semibold text-amber-900 animate-pulse flex items-center gap-2 rounded-xs">
                      <svg className="w-4 h-4 text-amber-600 animate-spin shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>جاري معالجة ورفع المستند واستخراج المعاينة لهذه النافذة ({win.title})...</span>
                    </div>
                  )}

                  {/* List of Uploaded Documents in this Window */}
                  {windowBlueprints.length > 0 ? (
                    <div className="space-y-4 pt-2">
                      {windowBlueprints.map(({ bp, originalIndex }) => (
                        <div
                          key={originalIndex}
                          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border border-border bg-slate-50"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto flex-1">
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
                              <div className="w-16 h-16 border border-border bg-slate-200 flex items-center justify-center text-[10px] text-muted shrink-0 font-bold">
                                PDF
                              </div>
                            )}

                            <div className="space-y-2 w-full flex-1">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] text-muted mb-0.5 font-semibold">
                                    اسم المستند:
                                  </label>
                                  <input
                                    type="text"
                                    value={bp.name}
                                    onChange={(e) =>
                                      updateBlueprintName(
                                        originalIndex,
                                        e.target.value
                                      )
                                    }
                                    placeholder="عنوان المستند..."
                                    className="border border-border bg-white px-3 py-1.5 text-xs text-ink focus:border-accent focus:outline-none w-full font-semibold"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] text-muted mb-0.5 font-semibold">
                                    ملاحظات / استشارة فنية (اختياري):
                                  </label>
                                  <input
                                    type="text"
                                    value={bp.note || ""}
                                    onChange={(e) =>
                                      updateBlueprintNote(
                                        originalIndex,
                                        e.target.value
                                      )
                                    }
                                    placeholder="أضف ملاحظة (مثال: نسخة معدلة، الدور الأول)..."
                                    className="border border-border bg-white px-3 py-1.5 text-xs text-ink focus:border-accent focus:outline-none w-full font-normal"
                                  />
                                </div>
                              </div>

                              <p
                                className="text-[10px] text-muted truncate max-w-sm"
                                dir="ltr"
                              >
                                {bp.pdfUrl}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeBlueprint(originalIndex)}
                            className="border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 text-xs font-medium transition-colors shrink-0 self-end md:self-auto"
                          >
                            حذف المستند
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted italic py-1">
                      لا يوجد مستندات مرفوعة في هذه النافذة حتى الآن.
                    </p>
                  )}
                </div>
              );
            })}

            {/* Button / Form to Add New Custom Category Window */}
            <div className="bg-slate-50 border-2 border-dashed border-amber-300 p-5 rounded-sm">
              {!showAddWindowForm ? (
                <button
                  type="button"
                  onClick={() => setShowAddWindowForm(true)}
                  className="w-full py-3.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 hover:border-amber-500 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs rounded-xs"
                >
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>إضافة نافذة / تصنيف مستندات جديد (+ Add New Category Window)</span>
                </button>
              ) : (
                <div className="space-y-4 bg-white p-5 border border-amber-400 shadow-sm">
                  <div>
                    <h4 className="font-serif font-bold text-ink text-base">
                      إضافة نافذة مستندات جديدة
                    </h4>
                    <p className="text-xs text-muted mt-0.5">
                      أدخل اسم النافذة أو التصنيف الجديد (مثال: 6. تقارير الفحص والتربة، أو تقارير السلامة والبيئة)
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={newWindowName}
                      onChange={(e) => setNewWindowName(e.target.value)}
                      placeholder="عنوان النافذة / التصنيف الجديد..."
                      className="flex-1 border border-border bg-paper px-4 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomWindow();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomWindow}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-6 py-2.5 uppercase transition-colors shrink-0 shadow-xs"
                    >
                      حفظ وإضافة النافذة
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddWindowForm(false);
                        setNewWindowName("");
                      }}
                      className="border border-border text-ink bg-white hover:bg-slate-100 text-xs font-bold px-4 py-2.5 uppercase transition-colors shrink-0"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-4 border-t border-border pt-6">
        <Link
          href="/admin"
          className="border border-border bg-white hover:bg-slate-100 text-ink text-xs font-bold uppercase tracking-wider px-6 py-3.5 transition-colors rounded-sm cursor-pointer shadow-xs"
        >
          إلغاء
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 transition-all shadow-md hover:shadow-lg rounded-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          {submitting ? (
            <>
              <svg className="w-4 h-4 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>جاري الحفظ...</span>
            </>
          ) : mode === "create" ? (
            <span>إنشاء المشروع</span>
          ) : (
            <span>تحديث بيانات المشروع</span>
          )}
        </button>
      </div>
    </form>
  );
}
