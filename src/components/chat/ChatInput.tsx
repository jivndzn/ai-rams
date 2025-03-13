
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  handleSendMessage: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  apiKey: string;
}

const ChatInput = ({ 
  input, 
  setInput, 
  handleSendMessage, 
  handleKeyDown,
  isLoading,
  apiKey
}: ChatInputProps) => {
  return (
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
  );
};

export default ChatInput;
