
import { useState, useEffect, useRef } from "react";
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
  const [lastProcessedDataTimestamp, setLastProcessedDataTimestamp] = useState<number | undefined>(undefined);
  
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
      setLastProcessedDataTimestamp(sensorData.timestamp);
    }
    
    return () => {
      if (autoAnalysisTimeoutRef.current.timeout) {
        clearTimeout(autoAnalysisTimeoutRef.current.timeout);
      }
    };
  }, [apiKey, hasAutoAnalyzed]);
  
  // Monitor for changes in sensor data timestamp and trigger analysis
  useEffect(() => {
    if (!sensorData.timestamp || !apiKey || !validateApiKeyFormat(apiKey)) return;
    
    // Check if this is new data we haven't processed yet
    if (lastProcessedDataTimestamp !== sensorData.timestamp) {
      console.log("New sensor data detected, timestamp:", sensorData.timestamp);
      console.log("Previous processed timestamp:", lastProcessedDataTimestamp);
      
      // Only run auto-analysis if we've already done the initial analysis
      if (hasAutoAnalyzed && messages.length > 0) {
        console.log("Triggering auto-analysis for new sensor data");
        handleAutoAnalysis();
      }
      
      // Update the last processed timestamp
      setLastProcessedDataTimestamp(sensorData.timestamp);
    }
  }, [sensorData.timestamp, apiKey, hasAutoAnalyzed, messages.length]);
  
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
    hasAutoAnalyzed,
    lastProcessedDataTimestamp
  };
};
