
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalysisButtonProps {
  handleAutoAnalysis: () => void;
  isLoading: boolean;
}

const AnalysisButton = ({ handleAutoAnalysis, isLoading }: AnalysisButtonProps) => {
  return (
    <Button 
      variant="default" 
      className="mt-2 w-full bg-teal-600 hover:bg-teal-700"
      onClick={handleAutoAnalysis}
      disabled={isLoading}
    >
      <Sparkles className="h-4 w-4 mr-2" />
      Get Optimal Recommendations
    </Button>
  );
};

export default AnalysisButton;
