/**
 * Copyright 2025 Loïc Muhirwa
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
import { Sidebar } from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Dancing_Script, Inter } from "next/font/google";
import type React from "react";
import { useState } from "react";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-cursive",
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Agent Interface</title>
        <link rel="icon" href="/logo-dark.png" type="image/png" />
      </head>
      <body
        className={`${inter.variable} ${dancingScript.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <div className="flex-1">
              <div className="">
                <div className="bg-background">
                  <div className="flex">
                    <Sidebar
                      isCollapsed={isCollapsed}
                      onToggle={() => setIsCollapsed(!isCollapsed)}
                    />
                    <main
                      className={`flex-1 p-8 transition-all duration-700 ease-out ${
                        isCollapsed ? "ml-20" : "ml-0"
                      }`}
                    >
                      {children}
                    </main>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
