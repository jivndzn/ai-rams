
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { validateApiKeyFormat } from '@/lib/env';
import { getWaterRecommendation } from '@/lib/gemini';
import { formatApiResponse } from '@/lib/gemini/formatting';
import { GeminiMessage, RetryState } from '@/lib/gemini/types';
import { SensorData } from '@/lib/sensors';

interface UseAutoAnalysisProps {
  sensorData: SensorData;
  apiKey: string;
  setMessages: React.Dispatch<React.SetStateAction<GeminiMessage[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setHasAutoAnalyzed: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useAutoAnalysis = ({
  sensorData,
  apiKey,
  setMessages,
  setIsLoading,
  setHasAutoAnalyzed
}: UseAutoAnalysisProps) => {
  const autoAnalysisTimeoutRef = useRef<RetryState>({
    attempts: 0,
    timeout: null
  });

  const handleAutoAnalysis = async () => {
    if (!apiKey || !validateApiKeyFormat(apiKey)) {
      toast.warning("API key required", {
        description: "Please enter a valid Gemini API key to get water analysis"
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Running auto analysis with sensor data:", {
        ph: sensorData.ph,
        temperature: sensorData.temperature,
        quality: sensorData.quality,
        timestamp: sensorData.timestamp,
        source: sensorData.data_source
      });
      
      const response = await getWaterRecommendation(
        apiKey,
        sensorData.ph,
        sensorData.temperature,
        sensorData.quality,
        undefined,
        true // Force refresh to get latest analysis
      );

      const formattedResponse = formatApiResponse(response);
      
      // Include timestamp and data source in the analysis
      const analysisHeader = `Analysis Date: ${new Date().toLocaleString()}\nData Source: ${sensorData.data_source || 'Sensor'}\n\n`;
      const completeResponse = analysisHeader + formattedResponse;

      const welcomeMessage = "Welcome to AI-RAMS! I'm your water quality assistant. I analyze rainwater metrics and provide personalized recommendations for optimal use. Here's my current assessment:";
      const followupMessage = "You can ask me specific questions about water treatment, quality parameters, or sustainable usage strategies. I'm here to help you maximize the value of your rainwater harvesting system!";

      // For subsequent analyses, just add the new analysis
      if (setHasAutoAnalyzed) {
        // If we've already analyzed before, this is an update
        setMessages(prevMessages => {
          // If there are previous messages, append new analysis
          if (prevMessages.length > 0) {
            const updateMessage: GeminiMessage = {
              role: "model", 
              parts: [{ text: "I've detected new sensor data! Here's my updated analysis:\n\n" + completeResponse }]
            };
            return [...prevMessages, updateMessage];
          } 
          // If this is the first analysis (shouldn't happen but just in case)
          else {
            return [
              { role: "model", parts: [{ text: welcomeMessage }] },
              { role: "model", parts: [{ text: completeResponse }] },
              { role: "model", parts: [{ text: followupMessage }] }
            ];
          }
        });
      } else {
        // First time analysis
        const newMessages: GeminiMessage[] = [
          { role: "model", parts: [{ text: welcomeMessage }] },
          { role: "model", parts: [{ text: completeResponse }] },
          { role: "model", parts: [{ text: followupMessage }] }
        ];
        setMessages(newMessages);
      }
      
      setHasAutoAnalyzed(true);
      autoAnalysisTimeoutRef.current.attempts = 0;
      
      toast.success("Analysis complete", {
        description: "Water quality analysis updated with latest data"
      });
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

  return {
    handleAutoAnalysis,
    autoAnalysisTimeoutRef
  };
};
