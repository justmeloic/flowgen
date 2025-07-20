/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use client";

import { Header } from "@/components/header";
import { ProtectedRoute } from "@/components/protected-route";
import { ThemeProvider } from "@/components/theme-provider";
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
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
        </ThemeProvider>
      </body>
    </html>
  );
}
