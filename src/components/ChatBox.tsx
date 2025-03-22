
import { useState, useEffect } from "react";
import { SensorData } from "@/lib/sensors";
import { useChatWithGemini } from "@/hooks/useChatWithGemini";
import { useConversationManager } from "@/hooks/useConversationManager";
import { GeminiMessage } from "@/lib/gemini/types";
import MessageList from "./chat/MessageList";
import ChatInput from "./chat/ChatInput";
import AnalysisButton from "./chat/AnalysisButton";
import EmptyState from "./chat/EmptyState";
import ConversationControls from "./chat/ConversationControls";

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
    setMessages,
    isLoading,
    handleAutoAnalysis,
    handleSendMessage,
    handleKeyDown
  } = useChatWithGemini({
    sensorData,
    apiKey
  });
  
  const {
    currentConversationId,
    setCurrentConversationId,
    isSaving,
    saveTimeoutRef,
    loadConversationMessages,
    createNewConversation,
    saveMessages
  } = useConversationManager({
    messages,
    apiKey
  });

  // Handle selecting a conversation from the history
  const handleSelectConversation = async (conversationId: string) => {
    if (currentConversationId === conversationId) return;
    
    // If we have unsaved changes, save them first
    if (currentConversationId && messages.length > 0) {
      await saveMessages();
    }
    
    setCurrentConversationId(conversationId);
    const loadedMessages = await loadConversationMessages(conversationId);
    if (loadedMessages.length > 0) {
      setMessages(loadedMessages);
    } else {
      setMessages([]);
    }
  };
  
  // Handle creating a new conversation
  const handleCreateNewConversation = async () => {
    // If we have unsaved changes, save them first
    if (currentConversationId && messages.length > 0) {
      await saveMessages();
    }
    
    const newConversationId = await createNewConversation();
    if (newConversationId) {
      setMessages([]);
    }
  };
  
  // Auto-save when messages change
  useEffect(() => {
    if (messages.length > 0 && currentConversationId) {
      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set a new timeout to save messages
      saveTimeoutRef.current = setTimeout(() => {
        saveMessages();
      }, 2000); // Auto-save 2 seconds after last message change
    } else if (messages.length > 0 && !currentConversationId) {
      // If we have messages but no conversation, create one
      createNewConversation();
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [messages, currentConversationId]);
  
  // Trigger analysis when sensor data is updated
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
      {/* Conversation controls */}
      <ConversationControls 
        createNewConversation={handleCreateNewConversation}
        saveMessages={saveMessages}
        isSaving={isSaving}
        messagesCount={messages.length}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
      />
      
      {/* Chat messages */}
      <div className={`flex-1 overflow-y-auto ${messages.length === 0 ? 'flex items-center justify-center' : ''}`}>
        {messages.length === 0 ? (
          <EmptyState 
            handleAutoAnalysis={handleAutoAnalysis}
            isLoading={isLoading}
          />
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
