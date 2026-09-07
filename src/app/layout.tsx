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
  title: "ALETHEIA — Intelligent Institutional Memory & Decision Traceability | 4BrainCells",
  description: "Connects organizational documents, people, events, and decisions, allowing users to trace what happened, why it happened, and the evidence behind it.",
  keywords: ["Institutional Memory", "Decision Traceability", "ALETHEIA", "Knowledge Graph", "RAG", "Audit Trail"],
};

import { AuthProvider } from '@/context/AuthContext';
import { ClientAppLayout } from '@/components/ClientAppLayout';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#07080c] text-white selection:bg-cyan-500/30 selection:text-cyan-200">
        <AuthProvider>
          <ClientAppLayout>
            {children}
          </ClientAppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
