
import { cn } from "@/lib/utils";
import { GeminiMessage } from "@/lib/gemini";

interface ChatMessageProps {
  message: GeminiMessage;
  className?: string;
}

const ChatMessage = ({ message, className }: ChatMessageProps) => {
  const isUser = message.role === "user";
  
  // Format the message content to handle markdown and data formatting
  const formatMessageContent = (text: string): string => {
    if (isUser) return text;
    
    return text
      // Remove excessive # for headings and replace with styled headings
      .replace(/#{3,6}\s+(.+)$/gm, '<strong>$1</strong>')
      .replace(/##\s+(.+)$/gm, '<strong>$1</strong>')
      .replace(/#\s+(.+)$/gm, '<strong>$1</strong>')
      // Remove excessive asterisks
      .replace(/\*{3,}(.+?)\*{3,}/g, '<strong>$1</strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Highlight data points and measurements
      .replace(/(\d+\.?\d*)\s*(pH|ph)/g, '<span class="text-amber-600 font-semibold">$1 $2</span>')
      .replace(/(\d+\.?\d*)\s*°C/g, '<span class="text-blue-600 font-semibold">$1°C</span>')
      .replace(/(\d+\.?\d*)\s*%/g, '<span class="text-green-600 font-semibold">$1%</span>')
      .replace(/(\d+)\/100/g, '<span class="text-purple-600 font-semibold">$1/100</span>')
      // Create simple tables for data
      .replace(/\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g, '<div class="grid grid-cols-2 gap-2 my-1"><div class="font-medium">$1</div><div>$2</div></div>')
      // Preserve line breaks but strip extra ones
      .replace(/\n{3,}/g, '\n\n');
  };
  
  return (
    <div 
      className={cn(
        "flex w-full my-2",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      <div 
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%] shadow-sm",
          isUser 
            ? "bg-primary text-primary-foreground rounded-tr-none" 
            : "bg-muted rounded-tl-none"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.parts[0].text}</p>
        ) : (
          <div 
            className="whitespace-pre-wrap prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: formatMessageContent(message.parts[0].text) }}
          />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
