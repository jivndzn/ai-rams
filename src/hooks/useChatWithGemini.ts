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

  useEffect(() => {
    if (!hasAutoAnalyzed && apiKey && validateApiKeyFormat(apiKey)) {
      handleAutoAnalysis();
    }
    
    return () => {
      if (autoAnalysisTimeoutRef.current.timeout) {
        clearTimeout(autoAnalysisTimeoutRef.current.timeout);
      }
    };
  }, [apiKey, hasAutoAnalyzed]);
  
  const isAllowedQuery = (query: string): boolean => {
    const basicConversation = [
      'hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening',
      'how are you', 'how\'s it going', 'what\'s up', 'nice to meet you', 'thanks', 'thank you',
      'welcome', 'please', 'okay', 'help', 'bye', 'goodbye', 'see you'
    ];
    
    const waterKeywords = [
      'water', 'rainwater', 'rain', 'ph', 'acid', 'alkaline', 'quality',
      'treatment', 'filter', 'purif', 'clean', 'contamina', 'pollut',
      'drinking', 'irrigation', 'garden', 'plant', 'household', 'temperat',
      'sensor', 'reading', 'measure', 'system', 'collect', 'tank', 'barrel',
      'sustain', 'conserv', 'recycl', 'reuse', 'harvest', 'storage', 'runoff',
      'potable', 'non-potable', 'bacteria', 'pathogen', 'safe', 'health',
      'minerals', 'sediment', 'turbid', 'clarity', 'conductivity'
    ];
    
    const dataKeywords = [
      'data', 'database', 'reading', 'sensor', 'history', 'historical', 'trend',
      'average', 'mean', 'median', 'record', 'log', 'measurement', 'metric',
      'value', 'number', 'statistic', 'analytic', 'analysis', 'chart', 'graph',
      'plot', 'display', 'show', 'tell', 'what is', 'what are', 'how much',
      'how many', 'when', 'where', 'monitor', 'track', 'store', 'latest',
      'recent', 'current', 'past', 'previous', 'compare', 'comparison'
    ];
    
    const queryLower = query.toLowerCase();
    
    const isBasicConversation = basicConversation.some(phrase => 
      queryLower.includes(phrase) || queryLower === phrase
    );
    
    const isWaterRelated = waterKeywords.some(keyword => 
      queryLower.includes(keyword)
    );
    
    const isDataRelated = dataKeywords.some(keyword => 
      queryLower.includes(keyword)
    );
    
    return isBasicConversation || isWaterRelated || isDataRelated;
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

      const formattedResponse = formatApiResponse(response);

      const welcomeMessage = "Welcome to AI-RAMS! I'm your water quality assistant. I analyze rainwater metrics and provide personalized recommendations for optimal use. Here's my current assessment:";
      const followupMessage = "You can ask me specific questions about water treatment, quality parameters, or sustainable usage strategies. I'm here to help you maximize the value of your rainwater harvesting system!";

      const newMessages: GeminiMessage[] = [
        { role: "model", parts: [{ text: welcomeMessage }] },
        { role: "model", parts: [{ text: formattedResponse }] },
        { role: "model", parts: [{ text: followupMessage }] }
      ];
      
      setMessages(newMessages);
      setHasAutoAnalyzed(true);
      autoAnalysisTimeoutRef.current.attempts = 0;
    } catch (error) {
      console.error("Error during auto analysis:", error);
      
      if (error.message?.includes("quota") || error.message?.includes("rate limit")) {
        const attempts = autoAnalysisTimeoutRef.current.attempts;
        const delay = Math.min(5000 * Math.pow(2, attempts), 60000);
        
        toast.warning("API rate limit reached", {
          description: `Will retry analysis in ${delay/1000} seconds...`
        });
        
        autoAnalysisTimeoutRef.current.timeout = setTimeout(() => {
          autoAnalysisTimeoutRef.current.attempts++;
          handleAutoAnalysis();
        }, delay);
      } else {
        toast.error("Analysis failed", {
          description: "Could not connect to Gemini API. Please check your API key and try again."
        });
        
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

  const formatApiResponse = (text: string): string => {
    return text
      .replace(/#{3,}/g, '##')
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
    
    const userMessage: GeminiMessage = {
      role: "user",
      parts: [{ text: input }],
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      const updatedMessages = [...messages, userMessage];
      
      if (!isAllowedQuery(input)) {
        const offTopicMessage: GeminiMessage = {
          role: "model",
          parts: [{ text: "I'm your friendly water quality assistant. I'd be happy to help with questions about your rainwater data, measurements, or historical trends. What would you like to know about your water readings?" }],
        };
        
        setMessages((prev) => [...prev, offTopicMessage]);
        setIsLoading(false);
        return;
      }
      
      const response = await chatWithGemini(
        apiKey,
        updatedMessages,
        sensorData.ph,
        sensorData.temperature,
        sensorData.quality
      );
      
      const formattedResponse = formatApiResponse(response);
      
      const modelMessage: GeminiMessage = {
        role: "model",
        parts: [{ text: formattedResponse }],
      };
      
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      
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
