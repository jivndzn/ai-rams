
import { Send, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  handleSendMessage: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  apiKey: string;
  onUpdateSensorsClick?: () => void;
}

const ChatInput = ({ 
  input, 
  setInput, 
  handleSendMessage, 
  handleKeyDown,
  isLoading,
  onUpdateSensorsClick
}: ChatInputProps) => {
  return (
    <div className="relative mt-auto">
      <div className="flex items-center space-x-2 mb-2">
        {onUpdateSensorsClick && (
          <Button 
            variant="secondary"
            size="sm"
            className="text-xs bg-cyan-500 hover:bg-cyan-600 text-white"
            onClick={onUpdateSensorsClick}
            disabled={isLoading}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Update Sensors
          </Button>
        )}
      </div>
      
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about your water quality..."
        className="resize-none pr-12"
        rows={2}
        disabled={isLoading}
      />
      <Button
        size="icon"
        className="absolute right-2 bottom-2"
        onClick={handleSendMessage}
        disabled={isLoading || !input.trim()}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ChatInput;
