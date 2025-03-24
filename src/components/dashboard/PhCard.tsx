
import { Droplet, AlertTriangle, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/ThemeProvider";
import PhGauge from "@/components/PhGauge";
import { formatTimestamp } from "@/lib/datetime";

interface PhCardProps {
  phValue: number | undefined;
  avgPh?: number;
  timestamp?: string | number | Date;
}

const PhCard = ({ phValue, avgPh, timestamp }: PhCardProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Handle undefined phValue
  const isDataMissing = phValue === undefined || phValue === null;
  
  // Check if pH value is likely uncalibrated (only if we have data)
  const isUncalibrated = !isDataMissing && (phValue > 14 || phValue < 0);
  
  return (
    <Card className="shadow-md overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg font-medium">
          <Droplet className="mr-2 h-5 w-5 text-blue-400" />
          pH Level
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isDataMissing ? (
          <Alert variant="default" className="mb-3 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <HelpCircle className="h-4 w-4" />
            <AlertTitle>No Data Available</AlertTitle>
            <AlertDescription>
              No pH readings have been received yet. Connect your sensors or add sample data.
            </AlertDescription>
          </Alert>
        ) : isUncalibrated ? (
          <Alert variant="destructive" className="mb-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Calibration Error</AlertTitle>
            <AlertDescription>
              pH reading of {phValue.toFixed(2)} is outside the normal range (0-14).
              Please check sensor calibration.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <PhGauge value={phValue} />
          </div>
        )}
        
        <div className="space-y-2 mt-4">
          <p className={cn(
            "text-sm border-b pb-2",
            isDarkMode ? "text-slate-300 border-slate-700" : "text-slate-600 border-slate-200"
          )}>
            {isDataMissing 
              ? "Waiting for pH data" 
              : isUncalibrated 
                ? "Sensor calibration needed" 
                : phValue < 7 
                  ? "Acidic water (pH < 7)" 
                  : phValue > 7 
                    ? "Alkaline water (pH > 7)" 
                    : "Neutral water (pH = 7)"}
          </p>
          
          {typeof avgPh === 'number' && avgPh > 0 && (
            <p className={cn(
              "text-sm pt-1",
              isDarkMode ? "text-slate-400" : "text-slate-500"
            )}>
              Average pH (last 10 readings): <span className="font-medium">{avgPh.toFixed(1)}</span>
            </p>
          )}
          
          {timestamp && (
            <p className={cn(
              "text-xs pt-1",
              isDarkMode ? "text-slate-400" : "text-slate-500"
            )}>
              Last updated: {formatTimestamp(timestamp)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PhCard;
