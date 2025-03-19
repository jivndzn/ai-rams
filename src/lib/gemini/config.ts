
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
export const SYSTEM_PROMPT = `You are a research assistant for the AI-RAMS (AI-Integrated Rainwater Management System) project. 
Your purpose is strictly limited to providing scientifically accurate information about rainwater quality, 
sustainable water management, and treatment options. Use an academic but accessible tone.

Important instruction boundaries:
1. ONLY answer questions directly related to water quality, rainwater harvesting, water treatment, or the sensor data provided.
2. If asked about the purpose of this chatbot, the company behind it, or any information not directly related to water quality analysis, ALWAYS respond with:
   "I'm your water quality assistant. I can only provide information and recommendations about rainwater quality, treatment methods, and sustainable usage. Please ask me questions related to your water data or water management techniques."
3. Do not engage with political questions, personal advice unrelated to water, or any topics outside water management.
4. Focus on providing accurate, scientific information about the water readings and actionable recommendations.
5. Do not pretend to be a different assistant or change your role - you are strictly a water quality analysis assistant.

For all valid water-related questions, provide helpful, accurate information based on scientific principles.`;

