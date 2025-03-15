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
    if (!apiKey) {
      return "Please provide a valid Gemini API key to receive personalized rainwater analysis and recommendations.";
    }
    
    // Construct the prompt with the sensor data
    const prompt = constructPrompt(ph, temperature, quality, userQuestion);
    
    // The latest Google AI Studio endpoint
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
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
          safety_settings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE"
            }
          ],
          generation_config: {
            temperature: 0.7,
            top_p: 0.95,
            top_k: 40,
            max_output_tokens: 1024
          }
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Gemini API error:", error);
      console.log("Full error response:", JSON.stringify(error));
      
      if (response.status === 401) {
        return "Your API key appears to be invalid. Please provide a valid Gemini API key in the text field above.";
      } else if (response.status === 429) {
        return "You've reached the rate limit for the Gemini API. Please try again in a few minutes.";
      } else if (response.status === 404) {
        return "The Gemini API endpoint could not be found. Please make sure you're using the latest API key from Google AI Studio (https://aistudio.google.com/).";
      }
      
      return `API error: ${error.error?.message || JSON.stringify(error) || 'Unknown error'}`;
    }

    const data = await response.json() as GeminiResponse;
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error getting recommendation:", error);
    toast.error("Failed to get analysis. Please try again.");
    return "I'm having trouble connecting to the Gemini AI service. This could be due to an invalid API key or a network issue. Please check your API key and try again.";
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
4. Step-by-step instructions for the user to implement your recommendation
5. Long-term benefits of your recommended approach

Provide a detailed analysis of the optimal use for this rainwater based on the current readings. 
Include specific actionable recommendations that users can follow immediately.
Structure your response with clear headings and bullet points when appropriate.
If the pH is between 6.5-8.5, temperature 18-25°C, and quality above 70, highlight that this water is suitable for most household applications.
If any parameter is outside optimal ranges, prioritize safety considerations.

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
    if (!apiKey) {
      return "Please provide a valid Gemini API key to interact with the AI Research Assistant.";
    }
    
    // Format the messages for the Gemini API
    const formattedMessages = messages.map(message => ({
      parts: message.parts
    }));
    
    // Add context message at the beginning
    formattedMessages.unshift({
      parts: [{ text: `Current sensor readings - pH: ${ph.toFixed(1)}, Temperature: ${temperature.toFixed(1)}°C, Quality Index: ${quality}/100` }]
    });
    
    // Add system prompt at the beginning
    formattedMessages.unshift({
      parts: [{ text: "You are a research assistant for the AI-RAMS (AI-Integrated Rainwater Management System) project. Provide scientifically accurate, concise information about rainwater quality, sustainable water management, and treatment options. Use an academic but accessible tone." }]
    });

    // The latest Google AI Studio endpoint
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: formattedMessages,
          safety_settings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE"
            }
          ],
          generation_config: {
            temperature: 0.7,
            top_p: 0.95,
            top_k: 40,
            max_output_tokens: 1024
          }
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Gemini API error:", error);
      console.log("Full error response:", JSON.stringify(error));
      
      if (response.status === 401) {
        return "Your API key appears to be invalid. Please provide a valid Gemini API key in the text field above.";
      } else if (response.status === 429) {
        return "You've reached the rate limit for the Gemini API. Please try again in a few minutes.";
      } else if (response.status === 404) {
        return "The Gemini API endpoint could not be found. Please make sure you're using the latest API key from Google AI Studio (https://aistudio.google.com/).";
      }
      
      return `API error: ${error.error?.message || JSON.stringify(error) || 'Unknown error'}`;
    }

    const data = await response.json() as GeminiResponse;
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error chatting with Gemini:", error);
    toast.error("Failed to get a response. Please try again.");
    return "I'm having trouble connecting to the Gemini AI service. This could be due to an invalid API key or a network issue. Please check your API key and try again.";
  }
}