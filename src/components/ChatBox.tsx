
import { useState, useEffect, useRef } from "react";
import { SensorData } from "@/lib/sensors";
import { useChatWithGemini } from "@/hooks/useChatWithGemini";
import MessageList from "./chat/MessageList";
import ChatInput from "./chat/ChatInput";
import AnalysisButton from "./chat/AnalysisButton";
import ConversationSelector from "./chat/ConversationSelector";
import { supabase } from "@/integrations/supabase/client";
import { GeminiMessage } from "@/lib/gemini/types";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { PlusCircle, Save } from "lucide-react";

interface ChatBoxProps {
  sensorData: SensorData;
  apiKey: string;
  setApiKey: (key: string) => void;
}

const ChatBox = ({ sensorData, apiKey, setApiKey }: ChatBoxProps) => {
  const [lastSensorTimestamp, setLastSensorTimestamp] = useState(sensorData.timestamp);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  
  // Initialize or fetch existing conversation on load
  useEffect(() => {
    const initializeConversation = async () => {
      if (!apiKey) return;
      
      try {
        // Check for existing conversations
        const { data, error } = await supabase
          .from('chat_conversations')
          .select('id, title')
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Load the most recent conversation
          setCurrentConversationId(data[0].id);
          await loadConversationMessages(data[0].id);
        } else if (messages.length > 0) {
          // If we have messages but no saved conversation, create one
          await createNewConversation();
        }
      } catch (error) {
        console.error("Error initializing conversation:", error);
      }
    };
    
    initializeConversation();
  }, [apiKey]);
  
  // Load messages when conversation changes
  const loadConversationMessages = async (conversationId: string) => {
    if (!conversationId) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const formattedMessages: GeminiMessage[] = data.map(msg => ({
          role: msg.role as 'user' | 'model',
          parts: [{ text: msg.message }]
        }));
        
        setMessages(formattedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error loading conversation messages:", error);
      toast.error("Failed to load conversation");
    }
  };
  
  // Create a new conversation
  const createNewConversation = async () => {
    if (!apiKey) {
      toast.warning("API key required", {
        description: "Please enter a valid Gemini API key to start a conversation"
      });
      return;
    }
    
    try {
      const title = `Conversation ${new Date().toLocaleString()}`;
      
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert([{ title }])
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        toast.success("New conversation created");
        setCurrentConversationId(data[0].id);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create new conversation");
    }
  };
  
  // Save messages to the current conversation
  const saveMessages = async () => {
    if (!currentConversationId || messages.length === 0) return;
    
    setIsSaving(true);
    
    try {
      // First delete any existing messages for this conversation
      await supabase
        .from('chat_messages')
        .delete()
        .eq('conversation_id', currentConversationId);
      
      // Then insert all current messages
      const messagesToSave = messages.map(msg => ({
        conversation_id: currentConversationId,
        role: msg.role,
        message: msg.parts[0].text,
      }));
      
      const { error } = await supabase
        .from('chat_messages')
        .insert(messagesToSave);
        
      if (error) throw error;
      
      console.log("Conversation saved successfully");
    } catch (error) {
      console.error("Error saving messages:", error);
      toast.error("Failed to save conversation");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle selecting a conversation from the history
  const handleSelectConversation = async (conversationId: string) => {
    if (currentConversationId === conversationId) return;
    
    // If we have unsaved changes, save them first
    if (currentConversationId && messages.length > 0) {
      await saveMessages();
    }
    
    setCurrentConversationId(conversationId);
    await loadConversationMessages(conversationId);
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
      <div className="flex items-center justify-between px-1 py-2 border-b">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={createNewConversation}
            title="New Conversation"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New</span>
          </Button>
          <ConversationSelector 
            onSelectConversation={handleSelectConversation}
            currentConversationId={currentConversationId}
          />
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={saveMessages} 
          disabled={isSaving || messages.length === 0 || !currentConversationId}
          title="Save Conversation"
        >
          <Save className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Save</span>
        </Button>
      </div>
      
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
                <li>Explaining your sensor readings and trends</li>
                <li>Comparing current readings to historical data</li>
                <li>Providing treatment recommendations</li>
                <li>Suggesting sustainable rainwater usage options</li>
              </ul>
              <p className="mt-2 italic">Try asking about your pH readings, temperature trends, or water quality metrics!</p>
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
