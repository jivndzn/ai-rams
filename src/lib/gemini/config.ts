
// Configuration for Gemini API requests
export const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';

// Default Gemini API key - replace with your actual key
export const DEFAULT_GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';

export const DEFAULT_SAFETY_SETTINGS = [
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
];

export const DEFAULT_GENERATION_CONFIG = {
  temperature: 0.7,
  top_p: 0.95,
  top_k: 40,
  max_output_tokens: 1024
};

// System prompt for chat mode
export const SYSTEM_PROMPT = "You are a research assistant for the AI-RAMS (AI-Integrated Rainwater Management System) project. Provide scientifically accurate, concise information about rainwater quality, sustainable water management, and treatment options. Use an academic but accessible tone.";
