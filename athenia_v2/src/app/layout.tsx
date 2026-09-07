import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ALETHEIA — Institutional Memory & Decision Traceability",
  description: "Connects organizational choices, people, events, and evidence into an explainable institutional memory graph.",
  keywords: ["Institutional Memory", "Decision Traceability", "ALETHEIA", "Knowledge Graph", "RAG", "Audit Trail"],
};

import { AuthProvider } from '@/context/AuthContext';
import { MemoryProvider } from '@/context/MemoryContext';
import { ClientAppLayout } from '@/components/ClientAppLayout';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}>
      <body className="h-full flex bg-[#101010] text-[#F2F2F2] selection:bg-[#00E5FF]/30 selection:text-[#00E5FF] overflow-hidden">
        <AuthProvider>
          <MemoryProvider>
            <ClientAppLayout>
              {children}
            </ClientAppLayout>
          </MemoryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
