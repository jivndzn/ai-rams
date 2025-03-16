
import { useState, useEffect } from "react";
import { SensorData } from "@/lib/sensors";
import { useChatWithGemini } from "@/hooks/useChatWithGemini";
import ApiKeyInput from "./chat/ApiKeyInput";
import MessageList from "./chat/MessageList";
import ChatInput from "./chat/ChatInput";
import AnalysisButton from "./chat/AnalysisButton";

interface ChatBoxProps {
  sensorData: SensorData;
  apiKey: string;
  setApiKey: (key: string) => void;
}

const ChatBox = ({ sensorData, apiKey, setApiKey }: ChatBoxProps) => {
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [lastSensorTimestamp, setLastSensorTimestamp] = useState(sensorData.timestamp);
  
  const {
    input,
    setInput,
    messages,
    isLoading,
    handleAutoAnalysis,
    handleSendMessage,
    handleKeyDown
  } = useChatWithGemini({
    sensorData,
    apiKey
  });

  const saveApiKey = (key: string) => {
    setApiKey(key);
  };
  
  // Trigger analysis when sensor data is updated (every 15 minutes)
  useEffect(() => {
    // Only trigger if timestamp has changed and we have data
    if (sensorData.timestamp !== lastSensorTimestamp && apiKey) {
      setLastSensorTimestamp(sensorData.timestamp);
      // Only run auto-analysis if we already have messages (user has seen initial analysis)
      if (messages.length > 0) {
        setTimeout(() => {
          handleAutoAnalysis();
        }, 500); // Small delay to let UI render first
      }
    }
  }, [sensorData.timestamp, apiKey]);

  return (
    <div className="flex flex-col h-full">
      {/* API Key input - always shown if empty */}
      {!apiKey && (
        <ApiKeyInput 
          localApiKey={localApiKey}
          setLocalApiKey={setLocalApiKey}
          saveApiKey={saveApiKey}
        />
      )}
      
      {/* Chat messages */}
      <div className={`flex-1 overflow-y-auto ${messages.length === 0 ? 'flex items-center justify-center' : ''}`}>
        {messages.length === 0 ? (
          <div className="text-center p-4">
            {apiKey ? (
              <>
                <p className="text-muted-foreground mb-2">Click the button below to generate a water analysis</p>
                <AnalysisButton 
                  handleAutoAnalysis={handleAutoAnalysis}
                  isLoading={isLoading}
                />
              </>
            ) : (
              <p className="text-muted-foreground">Enter your API key to start using the research assistant</p>
            )}
          </div>
        ) : (
          <MessageList messages={messages} isLoading={isLoading} />
        )}
      </div>
      
      {/* Chat input */}
      <ChatInput
        input={input}
        setInput={setInput}
        handleSendMessage={handleSendMessage}
        handleKeyDown={handleKeyDown}
        isLoading={isLoading}
        apiKey={apiKey}
      />
      
      {/* Auto-analysis button */}
      {apiKey && messages.length > 0 && (
        <AnalysisButton 
          handleAutoAnalysis={handleAutoAnalysis}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default ChatBox;
