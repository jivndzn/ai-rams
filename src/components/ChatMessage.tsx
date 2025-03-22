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
    
    let formattedText = text
      // Remove excessive # for headings and replace with styled headings
      .replace(/#{3,6}\s+(.+)$/gm, '<strong>$1</strong>')
      .replace(/##\s+(.+)$/gm, '<strong>$1</strong>')
      .replace(/#\s+(.+)$/gm, '<strong class="text-lg font-bold block mb-2">$1</strong>')
      // Remove excessive asterisks
      .replace(/\*{3,}(.+?)\*{3,}/g, '<strong>$1</strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Format data summaries with nice layout
      .replace(/Analysis Date:\s*([^\n]+)/g, '<div class="mb-1"><span class="font-bold">Analysis Date:</span> $1</div>')
      .replace(/Data Source:\s*([^\n]+)/g, '<div class="mb-2"><span class="font-bold">Data Source:</span> $1</div>')
      .replace(/(\d+)\.\s*Data Summary:/g, '<div class="font-bold text-base mb-2">$1. Data Summary:</div>')
      // Format water quality parameters with special styling
      .replace(/\*\s*pH Level:\s*(\d+\.?\d*)\s*\(([^)]+)\)/g, 
        '<div class="ml-2 mb-1">* <span class="font-semibold">pH Level:</span> <span class="text-amber-600 font-semibold">$1</span> <span class="text-muted-foreground">($2)</span></div>')
      .replace(/\*\s*Temperature:\s*(\d+\.?\d*)°C/g, 
        '<div class="ml-2 mb-1">* <span class="font-semibold">Temperature:</span> <span class="text-blue-600 font-semibold">$1°C</span></div>')
      .replace(/\*\s*Overall Water Quality Index:\s*(\d+)/g, 
        '<div class="ml-2 mb-1">* <span class="font-semibold">Overall Water Quality Index:</span> <span class="text-green-600 font-semibold">$1</span></div>')
      // Other parameter highlighting  
      .replace(/(\d+\.?\d*)\s*(pH|ph)/g, '<span class="text-amber-600 font-semibold">$1 $2</span>')
      .replace(/(\d+\.?\d*)\s*°C/g, '<span class="text-blue-600 font-semibold">$1°C</span>')
      .replace(/(\d+\.?\d*)\s*%/g, '<span class="text-green-600 font-semibold">$1%</span>')
      .replace(/(\d+)\/100/g, '<span class="text-purple-600 font-semibold">$1/100</span>')
      // Create simple tables for data
      .replace(/\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g, '<div class="grid grid-cols-2 gap-2 my-1"><div class="font-medium">$1</div><div>$2</div></div>')
      // Preserve line breaks but strip extra ones
      .replace(/\n{3,}/g, '\n\n');
      
    // Add a border around data summary sections
    if (formattedText.includes('Data Summary:')) {
      formattedText = formattedText.replace(
        /(<div class="font-bold text-base mb-2">\d+\. Data Summary:<\/div>[\s\S]*?)(<div class="font-bold|<\/div><\/div>$)/,
        '<div class="bg-muted/50 p-3 rounded-md border border-border mb-3">$1</div>$2'
      );
    }
      
    return formattedText;
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
