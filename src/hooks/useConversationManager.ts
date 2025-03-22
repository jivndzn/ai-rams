
import { useState, useRef, useEffect } from "react";
import { GeminiMessage } from "@/lib/gemini/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseConversationManagerProps {
  messages: GeminiMessage[];
  apiKey: string;
}

export const useConversationManager = ({ messages, apiKey }: UseConversationManagerProps) => {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Load messages for a specific conversation
  const loadConversationMessages = async (conversationId: string) => {
    if (!conversationId) return [];
    
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
        
        return formattedMessages;
      } 
      return [];
    } catch (error) {
      console.error("Error loading conversation messages:", error);
      toast.error("Failed to load conversation");
      return [];
    }
  };
  
  // Create a new conversation
  const createNewConversation = async () => {
    if (!apiKey) {
      toast.warning("API key required", {
        description: "Please enter a valid Gemini API key to start a conversation"
      });
      return null;
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
        return data[0].id;
      }
      return null;
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create new conversation");
      return null;
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

  // Rename a conversation
  const renameConversation = async (conversationId: string, newTitle: string): Promise<boolean> => {
    if (!conversationId || !newTitle.trim()) return false;
    
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ title: newTitle })
        .eq('id', conversationId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Error renaming conversation:", error);
      toast.error("Failed to rename conversation");
      return false;
    }
  };

  return {
    currentConversationId,
    setCurrentConversationId,
    isSaving,
    saveTimeoutRef,
    loadConversationMessages,
    createNewConversation,
    saveMessages,
    renameConversation
  };
};
