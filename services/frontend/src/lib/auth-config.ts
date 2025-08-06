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
