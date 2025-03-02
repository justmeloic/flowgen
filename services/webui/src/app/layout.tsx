"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import type React from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/context/UserContext"; // Import UserProvider

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
        <UserProvider>
          {" "}
          {/* Wrap your app with UserProvider */}
          <div className="relative flex min-h-screen flex-col">
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
            <Toaster />
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
