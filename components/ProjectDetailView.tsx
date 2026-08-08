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

export default function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const [selectedBlueprint, setSelectedBlueprint] = useState<IBlueprint | null>(
    null
  );

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

        {/* Blueprints PDF Section */}
        {project.blueprints && project.blueprints.length > 0 && (
          <section className="space-y-8 border-t border-border pt-16">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                المخططات والتصاميم الهندسية
              </span>
              <h2 className="font-serif text-3xl font-medium text-ink">
                المخططات المعمارية (PDF)
              </h2>
              <FlowingUnderline className="w-40 h-3 text-accent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {project.blueprints.map((blueprint, idx) => (
                <div
                  key={idx}
                  className="border border-border bg-white p-5 flex flex-col justify-between space-y-4 hover:border-accent transition-colors shadow-sm"
                >
                  <div
                    className="relative h-48 w-full bg-slate-100 border border-border overflow-hidden cursor-pointer group"
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
                        عرض المخطط الهندسي
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-sans text-base font-semibold text-ink">
                      {blueprint.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    <button
                      onClick={() => setSelectedBlueprint(blueprint)}
                      className="flex-1 bg-accent text-white text-xs font-semibold uppercase tracking-wider py-2.5 text-center hover:bg-accent-hover transition-colors"
                    >
                      عرض المخطط PDF
                    </button>
                    <a
                      href={blueprint.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-border text-ink text-xs font-semibold uppercase tracking-wider py-2.5 px-3 hover:border-ink transition-colors"
                    >
                      تحميل
                    </a>
                  </div>
                </div>
              ))}
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
