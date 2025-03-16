
import { useRef, useEffect } from "react";
import { GeminiMessage } from "@/lib/gemini";
import ChatMessage from "../ChatMessage";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MessageListProps {
  messages: GeminiMessage[];
  isLoading: boolean;
}

const MessageList = ({ messages, isLoading }: MessageListProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={scrollAreaRef} 
      className="flex-1 pr-4 mb-4 overflow-y-auto max-h-[calc(100vh-20rem)]"
    >
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
    </div>
  );
};

export default MessageList;
