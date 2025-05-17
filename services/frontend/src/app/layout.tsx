"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import type React from "react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/ui/sidebar";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <div className="flex-1">
            <div className="border-t">
              <div className="bg-background">
                <div className="flex">
                  <Sidebar
                    isCollapsed={isCollapsed}
                    onToggle={() => setIsCollapsed(!isCollapsed)}
                  />
                  <main className="flex-1 p-8">{children}</main>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
