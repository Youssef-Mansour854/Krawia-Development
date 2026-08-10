"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure worker URL matching installed react-pdf / pdfjs-dist
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

interface PdfViewerProps {
  pdfUrl: string;
  title: string;
  onClose: () => void;
}

interface PageDimensions {
  originalWidth: number;
  originalHeight: number;
}

export default function PdfViewer({ pdfUrl, title, onClose }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Container dimensions
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 600,
    height: 500,
  });

  // Page native dimensions for aspect-ratio auto-fitting
  const [pageDimensions, setPageDimensions] = useState<PageDimensions | null>(
    null
  );

  // Zoom level multiplier (1.0 = 100% Fit to View)
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Lock body background scroll when PDF viewer modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Measure container dimensions dynamically with ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      const paddingX = window.innerWidth < 640 ? 8 : 24;
      const paddingY = window.innerWidth < 640 ? 8 : 24;
      setContainerSize({
        width: Math.max(rect.width - paddingX, 260),
        height: Math.max(rect.height - paddingY, 260),
      });
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(el);

    return () => resizeObserver.disconnect();
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onPageLoadSuccess(page: {
    originalWidth: number;
    originalHeight: number;
  }) {
    setPageDimensions({
      originalWidth: page.originalWidth,
      originalHeight: page.originalHeight,
    });
  }

  // Calculate base scale to fit page inside container bounds
  const calculateRenderScale = useCallback(() => {
    if (!pageDimensions) return 1.0;

    const { originalWidth, originalHeight } = pageDimensions;
    const { width: availWidth, height: availHeight } = containerSize;

    const scaleW = availWidth / originalWidth;
    const scaleH = availHeight / originalHeight;

    // On mobile devices, prioritize width fit so text & blueprints are readable
    const isMobile = window.innerWidth < 640;
    const fittedScale = isMobile ? scaleW : Math.min(scaleW, scaleH);

    return Math.max(fittedScale, 0.15);
  }, [pageDimensions, containerSize]);

  const baseScale = calculateRenderScale();
  const effectiveScale = baseScale * zoomLevel;

  // Zoom Handlers
  const handleZoomIn = () =>
    setZoomLevel((prev) => Math.min(prev + 0.25, 3.5));
  const handleZoomOut = () =>
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.4));
  const handleResetZoom = () => setZoomLevel(1.0);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        setPageNumber((prev) => Math.max(prev - 1, 1));
      } else if (e.key === "ArrowRight") {
        setPageNumber((prev) =>
          numPages ? Math.min(prev + 1, numPages) : prev
        );
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      } else if (e.key === "0") {
        handleResetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [numPages, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-0 sm:p-4 md:p-6 font-sans"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="relative flex flex-col w-full max-w-6xl h-full sm:h-[92vh] bg-paper border-0 sm:border sm:border-border rounded-none sm:rounded-md shadow-2xl overflow-hidden text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border bg-white px-3 sm:px-6 py-2.5 sm:py-3.5 gap-2 shrink-0">
          <div className="flex-1 min-w-0 pr-1">
            <span className="hidden sm:inline-block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-accent bg-amber-50 px-2 py-0.5 border border-amber-200 rounded-sm mb-0.5">
              مستعرض المستندات والرسومات الهندسية
            </span>
            <h3 className="text-xs sm:text-base font-bold text-ink truncate leading-tight">
              {title}
            </h3>
          </div>

          {/* Controls Right Section */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-paper border border-border px-1.5 sm:px-2.5 py-1 text-xs font-medium rounded-sm">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.4}
                className="px-1.5 py-0.5 text-muted hover:text-ink disabled:opacity-30 transition-colors font-bold text-sm"
                title="تصغير (-)"
              >
                −
              </button>
              <span className="w-9 sm:w-12 text-center text-ink font-bold text-[11px] sm:text-xs">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3.5}
                className="px-1.5 py-0.5 text-muted hover:text-ink disabled:opacity-30 transition-colors font-bold text-sm"
                title="تكبير (+)"
              >
                +
              </button>
              {zoomLevel !== 1.0 && (
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="hidden sm:inline-block ml-1 text-[10px] text-accent uppercase font-bold hover:underline"
                  title="إعادة التكبير لملاءمة الشاشة"
                >
                  ملاءمة
                </button>
              )}
            </div>

            {/* Direct Download Button */}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1.5 text-xs font-bold transition-colors flex items-center gap-1 rounded-sm shrink-0"
              title="تحميل مستند الـ PDF الأصلي"
            >
              <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">تحميل PDF</span>
            </a>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-500 hover:text-red-600 transition-colors rounded-full hover:bg-red-50 border border-transparent hover:border-red-200"
              aria-label="إغلاق المستعرض"
              title="إغلاق (Esc)"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* PDF Scrollable Body Container */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto p-1.5 sm:p-4 flex items-center justify-center bg-slate-100/80 min-h-0 touch-pan-x touch-pan-y"
        >
          {loading && (
            <div className="flex flex-col items-center justify-center space-y-3 py-16">
              <div className="w-9 h-9 border-3 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-xs sm:text-sm text-muted font-medium">
                جاري فتح واستعراض مخطط الـ PDF...
              </p>
            </div>
          )}

          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(err) => console.error("PDF Load Error:", err)}
            loading={null}
            className="flex justify-center items-center my-auto"
          >
            <Page
              pageNumber={pageNumber}
              onLoadSuccess={onPageLoadSuccess}
              scale={effectiveScale}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              className="shadow-xl border border-border bg-white transition-all duration-150 max-w-none my-2"
            />
          </Document>
        </div>

        {/* Footer Navigation Bar */}
        {numPages && (
          <div className="flex items-center justify-between gap-2 border-t border-border bg-white px-3 sm:px-6 py-2 sm:py-3 shrink-0">
            <button
              type="button"
              onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
              disabled={pageNumber <= 1}
              className="border border-border bg-white px-2.5 sm:px-4 py-1.5 text-[11px] sm:text-xs font-bold text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:border-accent hover:bg-amber-50 transition-colors rounded-sm flex items-center gap-1"
            >
              <span>←</span>
              <span className="hidden sm:inline">الصفحة السابقة</span>
            </button>

            <span className="text-[11px] sm:text-xs font-semibold text-muted text-center">
              صفحة <strong className="text-ink font-bold">{pageNumber}</strong> من{" "}
              <strong className="text-ink font-bold">{numPages}</strong>
            </span>

            <button
              type="button"
              onClick={() =>
                setPageNumber((prev) => Math.min(prev + 1, numPages))
              }
              disabled={pageNumber >= numPages}
              className="border border-border bg-white px-2.5 sm:px-4 py-1.5 text-[11px] sm:text-xs font-bold text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:border-accent hover:bg-amber-50 transition-colors rounded-sm flex items-center gap-1"
            >
              <span className="hidden sm:inline">الصفحة التالية</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
