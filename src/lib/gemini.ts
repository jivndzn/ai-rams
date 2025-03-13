
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
    toast.error("Failed to get recommendation. Please try again.");
    return "I'm having trouble analyzing your water data right now. Please try again later.";
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
You are AquaBot, an expert in rainwater quality analysis. Analyze the following rainwater quality data:

- pH level: ${ph.toFixed(1)} (7.0 is neutral)
- Temperature: ${temperature.toFixed(1)}°C
- Overall water quality (0-100): ${quality}

Based on this data, determine the optimal use for this rainwater. Consider:
1. Domestic use (if the water meets safe standards)
2. Irrigation for plants (if slightly acidic or alkaline)
3. Car washing (if suitable for non-potable purposes)
4. Other potential uses based on the quality

${userQuestion ? `Also, please address this specific question: ${userQuestion}` : ''}

Provide a brief analysis of the water quality and a clear recommendation for its best use. Explain why this use is optimal given the current readings. Keep your response concise and informative.
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
      parts: [{ text: `Current water readings - pH: ${ph.toFixed(1)}, Temperature: ${temperature.toFixed(1)}°C, Quality: ${quality}/100` }],
    };
    
    // Create a context-aware conversation
    const conversationHistory = [
      {
        role: "user" as const,
        parts: [{ text: "You are AquaBot, an expert in rainwater quality analysis. Be helpful, concise, and informative when answering questions about water quality." }],
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
    return "I'm having trouble responding right now. Please try again later.";
  }
}
