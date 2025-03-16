
// Environment variables utility
// For Vite, environment variables must be prefixed with VITE_
// Example: VITE_GEMINI_API_KEY in .env file

import { DEFAULT_GEMINI_API_KEY } from './gemini/config';

/**
 * Gets an environment variable with fallback
 * @param key The environment variable key (without VITE_ prefix)
 * @param fallback Fallback value if environment variable is not set
 * @returns The environment variable value or fallback
 */
export function getEnvVariable(key: string, fallback: string = ''): string {
  // Vite environment variables are exposed on import.meta.env
  // and must be prefixed with VITE_
  const envKey = `VITE_${key}`;
  const value = import.meta.env[envKey];
  return value || fallback;
}

/**
 * Gets the Gemini API key from environment variables or the default key
 * Priority:
 * 1. Environment variable (VITE_GEMINI_API_KEY)
 * 2. Default API key
 */
export function getGeminiApiKey(): string {
  // First check environment variable
  const envApiKey = getEnvVariable('GEMINI_API_KEY');
  
  // Return environment variable or default key
  return envApiKey || DEFAULT_GEMINI_API_KEY;
}

/**
 * Validates a Gemini API key format
 * Note: This doesn't check if the key is actually valid with the API
 * @param apiKey The API key to validate
 * @returns Whether the key looks valid based on format
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  // Updated validation: Gemini API keys are now typically longer strings
  // This is a more permissive check to accommodate various API key formats
  return !!apiKey && apiKey.trim().length > 8;
}
