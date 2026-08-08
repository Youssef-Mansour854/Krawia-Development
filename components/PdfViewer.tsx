"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure worker URL matching installed react-pdf / pdfjs-dist
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

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
    width: 800,
    height: 600,
  });

  // Page native dimensions for aspect-ratio auto-fitting
  const [pageDimensions, setPageDimensions] = useState<PageDimensions | null>(
    null
  );

  // Zoom level multiplier (1.0 = 100% Fit to View)
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Measure container dimensions dynamically with ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize({
        width: Math.max(rect.width - 32, 280),
        height: Math.max(rect.height - 32, 280),
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

    // Fit to whichever dimension is the binding constraint
    const fittedScale = Math.min(scaleW, scaleH);
    return Math.max(fittedScale, 0.15);
  }, [pageDimensions, containerSize]);

  const baseScale = calculateRenderScale();
  const effectiveScale = baseScale * zoomLevel;

  // Zoom Handlers
  const handleZoomIn = () =>
    setZoomLevel((prev) => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () =>
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-5xl h-[90vh] bg-paper border border-border rounded-none shadow-2xl overflow-hidden text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-border bg-white px-6 py-4 gap-4 shrink-0">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              مستعرض المخططات المعمارية
            </span>
            <h3 className="font-sans text-lg font-medium text-ink line-clamp-1">
              {title}
            </h3>
          </div>

          {/* Controls Right Section */}
          <div className="flex items-center gap-4">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-paper border border-border px-2.5 py-1 text-xs font-medium">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                className="px-2 py-0.5 text-muted hover:text-ink disabled:opacity-30 transition-colors font-bold text-sm"
                title="تصغير (-)"
              >
                −
              </button>
              <span className="w-12 text-center text-ink font-semibold">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3.0}
                className="px-2 py-0.5 text-muted hover:text-ink disabled:opacity-30 transition-colors font-bold text-sm"
                title="تكبير (+)"
              >
                +
              </button>
              {zoomLevel !== 1.0 && (
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="ml-1 text-[10px] text-accent uppercase font-semibold hover:underline"
                  title="إعادة التكبير لملاءمة الشاشة"
                >
                  ملاءمة
                </button>
              )}
            </div>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-muted hover:text-ink transition-colors rounded-full hover:bg-slate-100"
              aria-label="إغلاق المستعرض"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* PDF Scrollable Body Container */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-slate-100/60 min-h-0"
        >
          {loading && (
            <div className="flex flex-col items-center justify-center space-y-3 py-12">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted">
                جاري تحميل واستعراض المخطط المعماري...
              </p>
            </div>
          )}

          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(err) => console.error("PDF Load Error:", err)}
            loading={null}
            className="flex justify-center items-center"
          >
            <Page
              pageNumber={pageNumber}
              onLoadSuccess={onPageLoadSuccess}
              scale={effectiveScale}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              className="shadow-lg border border-border bg-white transition-all duration-150 max-w-none"
            />
          </Document>
        </div>

        {/* Footer Navigation Bar */}
        {numPages && (
          <div className="flex items-center justify-between border-t border-border bg-white px-6 py-3 shrink-0">
            <button
              type="button"
              onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
              disabled={pageNumber <= 1}
              className="border border-border bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:border-accent transition-colors"
            >
              ← الصفحة السابقة
            </button>

            <span className="text-xs font-medium text-muted">
              صفحة <strong className="text-ink">{pageNumber}</strong> من{" "}
              <strong className="text-ink">{numPages}</strong>
            </span>

            <button
              type="button"
              onClick={() =>
                setPageNumber((prev) => Math.min(prev + 1, numPages))
              }
              disabled={pageNumber >= numPages}
              className="border border-border bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:border-accent transition-colors"
            >
              الصفحة التالية →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
