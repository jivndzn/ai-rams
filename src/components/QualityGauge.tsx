
import { cn } from "@/lib/utils";
import { getQualityColor, getQualityDescription } from "@/lib/sensors";

interface QualityGaugeProps {
  value: number;
  className?: string;
}

const QualityGauge = ({ value, className }: QualityGaugeProps) => {
  // Calculate the position (0-100 scale)
  const position = Math.min(Math.max(value, 0), 100);
  const qualityColor = getQualityColor(value);
  const description = getQualityDescription(value);
  
  return (
    <div className={cn("water-quality-gauge relative w-full h-24 rounded-full bg-gray-200", className)}>
      {/* Fill level */}
      <div
        className={cn("absolute left-0 top-0 bottom-0 rounded-full transition-all duration-1000", qualityColor)}
        style={{ width: `${position}%` }}
      >
        {/* Ripple animations */}
        <div className="ripple-animation" style={{ left: "25%", top: "50%", width: "20px", height: "20px" }}></div>
        <div className="ripple-animation" style={{ left: "65%", top: "30%", width: "15px", height: "15px", animationDelay: "0.5s" }}></div>
        <div className="ripple-animation" style={{ left: "45%", top: "65%", width: "12px", height: "12px", animationDelay: "1s" }}></div>
      </div>
      
      {/* Value indicator */}
      <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-semibold z-10">
        {value.toFixed(0)}% - {description}
      </div>
    </div>
  );
};

export default QualityGauge;
