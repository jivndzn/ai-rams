
import { useState, useEffect } from "react";
import { GeminiMessage, chatWithGemini, getWaterRecommendation } from "@/lib/gemini";
import { SensorData } from "@/lib/sensors";
import { toast } from "sonner";

interface UseChatWithGeminiProps {
  sensorData: SensorData;
  apiKey: string;
}

export const useChatWithGemini = ({ sensorData, apiKey }: UseChatWithGeminiProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<GeminiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-analysis when first loaded or sensor data changes significantly
  useEffect(() => {
    if (messages.length === 0 && apiKey) {
      handleAutoAnalysis();
    }
  }, [apiKey]); // Only run on initial api key setup

  const handleAutoAnalysis = async () => {
    if (!apiKey) {
      toast.warning("Please enter a Gemini API key to get water analysis");
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

      // Add the auto-analysis as a model message
      const newMessages: GeminiMessage[] = [
        { 
          role: "model", 
          parts: [{ text: "Hello! I'm your AquaBot assistant. I'll help you analyze your rainwater quality. Here's my initial assessment:" }] 
        },
        { 
          role: "model", 
          parts: [{ text: response }] 
        }
      ];
      
      setMessages(newMessages);
    } catch (error) {
      console.error("Error during auto analysis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    if (!apiKey) {
      toast.warning("Please enter a Gemini API key to chat");
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
      
      // Get response from Gemini
      const response = await chatWithGemini(
        apiKey,
        updatedMessages,
        sensorData.ph,
        sensorData.temperature,
        sensorData.quality
      );
      
      // Add model response
      const modelMessage: GeminiMessage = {
        role: "model",
        parts: [{ text: response }],
      };
      
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to get a response. Please try again.");
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
    handleKeyDown
  };
};
