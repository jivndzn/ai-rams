
import { cn } from "@/lib/utils";
import { getPhColor } from "@/lib/sensors";

interface PhGaugeProps {
  value: number | undefined;
  className?: string;
}

const PhGauge = ({ value, className }: PhGaugeProps) => {
  // Handle undefined or null values with a default
  const safeValue = typeof value === 'number' ? value : 7.0;
  
  // Calculate the position along the gauge (0-14 pH scale)
  const position = Math.min(Math.max(safeValue, 0), 14) / 14 * 100;
  
  // Get the appropriate color for the pH value
  const phColor = getPhColor(safeValue);
  
  return (
    <div className={cn("relative w-full h-12 rounded-full bg-gray-200 overflow-hidden", className)}>
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
          <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 font-medium">
            {safeValue.toFixed(1)}
          </span>
        </div>
      </div>
      
      {/* Neutral marker */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-gray-400"
        style={{ left: "50%", transform: "translateX(-50%)" }}
      />
    </div>
  );
};

export default PhGauge;
