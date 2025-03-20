
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/ThemeProvider";

interface TemperatureGaugeProps {
  value: number | undefined;
  className?: string;
}

const TemperatureGauge = ({ value, className }: TemperatureGaugeProps) => {
  // Handle undefined or null values with a default
  const safeValue = typeof value === 'number' ? value : 22.0;
  
  // Calculate the temperature visualization (assuming range of 0-40°C)
  const position = Math.min(Math.max(safeValue, 0), 40) / 40 * 100;
  
  // Determine color based on temperature
  let tempColor = "bg-blue-500";
  if (safeValue > 30) {
    tempColor = "bg-red-500";
  } else if (safeValue > 20) {
    tempColor = "bg-orange-400";
  }
  
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
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
