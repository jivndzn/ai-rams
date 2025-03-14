
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { validateApiKeyFormat } from "@/lib/env";
import { Info } from "lucide-react";

interface ApiKeyInputProps {
  localApiKey: string;
  setLocalApiKey: (key: string) => void;
  saveApiKey: (key: string) => void;
}

const ApiKeyInput = ({ localApiKey, setLocalApiKey, saveApiKey }: ApiKeyInputProps) => {
  const [isValidFormat, setIsValidFormat] = useState(validateApiKeyFormat(localApiKey));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalApiKey(newValue);
    setIsValidFormat(validateApiKeyFormat(newValue));
  };

  const handleSaveApiKey = () => {
    if (!isValidFormat) {
      toast.error("Invalid API key format", {
        description: "Please enter a valid Gemini API key"
      });
      return;
    }
    
    saveApiKey(localApiKey);
    toast.success("API key saved", {
      description: "Your API key has been securely stored for this session"
    });
  };

  return (
    <div className="mb-4 p-4 border rounded-lg bg-muted">
      <div className="flex items-center gap-2 mb-2">
        <p className="text-sm">Enter your Gemini API key to enable the research assistant:</p>
        <div className="tooltip cursor-help" data-tip="The API key is stored locally and never sent to our servers">
          <Info className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="flex gap-2">
        <Input
          type="password"
          value={localApiKey}
          onChange={handleInputChange}
          placeholder="Gemini API Key"
          className={`flex-1 ${!isValidFormat && localApiKey ? 'border-red-300' : ''}`}
        />
        <Button 
          onClick={handleSaveApiKey}
          disabled={!isValidFormat}
        >
          Save
        </Button>
      </div>
      <p className="text-xs mt-2 text-muted-foreground">
        {!isValidFormat && localApiKey ? 
          <span className="text-red-400">Please enter a valid API key</span> :
          "The AI assistant provides research-grade analysis of water quality parameters"
        }
      </p>
      <p className="text-xs mt-1 text-muted-foreground">
        You can also set the API key using the VITE_GEMINI_API_KEY environment variable.
      </p>
    </div>
  );
};

export default ApiKeyInput;
