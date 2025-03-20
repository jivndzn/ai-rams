
import { Droplet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PhGauge from "@/components/PhGauge";
import { useTheme } from "@/providers/ThemeProvider";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PhCardProps {
  phValue: number | undefined;
  avgPh?: number;
}

const PhCard = ({ phValue, avgPh }: PhCardProps) => {
  // Use a safe value for display logic
  const safeValue = typeof phValue === 'number' ? phValue : 7.0;
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Check if pH value is likely uncalibrated
  const isUncalibrated = safeValue > 14 || safeValue < 0;
  
  return (
    <Card className={isDarkMode ? "bg-slate-900 border-slate-800 shadow-lg" : "bg-white border-slate-200 shadow-md"}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Droplet className="mr-2 h-5 w-5 text-blue-400" />
          pH Level
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isUncalibrated ? (
          <Alert variant="destructive" className="mb-3">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sensor Calibration Error</AlertTitle>
            <AlertDescription>
              pH reading of {safeValue.toFixed(2)} is outside the normal range (0-14). 
              The sensor likely needs calibration.
            </AlertDescription>
          </Alert>
        ) : (
          <PhGauge value={phValue} />
        )}
        
        <div className="mt-6 space-y-2">
          <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            {isUncalibrated 
              ? "Sensor calibration needed" 
              : safeValue < 7 
                ? "Acidic water (pH < 7)" 
                : safeValue > 7 
                  ? "Alkaline water (pH > 7)" 
                  : "Neutral water (pH = 7)"}
          </p>
          
          {typeof avgPh === 'number' && (
            <p className={`text-xs ${isDarkMode ? "text-slate-500 border-slate-800" : "text-slate-500 border-slate-200"} border-t pt-2 mt-2`}>
              Average pH (last 10 readings): <span className={`font-medium ${isDarkMode ? "text-slate-300" : "text-slate-800"}`}>{avgPh.toFixed(1)}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PhCard;
