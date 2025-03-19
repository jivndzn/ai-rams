
/**
 * Utility functions for formatting Gemini API responses
 */

/**
 * Formats an API response by removing excessive formatting and normalizing whitespace
 * 
 * @param text The raw text from the Gemini API
 * @returns Formatted text with normalized markdown and spacing
 */
export const formatApiResponse = (text: string): string => {
  return text
    .replace(/#{3,}/g, '##')
    .replace(/\n{3,}/g, '\n\n');
};
