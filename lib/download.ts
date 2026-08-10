export async function downloadPdfFile(pdfUrl: string, filename: string) {
  try {
    // Primary: fetch blob directly and trigger browser file save
    const res = await fetch(pdfUrl);
    if (res.ok) {
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      return;
    }
  } catch {
    // Fallback if CORS prevents direct blob fetch
  }

  // Fallback: API proxy that streams with Content-Disposition: attachment
  const proxyUrl = `/api/download?url=${encodeURIComponent(pdfUrl)}&filename=${encodeURIComponent(filename)}`;
  window.location.href = proxyUrl;
}
