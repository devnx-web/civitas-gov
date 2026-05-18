import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Civitas Gov — Plataforma de Gestão Pública",
    template: "%s · Civitas Gov",
  },
  description:
    "ERP integrado de gestão pública: almoxarifado, patrimônio, licitações & contratos e portal da transparência. POC inspirada no Pregão Eletrônico 002/2026 do IPASLI.",
  applicationName: "Civitas Gov",
};

export const viewport: Viewport = {
  themeColor: "#0d1f4b",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
