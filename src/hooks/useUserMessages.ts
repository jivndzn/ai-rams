
import { toast } from 'sonner';
import { validateApiKeyFormat } from '@/lib/env';
import { chatWithGemini } from '@/lib/gemini';
import { formatApiResponse } from '@/lib/gemini/formatting';
import { isAllowedQuery } from '@/lib/gemini/validation';
import { GeminiMessage } from '@/lib/gemini/types';
import { SensorData } from '@/lib/sensors';

interface UseUserMessagesProps {
  sensorData: SensorData;
  apiKey: string;
  messages: GeminiMessage[];
  setMessages: React.Dispatch<React.SetStateAction<GeminiMessage[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useUserMessages = ({
  sensorData,
  apiKey,
  messages,
  setMessages,
  setIsLoading
}: UseUserMessagesProps) => {
  const handleSendMessage = async (input: string) => {
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
    setIsLoading(true);
    
    try {
      console.log("Sending message with current sensor data:", {
        ph: sensorData.ph,
        temperature: sensorData.temperature,
        quality: sensorData.quality,
        timestamp: sensorData.timestamp,
        source: sensorData.data_source
      });
      
      const updatedMessages = [...messages, userMessage];
      
      if (!isAllowedQuery(input)) {
        const offTopicMessage: GeminiMessage = {
          role: "model",
          parts: [{ text: "I'm sorry, but I'm specialized in water quality analysis and the AI-RAMS system. I can help with questions about your water readings, system functionality, or weather predictions related to water collection. What would you like to know about your rainwater data?" }],
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
      if (e.currentTarget instanceof HTMLTextAreaElement) {
        handleSendMessage(e.currentTarget.value);
      }
    }
  };

  return {
    handleSendMessage,
    handleKeyDown
  };
};
