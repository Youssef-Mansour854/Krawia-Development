"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { IProject } from "@/models/Project";

export interface PaginatedInitialData {
  data: IProject[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ProjectsSearchProps {
  initialData: PaginatedInitialData;
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

export default function ProjectsSearch({
  initialData,
}: ProjectsSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [page, setPage] = useState(initialData?.page || 1);
  const [limit] = useState(initialData?.limit || 12);

  const [projects, setProjects] = useState<IProject[]>(initialData?.data || []);
  const [total, setTotal] = useState(initialData?.total || 0);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages || 1);
  const [loading, setLoading] = useState(false);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim());
      setPage(1); // reset to page 1 on search change
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Server API fetch on search term or page change
  useEffect(() => {
    let isSubscribed = true;

    // Skip client fetch if on page 1 with no search term (using initialData)
    if (!debouncedTerm && page === 1) {
      setProjects(initialData?.data || []);
      setTotal(initialData?.total || 0);
      setTotalPages(initialData?.totalPages || 1);
      return;
    }

    async function fetchProjects() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("limit", limit.toString());
        if (debouncedTerm) params.set("search", debouncedTerm);

        const res = await fetch(`/api/projects?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch projects");
        const json = await res.json();

        if (isSubscribed && json.success) {
          setProjects(json.data || []);
          setTotal(json.total || 0);
          setTotalPages(json.totalPages || 1);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    }

    fetchProjects();

    return () => {
      isSubscribed = false;
    };
  }, [debouncedTerm, page, limit, initialData]);

  const handleResetSearch = () => {
    setSearchTerm("");
    setPage(1);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Brand Search Input Bar */}
      <div className="bg-white border border-border p-4 md:p-6 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-sm">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-accent">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم، الموقع، أو التفاصيل (مثال: دمنهور، برج الامل)..."
            className="w-full border border-border bg-paper pr-10 pl-10 py-3 text-sm text-ink focus:outline-none focus:border-accent transition-colors rounded-sm"
          />
          {searchTerm && (
            <button
              onClick={handleResetSearch}
              className="absolute inset-y-0 left-0 px-3 text-xs text-muted hover:text-ink font-bold transition-colors"
              title="إعادة تعيين البحث"
            >
              ✕ مسح
            </button>
          )}
        </div>

        <div className="text-xs font-semibold text-muted bg-paper px-4 py-3 border border-border text-center whitespace-nowrap flex items-center justify-center gap-2 rounded-sm">
          {loading && (
            <span className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin inline-block" />
          )}
          {debouncedTerm ? (
            <span>
              تم العثور على <strong className="text-accent">{total}</strong> من أصل{" "}
              {initialData?.total || total} مشروع
            </span>
          ) : (
            <span>
              إجمالي المشاريع: <strong className="text-ink">{total}</strong> (الصفحة {page} من {totalPages})
            </span>
          )}
        </div>
      </div>

      {/* Projects Grid or Friendly Empty State */}
      {projects.length === 0 ? (
        <div className="border border-border bg-white p-12 md:p-16 text-center space-y-4 shadow-sm rounded-sm">
          <div className="w-12 h-12 bg-amber-50 text-accent mx-auto flex items-center justify-center rounded-full border border-amber-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="font-serif text-xl font-medium text-ink">
            {debouncedTerm
              ? `لا توجد نتائج مطابقة لبحثك: "${debouncedTerm}"`
              : "لا توجد مشاريع مضافة حالياً في المعرض."}
          </h3>
          <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
            يرجى التأكد من كتابة مصطلح البحث بشكل صحيح، أو جرب البحث باسم مدينة (مثل: دمنهور، طنطا) أو تصنيف مشروع آخر.
          </p>
          {debouncedTerm && (
            <button
              onClick={handleResetSearch}
              className="inline-block bg-accent hover:bg-accent-hover text-white text-xs font-semibold uppercase tracking-wider px-6 py-3 transition-colors shadow-sm rounded-sm"
            >
              إعادة عرض جميع المشاريع ({initialData?.total || 0})
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Link
                key={project._id.toString()}
                href={`/projects/${project.slug}`}
                className="group border border-border bg-white overflow-hidden transition-all duration-300 hover:border-accent hover:shadow-md flex flex-col rounded-sm"
              >
                <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
                  <Image
                    src={project.coverImage}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <span className="bg-slate-950/80 backdrop-blur-md text-white text-[10px] uppercase font-semibold tracking-wider px-2.5 py-1 rounded-sm">
                      {getCategoryLabel(project.category)}
                    </span>
                    <span className="bg-amber-500 text-slate-950 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-sm">
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <p className="text-xs text-muted tracking-wider flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {project.location}
                    </p>
                    <h3 className="font-serif text-xl font-medium text-ink group-hover:text-accent transition-colors mt-1">
                      {project.title}
                    </h3>
                    <p className="text-xs text-muted mt-2 line-clamp-2 leading-relaxed font-normal">
                      {project.description}
                    </p>
                  </div>

                  <div className="pt-2 text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-1 group-hover:-translate-x-1 transition-transform">
                    <span>استكشف تفاصيل المشروع</span>
                    <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1 || loading}
                className="border border-border bg-white text-ink hover:border-accent hover:text-accent disabled:opacity-40 disabled:hover:border-border disabled:hover:text-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm rounded-sm"
              >
                ← الصفحة السابقة
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    disabled={loading}
                    className={`w-9 h-9 text-xs font-semibold border transition-colors rounded-sm ${
                      pNum === page
                        ? "bg-accent text-white border-accent shadow-sm"
                        : "bg-white text-ink border-border hover:border-accent"
                    }`}
                  >
                    {pNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages || loading}
                className="border border-border bg-white text-ink hover:border-accent hover:text-accent disabled:opacity-40 disabled:hover:border-border disabled:hover:text-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm rounded-sm"
              >
                الصفحة التالية →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
