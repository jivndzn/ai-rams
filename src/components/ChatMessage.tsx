
import { cn } from "@/lib/utils";
import { GeminiMessage } from "@/lib/gemini";

interface ChatMessageProps {
  message: GeminiMessage;
  className?: string;
}

const ChatMessage = ({ message, className }: ChatMessageProps) => {
  const isUser = message.role === "user";
  
  // Format the message content to handle markdown
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
