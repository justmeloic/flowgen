"use client";

import { AUTH_CONFIG } from "@/lib/auth-config";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authFlag = sessionStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.AUTHENTICATED);
        const authTimestamp = sessionStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TIMESTAMP);
        
        if (authFlag === "true" && authTimestamp) {
          const timestamp = parseInt(authTimestamp);
          const now = Date.now();
          
          // Check if the authentication is still valid
          if (now - timestamp < AUTH_CONFIG.SESSION_DURATION) {
            setIsAuthenticated(true);
          } else {
            // Authentication expired, clear it
            sessionStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.AUTHENTICATED);
            sessionStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.TIMESTAMP);
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        // If there's an error accessing sessionStorage, assume not authenticated
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (secret: string) => {
    if (secret === AUTH_CONFIG.SECRET) {
      sessionStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.AUTHENTICATED, "true");
      sessionStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.TIMESTAMP, Date.now().toString());
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.AUTHENTICATED);
    sessionStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.TIMESTAMP);
    sessionStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.REDIRECT);
    setIsAuthenticated(false);
    router.push("/login");
  };

  const redirectToLogin = () => {
    // Store the current path to redirect back after login
    if (pathname !== "/login") {
      sessionStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.REDIRECT, pathname);
    }
    router.push("/login");
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    redirectToLogin,
  };
}
