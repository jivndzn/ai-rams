
import { useState, useEffect, useRef } from "react";
import { GeminiMessage, chatWithGemini, getWaterRecommendation } from "@/lib/gemini";
import { SensorData } from "@/lib/sensors";
import { validateApiKeyFormat } from "@/lib/env";
import { toast } from "sonner";

interface UseChatWithGeminiProps {
  sensorData: SensorData;
  apiKey: string;
}

export const useChatWithGemini = ({ sensorData, apiKey }: UseChatWithGeminiProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<GeminiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAutoAnalyzed, setHasAutoAnalyzed] = useState(false);
  const autoAnalysisTimeoutRef = useRef<RetryState>({
    attempts: 0,
    timeout: null
  });

  interface RetryState {
    attempts: number;
    timeout: NodeJS.Timeout | null;
  }

  // Auto-analysis when first loaded or sensor data changes significantly
  useEffect(() => {
    if (!hasAutoAnalyzed && apiKey && validateApiKeyFormat(apiKey)) {
      handleAutoAnalysis();
    }
    
    return () => {
      // Clear any pending timeouts when unmounting
      if (autoAnalysisTimeoutRef.current.timeout) {
        clearTimeout(autoAnalysisTimeoutRef.current.timeout);
      }
    };
  }, [apiKey, hasAutoAnalyzed]);
  
  // Validate if input is water-related
  const isWaterRelatedQuery = (query: string): boolean => {
    const waterKeywords = [
      'water', 'rainwater', 'rain', 'ph', 'acid', 'alkaline', 'quality',
      'treatment', 'filter', 'purif', 'clean', 'contamina', 'pollut',
      'drinking', 'irrigation', 'garden', 'plant', 'household', 'temperat',
      'sensor', 'reading', 'measure', 'system', 'collect', 'tank', 'barrel',
      'sustain', 'conserv', 'recycl', 'reuse', 'harvest', 'storage', 'runoff',
      'potable', 'non-potable', 'bacteria', 'pathogen', 'safe', 'health',
      'minerals', 'sediment', 'turbid', 'clarity', 'conductivity'
    ];
    
    const queryLower = query.toLowerCase();
    
    // Check if any water-related keyword is in the query
    return waterKeywords.some(keyword => queryLower.includes(keyword));
  };

  const handleAutoAnalysis = async () => {
    if (!apiKey || !validateApiKeyFormat(apiKey)) {
      toast.warning("API key required", {
        description: "Please enter a valid Gemini API key to get water analysis"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await getWaterRecommendation(
        apiKey,
        sensorData.ph,
        sensorData.temperature,
        sensorData.quality
      );

      // Format the response to remove excessive markdown symbols
      const formattedResponse = formatApiResponse(response);

      // Add the auto-analysis as a model message
      const welcomeMessage = "Welcome to AI-RAMS! I'm your water quality assistant. I analyze rainwater metrics and provide personalized recommendations for optimal use. Here's my current assessment:";
      const followupMessage = "You can ask me specific questions about water treatment, quality parameters, or sustainable usage strategies. I'm here to help you maximize the value of your rainwater harvesting system!";

      const newMessages: GeminiMessage[] = [
        { role: "model", parts: [{ text: welcomeMessage }] },
        { role: "model", parts: [{ text: formattedResponse }] },
        { role: "model", parts: [{ text: followupMessage }] }
      ];
      
      setMessages(newMessages);
      setHasAutoAnalyzed(true);
      // Reset retry counter on success
      autoAnalysisTimeoutRef.current.attempts = 0;
    } catch (error) {
      console.error("Error during auto analysis:", error);
      
      // Check if error is due to rate limiting/quota
      if (error.message?.includes("quota") || error.message?.includes("rate limit")) {
        const attempts = autoAnalysisTimeoutRef.current.attempts;
        // Exponential backoff: 5s, 10s, 20s, 40s, 60s max
        const delay = Math.min(5000 * Math.pow(2, attempts), 60000);
        
        toast.warning("API rate limit reached", {
          description: `Will retry analysis in ${delay/1000} seconds...`
        });
        
        // Schedule retry with exponential backoff
        autoAnalysisTimeoutRef.current.timeout = setTimeout(() => {
          autoAnalysisTimeoutRef.current.attempts++;
          handleAutoAnalysis();
        }, delay);
      } else {
        toast.error("Analysis failed", {
          description: "Could not connect to Gemini API. Please check your API key and try again."
        });
        
        // For other errors, add a fallback welcome message
        const fallbackMessage: GeminiMessage = {
          role: "model", 
          parts: [{ text: "Welcome to AI-RAMS! I'm currently unable to analyze your water data due to API limitations. You can still view your sensor readings and try again later when the API quota resets." }]
        };
        setMessages([fallbackMessage]);
        setHasAutoAnalyzed(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Format API response to improve readability
  const formatApiResponse = (text: string): string => {
    // Remove excessive markdown formatting that makes text harder to read
    return text
      // Limit heading levels (###+ becomes ##)
      .replace(/#{3,}/g, '##')
      // Space out lines for better readability
      .replace(/\n{3,}/g, '\n\n');
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    if (!apiKey || !validateApiKeyFormat(apiKey)) {
      toast.warning("API key required", {
        description: "Please enter a valid Gemini API key to chat"
      });
      return;
    }
    
    // Add user message
    const userMessage: GeminiMessage = {
      role: "user",
      parts: [{ text: input }],
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Copy current messages and add the new user message
      const updatedMessages = [...messages, userMessage];
      
      // Check if input is likely to be off-topic
      if (!isWaterRelatedQuery(input)) {
        // Add the off-topic response directly without calling API
        const offTopicMessage: GeminiMessage = {
          role: "model",
          parts: [{ text: "I'm your water quality assistant. I can only provide information and recommendations about rainwater quality, treatment methods, and sustainable usage. Please ask me questions related to your water data or water management techniques." }],
        };
        
        setMessages((prev) => [...prev, offTopicMessage]);
        setIsLoading(false);
        return;
      }
      
      // Get response from Gemini for water-related queries
      const response = await chatWithGemini(
        apiKey,
        updatedMessages,
        sensorData.ph,
        sensorData.temperature,
        sensorData.quality
      );
      
      // Format the response to remove excessive markdown symbols
      const formattedResponse = formatApiResponse(response);
      
      // Add model response
      const modelMessage: GeminiMessage = {
        role: "model",
        parts: [{ text: formattedResponse }],
      };
      
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Add error message to the chat
      const errorMessage: GeminiMessage = {
        role: "model",
        parts: [{ text: "I'm currently experiencing connectivity issues with my AI service due to rate limits. Please try again in a few minutes when the API quota resets." }],
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      
      toast.error("API rate limit reached", {
        description: "Please try again later when the quota resets."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return {
    input,
    setInput,
    messages,
    isLoading,
    handleAutoAnalysis,
    handleSendMessage,
    handleKeyDown,
    hasAutoAnalyzed
  };
};
