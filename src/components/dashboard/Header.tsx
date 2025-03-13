
import { DropletIcon } from "lucide-react";

const DashboardHeader = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center">
        <DropletIcon className="h-8 w-8 text-teal-500 mr-2" />
        <h1 className="text-2xl font-bold">AI-RAMS: AI-Integrated Rainwater Management System</h1>
      </div>
      <p className="text-muted-foreground mt-2">
        Real-time monitoring and AI-driven analysis for optimal rainwater utilization
      </p>
      <div className="mt-4 p-4 bg-muted rounded-lg text-sm">
        <p className="font-medium mb-1">Research Abstract:</p>
        <p className="text-muted-foreground">
          This system addresses water scarcity challenges by combining rainwater harvesting with 
          real-time pH monitoring and AI-driven decision-making. It leverages sensor technology, 
          automation, and machine learning to assess and optimize water quality for various domestic 
          applications. The prototype demonstrates significant enhancements in water conservation 
          while ensuring safe water quality through automated adjustments.
        </p>
      </div>
    </div>
  );
};

export default DashboardHeader;
