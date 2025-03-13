
import { toast } from "sonner";

// Types for the Gemini API
export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
      role: string;
    };
    finishReason: string;
  }[];
}

// Function to get a recommendation based on sensor data
export async function getWaterRecommendation(
  apiKey: string,
  ph: number,
  temperature: number,
  quality: number,
  userQuestion?: string
): Promise<string> {
  try {
    // Construct the prompt with the sensor data
    const prompt = constructPrompt(ph, temperature, quality, userQuestion);
    
    // Call the Gemini API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
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
    console.error("Error getting recommendation:", error);
    toast.error("Failed to get analysis. Please try again.");
    return "I'm having trouble analyzing your rainwater data right now. Please try again later.";
  }
}

// Helper function to construct the prompt for Gemini
function constructPrompt(
  ph: number, 
  temperature: number, 
  quality: number, 
  userQuestion?: string
): string {
  const basePrompt = `
You are a research assistant for the AI-RAMS (AI-Integrated Rainwater Management System) project, specializing in rainwater quality analysis and sustainable usage. Analyze the following sensor data:

- pH level: ${ph.toFixed(1)} (7.0 is neutral)
- Temperature: ${temperature.toFixed(1)}°C
- Overall water quality index (0-100): ${quality}

Based on this data and the principles of sustainable water management, determine:
1. The optimal application for this rainwater (household use, irrigation, non-potable uses)
2. Potential treatment needs, if any
3. Water conservation implications

${userQuestion ? `Also, please address this specific research question: ${userQuestion}` : ''}

Provide a brief scientific analysis of the water quality parameters and clear recommendations supported by water quality standards. Reference sustainability principles where relevant. Your analysis will inform the AI-driven decision-making component of the system.
`;

  return basePrompt;
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
    
    // Create a context-aware conversation
    const conversationHistory = [
      {
        role: "user" as const,
        parts: [{ text: "You are a research assistant for the AI-RAMS (AI-Integrated Rainwater Management System) project. Provide scientifically accurate, concise information about rainwater quality, sustainable water management, and treatment options. Use an academic but accessible tone." }],
      },
      contextMessage,
      ...messages,
    ];

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          contents: conversationHistory,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
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
    console.error("Error chatting with Gemini:", error);
    toast.error("Failed to get a response. Please try again.");
    return "I'm having trouble responding to your research query right now. Please try again later.";
  }
}
