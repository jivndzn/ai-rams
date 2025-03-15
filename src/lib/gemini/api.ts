
import { toast } from "sonner";
import { GeminiMessage, GeminiResponse } from "./types";
import { constructWaterAnalysisPrompt, handleGeminiApiError } from "./utils";
import { GEMINI_API_ENDPOINT, DEFAULT_SAFETY_SETTINGS, DEFAULT_GENERATION_CONFIG, SYSTEM_PROMPT } from "./config";

// Function to get a recommendation based on sensor data
export async function getWaterRecommendation(
  apiKey: string,
  ph: number,
  temperature: number,
  quality: number,
  userQuestion?: string
): Promise<string> {
  try {
    if (!apiKey) {
      return "Please provide a valid Gemini API key to receive personalized rainwater analysis and recommendations.";
    }
    
    // Construct the prompt with the sensor data
    const prompt = constructWaterAnalysisPrompt(ph, temperature, quality, userQuestion);
    
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
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
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
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    return handleGeminiApiError(error);
  }
}
