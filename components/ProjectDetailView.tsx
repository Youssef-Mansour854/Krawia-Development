"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import FlowingUnderline from "./FlowingUnderline";
import { IProject, IBlueprint } from "@/models/Project";
import { downloadPdfFile } from "@/lib/download";

const PdfViewer = dynamic(() => import("./PdfViewer"), {
  ssr: false,
});

interface ProjectDetailViewProps {
  project: IProject;
}

function getCategoryLabel(category: string): string {
  switch (category?.toLowerCase()) {
    case "residential":
      return "سكني";
    case "commercial":
      return "تجاري";
    case "mixed-use":
      return "متعدد الاستخدامات";
    default:
      return category;
  }
}

function getStatusLabel(status: string): string {
  switch (status?.toLowerCase()) {
    case "under-construction":
      return "قيد الإنشاء";
    case "completed":
      return "مكتمل";
    case "upcoming":
      return "قريباً";
    default:
      return status;
  }
}

function CategoryVectorIcon({ iconKey }: { iconKey: string }) {
  const key = iconKey?.toLowerCase() || "";

  if (key.includes("plans") || key.includes("المخططات والمعمار") || key.includes("معماري")) {
    return (
      <div className="w-10 h-10 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0l-3-3m3 3l3-3m-6 3h6" />
        </svg>
      </div>
    );
  }

  if (key.includes("design") || key.includes("التصميم") || key.includes("3d")) {
    return (
      <div className="w-10 h-10 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  if (key.includes("working drawings") || key.includes("الرسومات التنفيذية")) {
    return (
      <div className="w-10 h-10 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0H3m2 0h4m10 0v-4a1 1 0 00-1-1h-2a1 1 0 00-1 1v4M9 7h1m-1 4h1m4-4h1m-1 4h1" />
        </svg>
      </div>
    );
  }

  if (key.includes("electrical") || key.includes("الكهرباء") || key.includes("سباكة")) {
    return (
      <div className="w-10 h-10 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
    );
  }

  if (key.includes("notes") || key.includes("ملاحظات") || key.includes("استشارات")) {
    return (
      <div className="w-10 h-10 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    </div>
  );
}

function getCategorySectionTitle(category: string): {
  title: string;
  subtitle: string;
} {
  switch (category) {
    case "المخططات والمعمار (Plans)":
    case "معماري":
      return {
        title: "المخططات والمعمار (Plans)",
        subtitle: "Architectural Plans & Master Blueprints",
      };
    case "التصميم (Design)":
    case "تصميم 3D":
      return {
        title: "التصميم (Design)",
        subtitle: "3D Design & Architectural Visualizations",
      };
    case "الرسومات التنفيذية (Working Drawings)":
      return {
        title: "الرسومات التنفيذية (Working Drawings)",
        subtitle: "Working Drawings & Execution Details",
      };
    case "مخططات الكهرباء والسباكة (Electrical & Plumbing)":
    case "كهرباء":
    case "سباكة":
      return {
        title: "مخططات الكهرباء والسباكة (Electrical & Plumbing)",
        subtitle: "MEP Electrical & Plumbing Layouts",
      };
    case "ملاحظات واستشارات هندسية (Notes & Recommendations)":
      return {
        title: "ملاحظات واستشارات هندسية (Notes & Recommendations)",
        subtitle: "Engineering Notes & Client Recommendations",
      };
    default:
      return {
        title: category,
        subtitle: "Technical Documents & Specifications",
      };
  }
}

export default function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const [selectedBlueprint, setSelectedBlueprint] = useState<IBlueprint | null>(
    null
  );

  // Force scroll position to the top of the page when opening project details
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [project?._id]);

  // Group blueprints by category
  const groupedBlueprints = (project.blueprints || []).reduce((acc, bp) => {
    const cat = bp.category || "أخرى";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(bp);
    return acc;
  }, {} as Record<string, IBlueprint[]>);

  const PRESET_ORDER = [
    "المخططات والمعمار (Plans)",
    "معماري",
    "التصميم (Design)",
    "تصميم 3D",
    "الرسومات التنفيذية (Working Drawings)",
    "مخططات الكهرباء والسباكة (Electrical & Plumbing)",
    "كهرباء",
    "سباكة",
    "ملاحظات واستشارات هندسية (Notes & Recommendations)",
  ];
  const sortedCategories = Object.keys(groupedBlueprints).sort((a, b) => {
    const idxA = PRESET_ORDER.indexOf(a);
    const idxB = PRESET_ORDER.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b, "ar");
  });

  return (
    <main className="min-h-screen bg-paper text-ink pb-24 font-sans">
      {/* Top Banner / Hero Cover Image */}
      <div className="relative h-[50vh] min-h-[350px] max-h-[550px] w-full bg-slate-900 overflow-hidden">
        <Image
          src={project.coverImage}
          alt={project.title}
          fill
          priority
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        <div className="absolute top-6 right-6 z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-none border border-white/20 bg-slate-950/60 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md hover:bg-slate-950 transition-colors"
          >
            ← العودة لمعرض المشاريع
          </Link>
        </div>

        <div className="absolute bottom-10 right-6 left-6 z-10 mx-auto max-w-7xl">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wider px-3 py-1">
              {getCategoryLabel(project.category)}
            </span>
            <span className="bg-white/90 text-slate-950 text-xs font-bold uppercase tracking-wider px-3 py-1 backdrop-blur-md">
              {getStatusLabel(project.status)}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium text-white tracking-tight leading-tight">
            {project.title}
          </h1>
          <p className="text-sm font-medium tracking-wide text-slate-300 uppercase mt-2">
            📍 {project.location}
          </p>
        </div>
      </div>

      {/* Main Content Area — Unified Single Shared Max-Width Container */}
      <div className="mx-auto max-w-7xl px-6 py-16 space-y-20">
        {/* Project Description */}
        <section className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              نظرة عامة على المشروع
            </span>
            <h2 className="font-serif text-3xl font-medium text-ink">
              المفهوم والمعمار التفصيلي
            </h2>
            <FlowingUnderline className="w-36 h-3 text-accent" />
          </div>

          <p className="text-base sm:text-lg text-ink font-normal leading-relaxed whitespace-pre-line">
            {project.fullDescription || project.description}
          </p>
        </section>

        {/* Gallery Section */}
        {project.gallery && project.gallery.length > 0 && (
          <section className="space-y-8 border-t border-border pt-16">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                انطباعات بصرية
              </span>
              <h2 className="font-serif text-3xl font-medium text-ink">
                معرض الصور المعمارية
              </h2>
              <FlowingUnderline className="w-36 h-3 text-accent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.gallery.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative h-72 w-full bg-slate-100 border border-border overflow-hidden group"
                >
                  <Image
                    src={imgUrl}
                    alt={`${project.title} معرض ${idx + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Blueprints & Documents PDF Section Grouped into Dedicated Sub-Sections */}
        {sortedCategories.length > 0 && (
          <section className="space-y-12 border-t border-border pt-16">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                المستندات والرسومات الهندسية للمشروع
              </span>
              <h2 className="font-serif text-3xl font-medium text-ink">
                المخططات والملفات الفنية (PDF)
              </h2>
              <FlowingUnderline className="w-44 h-3 text-accent" />
            </div>

            <div className="space-y-10">
              {sortedCategories.map((catKey) => {
                const blueprintsList = groupedBlueprints[catKey];
                const sectionMeta = getCategorySectionTitle(catKey);

                return (
                  <div
                    key={catKey}
                    className="bg-white border border-border p-6 md:p-8 space-y-6 shadow-sm"
                  >
                    {/* Sub-Section Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                      <div className="flex items-center gap-3">
                        <CategoryVectorIcon iconKey={catKey} />
                        <div>
                          <h3 className="font-serif text-xl font-semibold text-ink">
                            {sectionMeta.title}
                          </h3>
                          <p className="text-[11px] text-muted font-mono tracking-wider uppercase">
                            {sectionMeta.subtitle}
                          </p>
                        </div>
                      </div>

                      <span className="bg-amber-50 text-accent font-bold text-xs px-3.5 py-1 border border-amber-200">
                        {blueprintsList.length}{" "}
                        {blueprintsList.length === 1 ? "مستند" : "مستندات"}
                      </span>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {blueprintsList.map((blueprint, idx) => (
                        <div
                          key={idx}
                          className="border border-border bg-paper p-4 flex flex-col justify-between space-y-4 hover:border-accent transition-colors"
                        >
                          <div
                            className="relative h-44 w-full bg-slate-100 border border-border overflow-hidden cursor-pointer group"
                            onClick={() => setSelectedBlueprint(blueprint)}
                          >
                            <Image
                              src={blueprint.thumbnailUrl}
                              alt={blueprint.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="bg-accent text-white text-xs uppercase tracking-wider font-semibold px-4 py-2 shadow-md">
                                عرض المستند
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-sans text-sm font-semibold text-ink line-clamp-2">
                              {blueprint.name}
                            </h4>
                            {blueprint.note && (
                              <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xs leading-relaxed font-normal flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-amber-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span><span className="font-semibold">ملاحظة:</span> {blueprint.note}</span>
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 pt-2 border-t border-border">
                            <button
                              onClick={() => setSelectedBlueprint(blueprint)}
                              className="flex-1 bg-accent text-white text-xs font-semibold uppercase tracking-wider py-2 text-center hover:bg-accent-hover transition-colors"
                            >
                              عرض المستند PDF
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadPdfFile(blueprint.pdfUrl, blueprint.name)}
                              className="border border-border bg-white text-ink text-xs font-semibold uppercase tracking-wider py-2 px-3 hover:border-ink transition-colors cursor-pointer"
                              title="تحميل المستند مباشرة لحاسوبك أو هاتفك"
                            >
                              تحميل
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* PDF Viewer Overlay Modal */}
      {selectedBlueprint && (
        <PdfViewer
          pdfUrl={selectedBlueprint.pdfUrl}
          title={selectedBlueprint.name}
          onClose={() => setSelectedBlueprint(null)}
        />
      )}
    </main>
  );
}
