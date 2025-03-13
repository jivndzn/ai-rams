
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ApiKeyInputProps {
  localApiKey: string;
  setLocalApiKey: (key: string) => void;
  saveApiKey: (key: string) => void;
}

const ApiKeyInput = ({ localApiKey, setLocalApiKey, saveApiKey }: ApiKeyInputProps) => {
  const handleSaveApiKey = () => {
    saveApiKey(localApiKey);
    toast.success("API key saved");
  };

  return (
    <div className="mb-4 p-4 border rounded-lg bg-muted">
      <p className="text-sm mb-2">Enter your Gemini API key to enable the research assistant:</p>
      <div className="flex gap-2">
        <Input
          type="password"
          value={localApiKey}
          onChange={(e) => setLocalApiKey(e.target.value)}
          placeholder="Gemini API Key"
          className="flex-1"
        />
        <Button onClick={handleSaveApiKey}>Save</Button>
      </div>
      <p className="text-xs mt-2 text-muted-foreground">
        The AI assistant provides research-grade analysis of water quality parameters
      </p>
    </div>
  );
};

export default ApiKeyInput;
