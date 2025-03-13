
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalysisButtonProps {
  handleAutoAnalysis: () => void;
  isLoading: boolean;
}

const AnalysisButton = ({ handleAutoAnalysis, isLoading }: AnalysisButtonProps) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="mt-2"
      onClick={handleAutoAnalysis}
      disabled={isLoading}
    >
      <Sparkles className="h-4 w-4 mr-2" />
      Generate New Analysis
    </Button>
  );
};

export default AnalysisButton;
