
import { toast } from "sonner";
import { GeminiMessage, GeminiResponse } from "./types";
import { constructWaterAnalysisPrompt, handleGeminiApiError } from "./utils";
import { GEMINI_API_ENDPOINT, DEFAULT_SAFETY_SETTINGS, DEFAULT_GENERATION_CONFIG, SYSTEM_PROMPT } from "./config";

// Simple cache implementation
interface CacheItem {
  response: string;
  timestamp: number;
}

const responseCache = new Map<string, CacheItem>();
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes cache lifetime

// Function to get a recommendation based on sensor data
export async function getWaterRecommendation(
  apiKey: string,
  ph: number,
  temperature: number,
  quality: number,
  userQuestion?: string,
  forceRefresh = false
): Promise<string> {
  try {
    if (!apiKey) {
      return "Please provide a valid Gemini API key to receive personalized rainwater analysis and recommendations.";
    }
    
    // Create cache key based on parameters
    const cacheKey = `${apiKey}-${ph.toFixed(1)}-${temperature.toFixed(1)}-${quality}-${userQuestion || ''}`;
    
    // Check cache first (unless force refresh is requested)
    if (!forceRefresh) {
      const cachedItem = responseCache.get(cacheKey);
      if (cachedItem && (Date.now() - cachedItem.timestamp) < CACHE_TTL) {
        console.log("Using cached water recommendation");
        return cachedItem.response;
      }
    }
    
    // Construct the prompt with the sensor data
    const prompt = constructWaterAnalysisPrompt(ph, temperature, quality, userQuestion);
    
    // Add delay to prevent rapid successive calls
    if (responseCache.size > 0) {
      console.log("Adding delay between API calls");
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    }
    
    // The latest Google AI Studio endpoint
    const response = await fetch(
      `${GEMINI_API_ENDPOINT}?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          safety_settings: DEFAULT_SAFETY_SETTINGS,
          generation_config: DEFAULT_GENERATION_CONFIG
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Gemini API error:", error);
      throw new Error(`API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json() as GeminiResponse;
    const result = data.candidates[0].content.parts[0].text;
    
    // Cache the successful response
    responseCache.set(cacheKey, {
      response: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    // Check if cache exists for similar parameters when error occurs
    // This serves as a fallback for rate limit errors
    if (error.message?.includes("quota") || error.message?.includes("rate limit")) {
      // Look for similar parameters in cache
      for (const [key, value] of responseCache.entries()) {
        // Simple check - if keys are similar enough, use cached value as fallback
        if (key.startsWith(`${apiKey}-${ph.toFixed(1)}`)) {
          console.log("Using similar cached recommendation due to rate limit");
          return value.response + "\n\n(Note: This is cached data. API rate limit reached.)";
        }
      }
    }
    
    return handleGeminiApiError(error);
  }
}

// Function to chat with Gemini based on previous messages
export async function chatWithGemini(
  apiKey: string,
  messages: GeminiMessage[],
  ph: number,
  temperature: number,
  quality: number,
): Promise<string> {
  try {
    if (!apiKey) {
      return "Please provide a valid Gemini API key to chat with the assistant.";
    }
    
    // Create cache key based on last user message and sensor data
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.parts[0].text || '';
    const cacheKey = `chat-${apiKey}-${ph.toFixed(1)}-${temperature.toFixed(1)}-${quality}-${lastUserMessage.substring(0, 50)}`;
    
    // Check cache first for recent identical questions
    const cachedItem = responseCache.get(cacheKey);
    if (cachedItem && (Date.now() - cachedItem.timestamp) < CACHE_TTL) {
      console.log("Using cached chat response");
      return cachedItem.response;
    }
    
    // Add delay to prevent rapid successive calls
    if (responseCache.size > 0) {
      console.log("Adding delay between chat API calls");
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    }
    
    // Provide context about the current water readings
    const contextMessage: GeminiMessage = {
      role: 'user',
      parts: [{ text: `Current sensor readings - pH: ${ph.toFixed(1)}, Temperature: ${temperature.toFixed(1)}°C, Quality Index: ${quality}/100` }],
    };
    
    // Initialize formattedMessages with contextMessage and previous messages
    const formattedMessages: GeminiMessage[] = [contextMessage, ...messages];
    
    // Add system prompt at the beginning
    formattedMessages.unshift({
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }]
        });

    // Make the API request
    const response = await fetch(
      `${GEMINI_API_ENDPOINT}?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: formattedMessages,
          safety_settings: DEFAULT_SAFETY_SETTINGS,
          generation_config: DEFAULT_GENERATION_CONFIG
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Gemini API error:", error);
      throw new Error(`API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json() as GeminiResponse;
    const result = data.candidates[0].content.parts[0].text;
    
    // Cache the successful response
    responseCache.set(cacheKey, {
      response: result, 
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    return handleGeminiApiError(error);
  }
}

// Function to clear the cache
export function clearResponseCache(): void {
  responseCache.clear();
  console.log("API response cache cleared");
}
