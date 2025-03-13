
import { Droplet } from "lucide-react";

const DashboardHeader = () => {
  return (
    <header className="mb-8">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center">
        <Droplet className="mr-2 h-8 w-8 text-aqua-500" />
        AquaBot: Rainwater Quality Analyzer
      </h1>
      <p className="text-muted-foreground mt-2">
        Real-time rainwater quality analysis and usage recommendations
      </p>
    </header>
  );
};

export default DashboardHeader;
