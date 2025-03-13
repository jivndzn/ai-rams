
import { useState } from "react";
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

  return (
    <div className="flex flex-col h-full">
      {/* API Key input - only shown if apiKey is empty */}
      {!apiKey && (
        <ApiKeyInput 
          localApiKey={localApiKey}
          setLocalApiKey={setLocalApiKey}
          saveApiKey={saveApiKey}
        />
      )}
      
      {/* Chat messages */}
      <MessageList messages={messages} isLoading={isLoading} />
      
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
      {apiKey && (
        <AnalysisButton 
          handleAutoAnalysis={handleAutoAnalysis}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default ChatBox;
