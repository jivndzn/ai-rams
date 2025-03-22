
import { Button } from "@/components/ui/button";
import { PlusCircle, Save } from "lucide-react";
import ConversationSelector from "./ConversationSelector";

interface ConversationControlsProps {
  createNewConversation: () => void;
  saveMessages: () => void;
  isSaving: boolean;
  messagesCount: number;
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => Promise<boolean>;
}

const ConversationControls = ({
  createNewConversation,
  saveMessages,
  isSaving,
  messagesCount,
  currentConversationId,
  onSelectConversation,
  onRenameConversation
}: ConversationControlsProps) => {
  return (
    <div className="flex items-center justify-between px-1 py-2 border-b">
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={createNewConversation}
          title="New Conversation"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">New</span>
        </Button>
        <ConversationSelector 
          onSelectConversation={onSelectConversation}
          currentConversationId={currentConversationId}
          onRenameConversation={onRenameConversation}
        />
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={saveMessages} 
        disabled={isSaving || messagesCount === 0 || !currentConversationId}
        title="Save Conversation"
      >
        <Save className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Save</span>
      </Button>
    </div>
  );
};

export default ConversationControls;
