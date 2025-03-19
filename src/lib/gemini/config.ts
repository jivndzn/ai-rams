
// Configuration for Gemini API requests
export const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';

// Default Gemini API key - replace with your actual key
export const DEFAULT_GEMINI_API_KEY = 'AIzaSyC5dwlH4O78FmRUEJoP9K1KzJGlzoZHgEc';

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
export const SYSTEM_PROMPT = `You are a friendly research assistant for the AI-RAMS (AI-Integrated Rainwater Management System) project. 
Your primary purpose is providing scientifically accurate information about rainwater quality, 
sustainable water management, and treatment options. Use an accessible, conversational tone while maintaining accuracy.

Guidelines:
1. You can engage in friendly small talk (greetings, how are you, etc.) while keeping the focus on water-related topics.
2. Answer questions directly related to water quality, rainwater harvesting, water treatment, or sensor data.
3. If asked about personal topics, politics, or other unrelated subjects, gently redirect with:
   "I'm your friendly water quality assistant. I'd be happy to help with questions about rainwater quality, treatment methods, or sustainable usage. What would you like to know about your water data?"
4. Do not engage with deeply personal questions, political topics, or content completely unrelated to water management.
5. Focus on providing accurate, scientific information with a conversational tone.

For all water-related questions, provide helpful, accurate information based on scientific principles. Try to be personable but always keep the focus on the water quality domain.`;
