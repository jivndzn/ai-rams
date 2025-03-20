
import { Droplet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/ThemeProvider";

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
  
  // Calculate marker position (as percentage)
  const position = Math.min(Math.max(safeValue, 0), 14) / 14 * 100;
  
  return (
    <Card className="shadow-md overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg font-medium">
          <Droplet className="mr-2 h-5 w-5 text-blue-400" />
          pH Level
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isUncalibrated ? (
          <div className="p-4 mb-3 bg-amber-50 text-amber-700 rounded-md">
            <p className="text-sm font-medium">
              Sensor Calibration Error: pH reading of {safeValue.toFixed(2)} is outside the normal range (0-14).
            </p>
          </div>
        ) : (
          <div className="mt-2 mb-6">
            <div className="relative w-full h-10 bg-gray-200 rounded-full overflow-hidden">
              {/* pH scale labels */}
              <div className="absolute top-0 left-2 text-xs text-gray-500">0</div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">7</div>
              <div className="absolute top-0 right-2 text-xs text-gray-500">14</div>
              
              {/* Marker */}
              <div 
                className="absolute bottom-0 w-4 h-10"
                style={{ 
                  left: `${position}%`, 
                  transform: "translateX(-50%)",
                  backgroundColor: safeValue < 7 ? "#F59E0B" : safeValue > 7 ? "#3B82F6" : "#10B981",
                  borderRadius: "4px",
                }}
              />
              
              {/* Neutral marker line */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
                style={{ left: "50%", transform: "translateX(-50%)" }}
              />
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <p className={cn(
            "text-sm border-b pb-2",
            isDarkMode ? "text-slate-300 border-slate-700" : "text-slate-600 border-slate-200"
          )}>
            {isUncalibrated 
              ? "Sensor calibration needed" 
              : safeValue < 7 
                ? "Acidic water (pH < 7)" 
                : safeValue > 7 
                  ? "Alkaline water (pH > 7)" 
                  : "Neutral water (pH = 7)"}
          </p>
          
          {typeof avgPh === 'number' && (
            <p className={cn(
              "text-sm pt-1",
              isDarkMode ? "text-slate-400" : "text-slate-500"
            )}>
              Average pH (last 10 readings): <span className="font-medium">{avgPh.toFixed(1)}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PhCard;
