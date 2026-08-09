"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import FlowingUnderline from "./FlowingUnderline";

interface ShowcaseItem {
  id: string;
  title: string;
  category: "interiors" | "execution" | "lighting";
  categoryLabel: string;
  imageSrc: string;
  location: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: "1",
    title: "تشطيبات فاخرة وتصاميم أسقف حديثة",
    category: "interiors",
    categoryLabel: "تشطيبات وديكورات فاخرة",
    imageSrc: "/img/site-images/IMG-20260809-WA0030.jpg",
    location: "دمنهور - شارع الضغط العالي",
  },
  {
    id: "2",
    title: "تنفيذ وإشراف معماري شامل",
    category: "execution",
    categoryLabel: "تنفيذ وتطوير معماري",
    imageSrc: "/img/site-images/IMG-20260809-WA0031.jpg",
    location: "دمنهور - شارع الضغط العالي",
  },
  {
    id: "3",
    title: "إضاءات مخفية وديكورات مودرن",
    category: "lighting",
    categoryLabel: "إضاءات وديكورات حديثة",
    imageSrc: "/img/site-images/IMG-20260809-WA0032.jpg",
    location: "دمنهور - شارع الضغط العالي",
  },
  {
    id: "4",
    title: "تصميم غرف وصالات فاخرة",
    category: "interiors",
    categoryLabel: "تشطيبات وديكورات فاخرة",
    imageSrc: "/img/site-images/IMG-20260809-WA0033.jpg",
    location: "دمنهور - شارع الضغط العالي",
  },
  {
    id: "5",
    title: "تجهيز مساحات سكنية متكاملة",
    category: "execution",
    categoryLabel: "تنفيذ وتطوير معماري",
    imageSrc: "/img/site-images/IMG-20260809-WA0034.jpg",
    location: "دمنهور - شارع الضغط العالي",
  },
  {
    id: "6",
    title: "لمسات ديكورية راقية وخامات نادرة",
    category: "interiors",
    categoryLabel: "تشطيبات وديكورات فاخرة",
    imageSrc: "/img/site-images/IMG-20260809-WA0035.jpg",
    location: "دمنهور - شارع الضغط العالي",
  },
  {
    id: "7",
    title: "توزيع إضاءة ذكي ومساحات معمارية",
    category: "lighting",
    categoryLabel: "إضاءات وديكورات حديثة",
    imageSrc: "/img/site-images/IMG-20260809-WA0036.jpg",
    location: "دمنهور - شارع الضغط العالي",
  },
  {
    id: "8",
    title: "تشطيبات أجنحة ومجموعات فاخرة",
    category: "interiors",
    categoryLabel: "تشطيبات وديكورات فاخرة",
    imageSrc: "/img/site-images/IMG-20260809-WA0037.jpg",
    location: "دمنهور - شارع الضغط العالي",
  },
  {
    id: "9",
    title: "استغلال مساحات وهندسة تفاصيل",
    category: "execution",
    categoryLabel: "تنفيذ وتطوير معماري",
    imageSrc: "/img/site-images/IMG-20260809-WA0038.jpg",
    location: "دمنهور - شارع الضغط العالي",
  },
];

export default function WorkShowcaseGallery() {
  const [activeTab, setActiveTab] = useState<"all" | "interiors" | "execution" | "lighting">("all");
  const [selectedImage, setSelectedImage] = useState<ShowcaseItem | null>(null);

  const filteredItems = activeTab === "all"
    ? SHOWCASE_ITEMS
    : SHOWCASE_ITEMS.filter((item) => item.category === activeTab);

  const currentIndex = selectedImage
    ? filteredItems.findIndex((item) => item.id === selectedImage.id)
    : -1;

  const handleNext = useCallback(() => {
    if (currentIndex === -1 || filteredItems.length === 0) return;
    const nextIndex = (currentIndex + 1) % filteredItems.length;
    setSelectedImage(filteredItems[nextIndex]);
  }, [currentIndex, filteredItems]);

  const handlePrev = useCallback(() => {
    if (currentIndex === -1 || filteredItems.length === 0) return;
    const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    setSelectedImage(filteredItems[prevIndex]);
  }, [currentIndex, filteredItems]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      if (e.key === "ArrowRight") handlePrev();
      if (e.key === "ArrowLeft") handleNext();
      if (e.key === "Escape") setSelectedImage(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, handleNext, handlePrev]);

  return (
    <section className="border-t border-border bg-paper py-20 px-4 sm:px-6 w-full font-sans">
      <div className="mx-auto max-w-7xl space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent bg-amber-50 px-3 py-1 border border-amber-200 inline-block">
              معرض النماذج الحية والتنفيذ الواقعي
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-ink">
              عينات من أعمالنا الميدانية والتنفيذية
            </h2>
            <FlowingUnderline className="w-48 h-3 text-accent" />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-accent text-white shadow-sm"
                  : "bg-white text-muted hover:text-ink border border-border"
              }`}
            >
              الكل ({SHOWCASE_ITEMS.length})
            </button>
            <button
              onClick={() => setActiveTab("interiors")}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                activeTab === "interiors"
                  ? "bg-accent text-white shadow-sm"
                  : "bg-white text-muted hover:text-ink border border-border"
              }`}
            >
              تشطيبات وديكورات
            </button>
            <button
              onClick={() => setActiveTab("execution")}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                activeTab === "execution"
                  ? "bg-accent text-white shadow-sm"
                  : "bg-white text-muted hover:text-ink border border-border"
              }`}
            >
              تنفيذ وتطوير
            </button>
            <button
              onClick={() => setActiveTab("lighting")}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                activeTab === "lighting"
                  ? "bg-accent text-white shadow-sm"
                  : "bg-white text-muted hover:text-ink border border-border"
              }`}
            >
              إضاءات وحديثة
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group relative bg-white border border-border overflow-hidden cursor-pointer shadow-sm hover:shadow-md hover:border-accent transition-all duration-300"
            >
              <div className="relative h-64 sm:h-72 w-full bg-slate-100 overflow-hidden">
                <Image
                  src={item.imageSrc}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                <div className="absolute top-3 right-3">
                  <span className="bg-amber-500/95 text-slate-950 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 backdrop-blur-md shadow-sm">
                    {item.categoryLabel}
                  </span>
                </div>

                <div className="absolute bottom-4 right-4 left-4 space-y-1 text-white">
                  <p className="text-[11px] text-amber-300 font-medium">
                    📍 {item.location}
                  </p>
                  <h3 className="font-serif text-lg font-medium text-white leading-snug">
                    {item.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Preview with Navigation Arrows */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-white border border-border p-4 sm:p-6 space-y-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-xs font-semibold text-accent uppercase">
                      {selectedImage.categoryLabel}
                    </span>
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-ink">
                      {selectedImage.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted bg-paper px-2.5 py-1 border border-border">
                    {currentIndex + 1} / {filteredItems.length}
                  </span>
                  <button
                    onClick={() => setSelectedImage(null)}
                    aria-label="إغلاق المعاينة"
                    className="border border-border bg-paper hover:bg-slate-100 text-ink text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Main Image Container with Side Navigation Arrows */}
              <div className="relative h-[55vh] sm:h-[65vh] w-full bg-slate-900 overflow-hidden group">
                <Image
                  src={selectedImage.imageSrc}
                  alt={selectedImage.title}
                  fill
                  className="object-contain"
                  priority
                />

                {/* Right Arrow (Next in RTL) */}
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="الصورة التالية"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-slate-950/70 hover:bg-amber-600 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-xl hover:scale-110"
                >
                  <span className="text-xl sm:text-2xl font-bold">›</span>
                </button>

                {/* Left Arrow (Previous in RTL) */}
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="الصورة السابقة"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-slate-950/70 hover:bg-amber-600 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-xl hover:scale-110"
                >
                  <span className="text-xl sm:text-2xl font-bold">‹</span>
                </button>
              </div>

              {/* Modal Footer Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <span>📍 {selectedImage.location}</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-semibold text-ink">تصاميم المهندسة أسماء كراوية</span>
                </div>

                {/* Navigation Buttons for Touch & Mobile */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handlePrev}
                    className="flex-1 sm:flex-none border border-border bg-paper hover:bg-slate-100 text-ink px-4 py-2 text-xs font-semibold transition-colors text-center"
                  >
                    ← الصورة السابقة
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 sm:flex-none bg-accent hover:bg-accent-hover text-white px-4 py-2 text-xs font-semibold transition-colors text-center"
                  >
                    الصورة التالية →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
