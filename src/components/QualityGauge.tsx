
import { cn } from "@/lib/utils";
import { getQualityColor, getQualityDescription, getTurbidityDescription } from "@/lib/sensors";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    <div className="flex flex-col items-center space-y-2 w-full">
      <div className={cn("water-quality-gauge relative w-full h-24 rounded-full bg-slate-800/50 backdrop-blur-sm shadow-inner overflow-hidden border border-slate-700", className)}>
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
        
        {/* Measurement indicators */}
        <div className="absolute inset-0 flex justify-between items-center px-3 pointer-events-none">
          <div className="h-3 w-1 bg-white/20 rounded-full"></div>
          <div className="h-3 w-1 bg-white/20 rounded-full"></div>
          <div className="h-3 w-1 bg-white/20 rounded-full"></div>
        </div>
        
        {/* Value indicator - show the original value since that's what's in the database */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
          <div className="text-2xl font-bold font-mono">{safeValue.toFixed(0)}%</div>
          <div className="text-sm font-medium mt-1">{turbidityDescription}</div>
        </div>
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center text-xs text-muted-foreground cursor-help">
              <Info className="h-3 w-3 mr-1" />
              <span>Higher values indicate dirtier water</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="backdrop-blur-md bg-slate-800/90 border-slate-700">
            <p>Arduino sensor: 0% = Clear water, 100% = Dirty water</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default QualityGauge;
