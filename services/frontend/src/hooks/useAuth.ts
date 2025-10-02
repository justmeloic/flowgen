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

import { logout as apiLogout } from "@/lib/api";
import { AUTH_CONFIG } from "@/lib/auth-config";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication status
  const checkAuth = useCallback(() => {
    if (typeof window === "undefined") return false;

    try {
      const authenticated = sessionStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.AUTHENTICATED);
      const timestamp = sessionStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TIMESTAMP);

      if (!authenticated || authenticated !== "true" || !timestamp) {
        return false;
      }

      // Check if session has expired
      const authTime = parseInt(timestamp, 10);
      const now = Date.now();
      const elapsed = now - authTime;

      if (elapsed > AUTH_CONFIG.SESSION_DURATION) {
        // Session expired
        sessionStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.AUTHENTICATED);
        sessionStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.TIMESTAMP);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  }, []);

  // Initialize authentication state
  useEffect(() => {
    const authenticated = checkAuth();
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  }, [checkAuth]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with local logout even if API fails
    }

    // Clear authentication state
    sessionStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.AUTHENTICATED);
    sessionStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.TIMESTAMP);
    sessionStorage.removeItem("user_email");

    setIsAuthenticated(false);
    router.push("/login");
  }, [router]);

  // Redirect to login
  const redirectToLogin = useCallback(() => {
    // Store current path for redirect after login
    sessionStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.REDIRECT, window.location.pathname);
    router.push("/login");
  }, [router]);

  return {
    isAuthenticated,
    isLoading,
    logout,
    redirectToLogin,
  };
}