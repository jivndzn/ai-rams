
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
import { History, Loader2, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

interface ConversationSelectorProps {
  onSelectConversation: (id: string) => void;
  currentConversationId: string | null;
  onRenameConversation?: (id: string, newTitle: string) => Promise<boolean>;
}

const ConversationSelector = ({ 
  onSelectConversation, 
  currentConversationId,
  onRenameConversation
}: ConversationSelectorProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

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

  const startEditing = (id: string, currentTitle: string) => {
    setEditingId(id);
    setNewTitle(currentTitle);
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingId || !newTitle.trim() || !onRenameConversation) {
      return;
    }

    try {
      const success = await onRenameConversation(editingId, newTitle.trim());
      
      if (success) {
        // Update the conversation in the local state
        setConversations(conversations.map(conv => 
          conv.id === editingId ? { ...conv, title: newTitle.trim() } : conv
        ));
        
        toast.success("Conversation renamed");
      }
    } catch (error) {
      console.error("Error renaming conversation:", error);
      toast.error("Failed to rename conversation");
    } finally {
      setEditingId(null);
      setNewTitle("");
    }
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
                  <div key={conversation.id} className="relative">
                    {editingId === conversation.id ? (
                      <form onSubmit={handleRename} className="flex gap-2">
                        <Input
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          autoFocus
                          className="flex-1"
                        />
                        <Button type="submit" size="sm">Save</Button>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </form>
                    ) : (
                      <Button
                        variant={currentConversationId === conversation.id ? "default" : "outline"}
                        className="w-full justify-between text-left group"
                        onClick={() => handleSelect(conversation.id)}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium truncate">{conversation.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        {onRenameConversation && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(conversation.id, conversation.title);
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        )}
                      </Button>
                    )}
                  </div>
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
