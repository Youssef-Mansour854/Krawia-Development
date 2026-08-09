import type { Metadata } from "next";
import { Tajawal, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-serif",
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
      className={`${tajawal.variable} ${cormorant.variable}`}
    >
      <body className="min-h-screen bg-paper text-ink font-sans antialiased selection:bg-accent selection:text-white">
        {children}
      </body>
    </html>
  );
}
