
import { Droplet, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PhGauge from "@/components/PhGauge";
import { useTheme } from "@/providers/ThemeProvider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PhCardProps {
  phValue: number | undefined;
  avgPh?: number;
}

const PhCard = ({ phValue, avgPh }: PhCardProps) => {
  // Use a safe value for display logic
  const safeValue = typeof phValue === 'number' ? phValue : 7.0;
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Check for sensor calibration issues
  const isOutOfRange = safeValue < 0 || safeValue > 14;
  const isCalibrationError = safeValue > 14 && (safeValue >= 29.9 && safeValue <= 30.0);
  const hasError = isOutOfRange || isCalibrationError;
  
  return (
    <Card className={isDarkMode ? "bg-slate-900 border-slate-800 shadow-lg" : "bg-white border-slate-200 shadow-md"}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Droplet className="mr-2 h-5 w-5 text-blue-400" />
          pH Level
          {hasError && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger className="ml-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="max-w-xs">
                    <p className="font-semibold text-sm">Sensor Calibration Required</p>
                    <p className="text-xs mt-1">
                      {isCalibrationError 
                        ? 'pH reading of ~29.95 indicates the sensor needs calibration. This is a common default value when uncalibrated.' 
                        : `pH value ${safeValue.toFixed(1)} is outside the valid range (0-14).`}
                    </p>
                    <p className="text-xs mt-2">Troubleshooting steps:</p>
                    <ol className="text-xs list-decimal ml-4 mt-1">
                      <li>Check sensor connections</li>
                      <li>Verify pH probe is submerged in water</li>
                      <li>Run the calibration procedure</li>
                      <li>Consider replacing the probe if issues persist</li>
                    </ol>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <PhGauge value={phValue} />
        <div className="mt-6 space-y-2">
          {hasError ? (
            <div className={`p-2 rounded-md ${isDarkMode ? "bg-red-900/30 text-red-300" : "bg-red-50 text-red-800"}`}>
              <p className="text-sm font-medium">Sensor Calibration Issue Detected</p>
              <p className="text-xs mt-1">
                {isCalibrationError 
                  ? 'The pH sensor is reporting a value of ~29.95, indicating it requires calibration.' 
                  : `The pH reading (${safeValue.toFixed(1)}) is outside the normal range of 0-14.`}
              </p>
            </div>
          ) : (
            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              {safeValue < 7 
                ? "Acidic water (pH < 7)" 
                : safeValue > 7 
                  ? "Alkaline water (pH > 7)" 
                  : "Neutral water (pH = 7)"}
            </p>
          )}
          
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
