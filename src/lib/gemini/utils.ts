
import { toast } from "sonner";

// Helper function to construct the prompt for water analysis
export function constructWaterAnalysisPrompt(
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

// Helper function to handle API errors
export function handleGeminiApiError(error: any): string {
  console.error("Error with Gemini API:", error);
  
  // Check for specific error types
  if (error.message?.includes("API key")) {
    toast.error("Invalid API key", { 
      description: "Please check your Gemini API key and try again." 
    });
    return "I'm having trouble authenticating with the Gemini AI service. Please check that your API key is valid and try again.";
  } 
  else if (error.message?.includes("rate limit")) {
    toast.error("Rate limit exceeded", { 
      description: "You've reached the Gemini API rate limit. Please try again later." 
    });
    return "It looks like you've reached the rate limit for Gemini API requests. Please wait a few minutes and try again.";
  }
  else {
    toast.error("Failed to connect to Gemini AI", {
      description: "Please check your network connection and try again."
    });
    return "I'm having trouble connecting to the Gemini AI service. This could be due to a network issue. Please try again later.";
  }
}
