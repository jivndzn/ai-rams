
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/ThemeProvider";
import { AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TemperatureGaugeProps {
  value: number | undefined;
  className?: string;
}

const TemperatureGauge = ({ value, className }: TemperatureGaugeProps) => {
  // Handle undefined or null values with a default
  const safeValue = typeof value === 'number' ? value : 22.0;
  
  // Check if value is invalid
  const isInvalid = safeValue === -127 || safeValue < -50 || safeValue > 125;
  
  // Constrain the value for visualization only (0-40°C range)
  const displayValue = isInvalid ? 22.0 : safeValue;
  const constrainedValue = Math.min(Math.max(displayValue, 0), 40);
  const position = (constrainedValue / 40) * 100;
  
  // Determine color based on temperature
  let tempColor = "bg-blue-500";
  if (displayValue > 30) {
    tempColor = "bg-red-500";
  } else if (displayValue > 20) {
    tempColor = "bg-orange-400";
  }
  
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  if (isInvalid) {
    return (
      <div className="text-center space-y-2">
        <div className={cn(
          "relative w-full h-12 rounded-full overflow-hidden", 
          isDarkMode ? "bg-slate-800/50" : "bg-gray-200",
          className
        )}>
          <div className="absolute inset-0 flex justify-between px-2 items-center text-xs text-gray-500">
            <span>0°C</span>
            <span>20°C</span>
            <span>40°C</span>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center text-amber-500 animate-pulse">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="font-medium">Sensor Error</span>
            </div>
          </div>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="text-sm text-amber-500 flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              <span>Reading: {safeValue}°C (Out of range)</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>The temperature reading is outside the expected range.</p>
              <p>This usually indicates a sensor connection or calibration issue.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "relative w-full h-12 rounded-full overflow-hidden", 
      isDarkMode ? "bg-slate-800/50" : "bg-gray-200",
      className
    )}>
      {/* Temperature scale markings */}
      <div className="absolute inset-0 flex justify-between px-2 items-center text-xs text-gray-500">
        <span>0°C</span>
        <span>20°C</span>
        <span>40°C</span>
      </div>
      
      {/* Value indicator */}
      <div 
        className="absolute top-0 bottom-0 flex items-center justify-center"
        style={{ 
          left: `${position}%`, 
          transform: "translateX(-50%)",
          zIndex: 20
        }}
      >
        <div className={cn("h-12 w-3 rounded-full", tempColor)}>
          <span className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 font-medium ${isDarkMode ? "text-slate-300" : ""}`}>
            {safeValue.toFixed(1)}°C
          </span>
        </div>
      </div>
    </div>
  );
};

export default TemperatureGauge;
