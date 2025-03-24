
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getCurrentDateFormatted } from "@/lib/datetime";
import { useState, useEffect } from "react";

interface DashboardTopBarProps {
  onViewHistory: () => void;
}

const DashboardTopBar = ({ onViewHistory }: DashboardTopBarProps) => {
  const [currentTime, setCurrentTime] = useState<string>(getCurrentDateFormatted());
  
  // Update date/time regularly
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(getCurrentDateFormatted());
    };
    
    // Update time every minute
    const intervalId = setInterval(updateTime, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold">Water Quality Dashboard</h2>
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          {currentTime}
        </div>
        <Button 
          variant="outline" 
          onClick={onViewHistory}
        >
          View Full History
        </Button>
      </div>
    </div>
  );
};

export default DashboardTopBar;
