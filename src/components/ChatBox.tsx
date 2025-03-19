
import { useState, useEffect } from "react";
import { SensorData } from "@/lib/sensors";
import { useChatWithGemini } from "@/hooks/useChatWithGemini";
import MessageList from "./chat/MessageList";
import ChatInput from "./chat/ChatInput";
import AnalysisButton from "./chat/AnalysisButton";

interface ChatBoxProps {
  sensorData: SensorData;
  apiKey: string;
  setApiKey: (key: string) => void;
}

const ChatBox = ({ sensorData, apiKey, setApiKey }: ChatBoxProps) => {
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
      {/* Chat messages */}
      <div className={`flex-1 overflow-y-auto ${messages.length === 0 ? 'flex items-center justify-center' : ''}`}>
        {messages.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-muted-foreground mb-2">Click the button below to generate a water analysis</p>
            <div className="mb-4">
              <AnalysisButton 
                handleAutoAnalysis={handleAutoAnalysis}
                isLoading={isLoading}
              />
            </div>
            <div className="mt-4 text-sm text-muted-foreground max-w-md mx-auto">
              <p className="mb-2 font-medium">I'm your friendly water assistant and can help with:</p>
              <ul className="list-disc list-inside text-left">
                <li>Analyzing your water quality data</li>
                <li>Providing treatment recommendations</li>
                <li>Sustainable rainwater usage advice</li>
                <li>Water conservation strategies</li>
              </ul>
              <p className="mt-2 italic">Feel free to greet me or ask questions about your water data!</p>
            </div>
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
      {messages.length > 0 && (
        <AnalysisButton 
          handleAutoAnalysis={handleAutoAnalysis}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default ChatBox;
