
import { cn } from "@/lib/utils";
import { getPhColor } from "@/lib/sensors";
import { useTheme } from "@/providers/ThemeProvider";
import { AlertTriangle } from "lucide-react";

interface PhGaugeProps {
  value: number | undefined;
  className?: string;
}

const PhGauge = ({ value, className }: PhGaugeProps) => {
  // Handle undefined or null values with a default
  const safeValue = typeof value === 'number' ? value : 7.0;
  
  // Check for invalid pH readings
  const isOutOfRange = safeValue < 0 || safeValue > 14;
  
  // Use a valid display value for the gauge
  const displayValue = isOutOfRange ? 7.0 : safeValue;
  
  // Calculate the position along the gauge (0-14 pH scale)
  const position = Math.min(Math.max(displayValue, 0), 14) / 14 * 100;
  
  // Get the appropriate color for the pH value
  const phColor = isOutOfRange ? "bg-destructive" : getPhColor(displayValue);
  
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
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
            {isOutOfRange ? (
              <AlertTriangle className="h-3 w-3 text-destructive" />
            ) : (
              `${displayValue.toFixed(1)}`
            )}
          </span>
        </div>
      </div>
      
      {/* Neutral marker */}
      <div 
        className={`absolute top-0 bottom-0 w-1 ${isDarkMode ? "bg-gray-600" : "bg-gray-400"}`}
        style={{ left: "50%", transform: "translateX(-50%)" }}
      />
      
      {/* Error message for out of range values */}
      {isOutOfRange && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`px-3 py-1 text-xs font-medium rounded-full ${isDarkMode ? "bg-red-900/40 text-red-300" : "bg-red-100 text-red-800"}`}>
            Calibration Error: {safeValue}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhGauge;
