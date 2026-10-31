import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Google Search Activity Executive Dashboard | 20-Year Audit (2007–2026)",
  description:
    "Comprehensive audit and timeline analysis of user search records, visited URLs, and account activity from Google Takeout exports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-navy-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.15),rgba(255,255,255,0))] pointer-events-none" />
        <div className="relative min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  );
}
