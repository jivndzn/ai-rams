
import { cn } from "@/lib/utils";
import { getPhColor } from "@/lib/sensors";
import { useTheme } from "@/providers/ThemeProvider";
import { AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PhGaugeProps {
  value: number | undefined;
  className?: string;
}

const PhGauge = ({ value, className }: PhGaugeProps) => {
  // Handle undefined or null values with a default
  const safeValue = typeof value === 'number' ? value : 7.0;
  
  // Check if pH is outside valid range (0-14)
  const isInvalid = safeValue < 0 || safeValue > 14;
  
  // For display purposes, constrain to 0-14 range
  const displayValue = isInvalid ? 7.0 : safeValue;
  const position = Math.min(Math.max(displayValue, 0), 14) / 14 * 100;
  
  // Get the appropriate color for the pH value
  const phColor = getPhColor(displayValue);
  
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
            <span>0</span>
            <span>7</span>
            <span>14</span>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center text-amber-500 animate-pulse">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="font-medium">Calibration Required</span>
            </div>
          </div>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="text-sm text-amber-500 flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              <span>Reading: {safeValue.toFixed(2)} (Out of range)</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>The pH reading is outside the valid range of 0-14.</p>
              <p>This usually indicates a sensor calibration issue.</p>
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
      {/* pH scale markings */}
      <div className="absolute inset-0 flex justify-between px-2 items-center text-xs text-gray-500">
        <span>0</span>
        <span>7</span>
        <span>14</span>
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
        <div className={cn("h-12 w-3 rounded-full", phColor)}>
          <span className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 font-medium ${isDarkMode ? "text-slate-300" : ""}`}>
            {safeValue.toFixed(1)}
          </span>
        </div>
      </div>
      
      {/* Neutral marker */}
      <div 
        className={`absolute top-0 bottom-0 w-1 ${isDarkMode ? "bg-gray-600" : "bg-gray-400"}`}
        style={{ left: "50%", transform: "translateX(-50%)" }}
      />
    </div>
  );
};

export default PhGauge;
