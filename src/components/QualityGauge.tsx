
import { cn } from "@/lib/utils";
import { getQualityColor, getQualityDescription, getTurbidityDescription } from "@/lib/sensors";

interface QualityGaugeProps {
  value: number | undefined;
  className?: string;
}

const QualityGauge = ({ value, className }: QualityGaugeProps) => {
  // Handle undefined or null values with a default
  const safeValue = typeof value === 'number' ? value : 75;
  
  // Calculate the position (0-100 scale)
  // Since in the Arduino, 100% means dirty and 0% means clear,
  // we need to invert the position for visualization purposes
  const invertedValue = 100 - safeValue;
  const position = Math.min(Math.max(invertedValue, 0), 100);
  
  const qualityColor = getQualityColor(safeValue);
  const qualityDescription = getQualityDescription(safeValue);
  const turbidityDescription = getTurbidityDescription(safeValue);
  
  return (
    <div className={cn("water-quality-gauge relative w-full h-24 rounded-full bg-gray-200", className)}>
      {/* Fill level - using inverted position so higher "quality" means more filled */}
      <div
        className={cn("absolute left-0 top-0 bottom-0 rounded-full transition-all duration-1000", qualityColor)}
        style={{ width: `${position}%` }}
      >
        {/* Ripple animations */}
        <div className="ripple-animation" style={{ left: "25%", top: "50%", width: "20px", height: "20px" }}></div>
        <div className="ripple-animation" style={{ left: "65%", top: "30%", width: "15px", height: "15px", animationDelay: "0.5s" }}></div>
        <div className="ripple-animation" style={{ left: "45%", top: "65%", width: "12px", height: "12px", animationDelay: "1s" }}></div>
      </div>
      
      {/* Value indicator - show the original value since that's what's in the database */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
        <div className="text-xl font-semibold">{safeValue.toFixed(0)}%</div>
        <div className="text-sm">{turbidityDescription}</div>
      </div>
    </div>
  );
};

export default QualityGauge;
