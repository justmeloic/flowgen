/**
 * Authentication configuration for the CBA Assistant
 * 
 * This configuration uses environment variables for security.
 * Make sure to set AUTH_SECRET in your .env files.
 */

export const AUTH_CONFIG = {
  // Session duration in milliseconds (24 hours)
  SESSION_DURATION: 24 * 60 * 60 * 1000,
  
  // Local storage keys
  STORAGE_KEYS: {
    AUTHENTICATED: "cba_authenticated",
    TIMESTAMP: "cba_auth_timestamp",
    REDIRECT: "cba_redirect_after_login",
  },
} as const;

export type AuthConfig = typeof AUTH_CONFIG;
