"use client";

import { Header } from "@/components/header";
import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar } from "@/components/ui/sidebar";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import type React from "react";
import { useState } from "react";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();

  // Don't protect the login page
  const isLoginPage = pathname === "/login";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>CBA Agent</title>
        <link rel="icon" href="/CN_Railway_logo.svg" type="image/svg+xml" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {isLoginPage ? (
          // Login page without protection
          children
        ) : (
          // Protected pages
          <ProtectedRoute>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <div className="flex-1">
                <div className="border-t">
                  <div className="bg-background">
                    <div className="flex">
                      <Sidebar
                        isCollapsed={isCollapsed}
                        onToggle={() => setIsCollapsed(!isCollapsed)}
                        className="sticky top-0 h-screen"
                      />
                      <main className="flex-1 p-8">{children}</main>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ProtectedRoute>
        )}
      </body>
    </html>
  );
}
