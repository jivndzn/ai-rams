
import { useState, useEffect } from "react";
import { GeminiMessage } from "@/lib/gemini/types";
import { SensorData } from "@/lib/sensors";
import { validateApiKeyFormat } from "@/lib/env";
import { useAutoAnalysis } from "./useAutoAnalysis";
import { useUserMessages } from "./useUserMessages";

interface UseChatWithGeminiProps {
  sensorData: SensorData;
  apiKey: string;
}

export const useChatWithGemini = ({ sensorData, apiKey }: UseChatWithGeminiProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<GeminiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAutoAnalyzed, setHasAutoAnalyzed] = useState(false);
  
  // Initialize the auto analysis functionality
  const { handleAutoAnalysis, autoAnalysisTimeoutRef } = useAutoAnalysis({
    sensorData,
    apiKey,
    setMessages,
    setIsLoading,
    setHasAutoAnalyzed
  });

  // Initialize the user messages functionality
  const { handleSendMessage, handleKeyDown } = useUserMessages({
    sensorData,
    apiKey,
    messages,
    setMessages,
    setIsLoading
  });

  // Trigger auto analysis on initial load if API key is valid
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
  
  // Wrapper for sending messages with the current input
  const sendMessage = () => {
    handleSendMessage(input);
    setInput("");
  };

  // Wrapper for key down events
  const onKeyDown = (e: React.KeyboardEvent) => {
    handleKeyDown(e);
    if (e.key === "Enter" && !e.shiftKey) {
      setInput("");
    }
  };

  return {
    input,
    setInput,
    messages,
    setMessages, // Exposing setMessages for external use
    isLoading,
    handleAutoAnalysis,
    handleSendMessage: sendMessage,
    handleKeyDown: onKeyDown,
    hasAutoAnalyzed
  };
};
