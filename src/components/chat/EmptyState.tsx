
import AnalysisButton from "./AnalysisButton";

interface EmptyStateProps {
  handleAutoAnalysis: () => void;
  isLoading: boolean;
}

const EmptyState = ({ handleAutoAnalysis, isLoading }: EmptyStateProps) => {
  return (
    <div className="text-center p-4">
      <p className="text-muted-foreground mb-2">Click the button below to generate a water analysis</p>
      <div className="mb-4">
        <AnalysisButton 
          handleAutoAnalysis={handleAutoAnalysis}
          isLoading={isLoading}
        />
      </div>
      <div className="mt-4 text-sm text-muted-foreground max-w-md mx-auto">
        <p className="mb-2 font-medium">I'm your friendly water assistant and can help with:</p>
        <ul className="list-disc list-inside text-left">
          <li>Analyzing your water quality data</li>
          <li>Explaining your sensor readings and trends</li>
          <li>Comparing current readings to historical data</li>
          <li>Providing treatment recommendations</li>
          <li>Suggesting sustainable rainwater usage options</li>
        </ul>
        <p className="mt-2 italic">Try asking about your pH readings, temperature trends, or water quality metrics!</p>
      </div>
    </div>
  );
};

export default EmptyState;
