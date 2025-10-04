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

import { Header } from "@/components/Layout/Header";
import { MobileSidebar } from "@/components/Layout/MobileSidebar";
import { Sidebar } from "@/components/Layout/Sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { ThemeProvider } from "@/components/System/ThemeProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { Dancing_Script, Inter, Poppins } from "next/font/google";
import { usePathname } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-cursive",
  weight: ["400", "500", "600", "700"],
});
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Hydrate from localStorage post-mount to avoid SSR mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebar:isCollapsed");
      if (saved !== null) {
        setIsCollapsed(JSON.parse(saved));
      }
    } catch {
      // ignore parsing errors
    }
  }, []);

  // Broadcast sidebar state so pages can react (e.g., hide duplicate buttons)
  useEffect(() => {
    try {
      localStorage.setItem("sidebar:isCollapsed", JSON.stringify(isCollapsed));
      window.dispatchEvent(
        new CustomEvent("sidebarToggled", { detail: { isCollapsed } })
      );
    } catch {
      // no-op in non-browser environments
    }
  }, [isCollapsed]);

  // Handler for mobile sidebar toggle
  const handleSidebarToggle = () => {
    // On mobile, toggle the mobile sidebar overlay
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      // On desktop, toggle the regular sidebar
      setIsCollapsed(!isCollapsed);
    }
  };

  // Check if current page is login page
  const isLoginPage = pathname === "/login";

  const renderContent = () => {
    if (isLoginPage) {
      return children;
    }

    return (
      <ProtectedRoute>
        <div className="relative flex min-h-screen flex-col">
          {/* Mobile hamburger menu button - top left */}
          <Button
            onClick={handleSidebarToggle}
            className={cn(
              "block sm:hidden fixed top-4 left-4 z-30 p-3 bg-blue-100 dark:bg-gray-700 rounded-full hover:bg-blue-200 dark:hover:bg-gray-600 transition-all duration-300 ease-in-out shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            )}
            aria-label="Toggle sidebar"
          >
            <Menu className="w-4 h-4 text-gray-600/80 dark:text-gray-300" />
          </Button>

          <Header />
          <div className="flex flex-1">
            <Sidebar
              isCollapsed={isCollapsed}
              onToggle={() => setIsCollapsed(!isCollapsed)}
            />
            <main
              className={`flex-1 p-8 transition-all duration-700 ease-out ${
                isCollapsed ? "ml-0" : "ml-[250px]"
              }`}
            >
              {children}
            </main>
          </div>

          {/* Mobile Sidebar Component */}
          <MobileSidebar
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
          />
        </div>
      </ProtectedRoute>
    );
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Flowgen</title>
        <link rel="icon" href="/logo-dark.png" type="image/png" />
      </head>
      <body
        className={`${inter.variable} ${dancingScript.variable} ${poppins.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {renderContent()}
        </ThemeProvider>
      </body>
    </html>
  );
}
