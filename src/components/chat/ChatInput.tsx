
import { Send, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  handleSendMessage: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  apiKey?: string;
  onUpdateSensors?: () => void;
}

const ChatInput = ({ 
  input, 
  setInput, 
  handleSendMessage, 
  handleKeyDown,
  isLoading,
  onUpdateSensors
}: ChatInputProps) => {
  return (
    <div className="relative mt-auto">
      <div className="flex space-x-2 mb-2">
        {onUpdateSensors && (
          <Button
            variant="outline"
            size="sm"
            onClick={onUpdateSensors}
            disabled={isLoading}
            className="flex items-center"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
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
