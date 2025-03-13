
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";
import { SensorData } from "@/lib/sensors";
import { GeminiMessage, chatWithGemini, getWaterRecommendation } from "@/lib/gemini";
import ChatMessage from "./ChatMessage";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatBoxProps {
  sensorData: SensorData;
  apiKey: string;
  setApiKey: (key: string) => void;
}

const ChatBox = ({ sensorData, apiKey, setApiKey }: ChatBoxProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<GeminiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

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

  const saveApiKey = () => {
    setApiKey(localApiKey);
    toast.success("API key saved");
  };

  return (
    <div className="flex flex-col h-full">
      {/* API Key input */}
      {!apiKey && (
        <div className="mb-4 p-4 border rounded-lg bg-muted">
          <p className="text-sm mb-2">Enter your Gemini API key to enable the chatbot:</p>
          <div className="flex gap-2">
            <Input
              type="password"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              placeholder="Gemini API Key"
              className="flex-1"
            />
            <Button onClick={saveApiKey}>Save</Button>
          </div>
        </div>
      )}
      
      {/* Chat messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4 mb-4">
        <div className="flex flex-col">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          {isLoading && (
            <div className="flex justify-center my-2">
              <div className="animate-pulse flex space-x-1">
                <div className="h-2 w-2 bg-primary rounded-full"></div>
                <div className="h-2 w-2 bg-primary rounded-full delay-75"></div>
                <div className="h-2 w-2 bg-primary rounded-full delay-150"></div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Chat input */}
      <div className="relative mt-auto">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your water quality..."
          className="resize-none pr-12"
          rows={2}
          disabled={isLoading || !apiKey}
        />
        <Button
          size="icon"
          className="absolute right-2 bottom-2"
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim() || !apiKey}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Auto-analysis button */}
      {apiKey && (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={handleAutoAnalysis}
          disabled={isLoading}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Generate New Analysis
        </Button>
      )}
    </div>
  );
};

export default ChatBox;
