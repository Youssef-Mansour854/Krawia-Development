import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "تصاميم أسماء كراوية | التطوير العقاري والهندسة المعمارية",
  description:
    "معرض الأعمال المعمارية والمشاريع السكنية والتجارية الفاخرة لشركة أسماء كراوية للتطوير العقاري.",
  icons: {
    icon: [
      { url: "/img/logo/logo_shafaf.png", type: "image/png" },
    ],
    shortcut: "/img/logo/logo_shafaf.png",
    apple: "/img/logo/logo_shafaf.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={tajawal.variable}
    >
      <body className="min-h-screen bg-paper text-ink font-sans antialiased selection:bg-accent selection:text-white">
        {children}
      </body>
    </html>
  );
}

