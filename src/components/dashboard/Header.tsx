
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
    </div>
  );
};

export default DashboardHeader;
