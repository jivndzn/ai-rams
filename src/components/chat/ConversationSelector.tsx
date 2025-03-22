
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { History, Loader2 } from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

interface ConversationSelectorProps {
  onSelectConversation: (id: string) => void;
  currentConversationId: string | null;
}

const ConversationSelector = ({ 
  onSelectConversation, 
  currentConversationId 
}: ConversationSelectorProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch conversations when the dialog opens
  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setConversations(data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (id: string) => {
    onSelectConversation(id);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
          onClick={() => fetchConversations()}
        >
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">History</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chat History</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-center text-muted-foreground">No conversations found</p>
          ) : (
            <ScrollArea className="h-[50vh] pr-4">
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <Button
                    key={conversation.id}
                    variant={currentConversationId === conversation.id ? "default" : "outline"}
                    className="w-full justify-start text-left"
                    onClick={() => handleSelect(conversation.id)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium truncate">{conversation.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConversationSelector;
