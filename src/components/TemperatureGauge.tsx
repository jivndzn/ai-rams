
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/ThemeProvider";
import { AlertTriangle, Thermometer } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TemperatureGaugeProps {
  value: number | undefined;
  className?: string;
  isError?: boolean;
}

const TemperatureGauge = ({ value, className, isError = false }: TemperatureGaugeProps) => {
  // Special check for DS18B20 temperature sensor error code (-127.0°C)
  const isDS18B20Error = typeof value === 'number' && value === -127.0;
  
  // Explicitly check for temperature sensor calibration errors
  const isTempCalibrationError = isDS18B20Error || value === -127.0;
  const isOutOfRange = typeof value === 'number' && (value < 0 || value > 40);
  const hasError = isError || isTempCalibrationError || isOutOfRange;
  
  // Handle undefined or null values with a default
  const safeValue = typeof value === 'number' ? value : 22.0;
  
  // For display purposes, use a sensible default when -127.0 is detected
  const displayValue = isTempCalibrationError ? 22.0 : safeValue;
  
  // Calculate the temperature visualization (assuming range of 0-40°C)
  const position = Math.min(Math.max(displayValue, 0), 40) / 40 * 100;
  
  // Determine color based on temperature
  let tempColor = "bg-blue-500";
  if (displayValue > 30) {
    tempColor = "bg-red-500";
  } else if (displayValue > 20) {
    tempColor = "bg-orange-400";
  }
  
  // If in error state, override the color
  if (hasError) {
    tempColor = "bg-destructive";
  }
  
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Error message specific to DS18B20 sensor
  const errorMessage = isDS18B20Error 
    ? "DS18B20 sensor error (-127.0°C). This indicates the sensor is disconnected or malfunctioning."
    : isOutOfRange 
      ? `Temperature value ${safeValue}°C is outside expected range (0-40°C). Check sensor calibration.`
      : "Sensor error detected. Please check connections and calibration.";
  
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
            {hasError ? (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger>
                    <AlertTriangle className="h-3 w-3 text-destructive" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">{errorMessage}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              `${displayValue.toFixed(1)}°C`
            )}
          </span>
        </div>
      </div>
      
      {/* Error overlay */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`px-3 py-1 text-xs font-medium rounded-full ${isDarkMode ? "bg-red-900/40 text-red-300" : "bg-red-100 text-red-800"}`}>
            {isDS18B20Error 
              ? 'DS18B20 Sensor Error (-127.0°C)' 
              : isOutOfRange 
                ? `Out of Range (${safeValue.toFixed(1)}°C)`
                : 'Sensor Calibration Error'}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemperatureGauge;
