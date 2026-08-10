"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import FlowingUnderline from "./FlowingUnderline";
import { IProject, IBlueprint } from "@/models/Project";

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

function getCategorySectionTitle(category: string): {
  title: string;
  subtitle: string;
  icon: string;
} {
  switch (category) {
    case "المخططات والمعمار (Plans)":
    case "معماري":
      return {
        title: "1. المخططات والمعمار (Plans)",
        subtitle: "Architectural Plans & Master Blueprints",
        icon: "📐",
      };
    case "التصميم (Design)":
    case "تصميم 3D":
      return {
        title: "2. التصميم (Design)",
        subtitle: "3D Design & Architectural Visualizations",
        icon: "🎨",
      };
    case "الرسومات التنفيذية (Working Drawings)":
      return {
        title: "3. الرسومات التنفيذية (Working Drawings)",
        subtitle: "Working Drawings & Execution Details",
        icon: "🏗️",
      };
    case "مخططات الكهرباء والسباكة (Electrical & Plumbing)":
    case "كهرباء":
    case "سباكة":
      return {
        title: "4. مخططات الكهرباء والسباكة (Electrical & Plumbing)",
        subtitle: "MEP Electrical & Plumbing Layouts",
        icon: "⚡",
      };
    case "ملاحظات واستشارات هندسية (Notes & Recommendations)":
      return {
        title: "5. ملاحظات واستشارات هندسية (Notes & Recommendations)",
        subtitle: "Engineering Notes & Client Recommendations",
        icon: "📝",
      };
    default:
      return {
        title: category,
        subtitle: "Technical Documents & Specifications",
        icon: "📋",
      };
  }
}

export default function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const [selectedBlueprint, setSelectedBlueprint] = useState<IBlueprint | null>(
    null
  );

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
                        <span className="text-2xl">{sectionMeta.icon}</span>
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

                          <div>
                            <h4 className="font-sans text-sm font-semibold text-ink line-clamp-2">
                              {blueprint.name}
                            </h4>
                          </div>

                          <div className="flex items-center gap-3 pt-2 border-t border-border">
                            <button
                              onClick={() => setSelectedBlueprint(blueprint)}
                              className="flex-1 bg-accent text-white text-xs font-semibold uppercase tracking-wider py-2 text-center hover:bg-accent-hover transition-colors"
                            >
                              عرض المستند PDF
                            </button>
                            <a
                              href={blueprint.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="border border-border bg-white text-ink text-xs font-semibold uppercase tracking-wider py-2 px-3 hover:border-ink transition-colors"
                            >
                              تحميل
                            </a>
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
