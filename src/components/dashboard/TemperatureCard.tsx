import { Thermometer, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import TemperatureGauge from "@/components/TemperatureGauge";
import { useTheme } from "@/providers/ThemeProvider";
import { Badge } from "@/components/ui/badge";

interface TemperatureCardProps {
  temperatureValue: number;
  avgTemp?: number;
}

const TemperatureCard = ({ temperatureValue, avgTemp }: TemperatureCardProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  const isAbnormal = temperatureValue < 0 || temperatureValue > 40;
  
  const displayValue = isAbnormal ? 22 : temperatureValue;
  
  return (
    <Card className={isDarkMode ? "bg-slate-900 border-slate-800 shadow-lg" : "bg-white border-slate-200 shadow-md"}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center">
            <Thermometer className="mr-2 h-5 w-5 text-orange-500" />
            Temperature
          </div>
          
          {isAbnormal && (
            <Badge variant="destructive" className="ml-auto">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Sensor Error
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TemperatureGauge value={displayValue} isError={isAbnormal} />
        <div className="mt-6 space-y-2">
          {isAbnormal ? (
            <p className={`text-sm font-medium text-destructive`}>
              Invalid reading detected: {temperatureValue}°C
            </p>
          ) : (
            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              {temperatureValue < 15 
                ? "Cool water temperature" 
                : temperatureValue > 25 
                  ? "Warm water temperature" 
                  : "Moderate water temperature"}
            </p>
          )}
          
          {avgTemp !== undefined && avgTemp > 0 && (
            <p className={`text-xs ${isDarkMode ? "text-slate-500 border-slate-800" : "text-slate-500 border-slate-200"} border-t pt-2 mt-2`}>
              Average temperature (last 10 readings): <span className={`font-medium ${isDarkMode ? "text-slate-300" : "text-slate-800"}`}>{avgTemp.toFixed(1)}°C</span>
            </p>
          )}
        </div>
      </CardContent>
      
      {isAbnormal && (
        <CardFooter className={`pt-0 text-xs ${isDarkMode ? "text-amber-400" : "text-amber-700"}`}>
          <p>Check sensor connection or calibration. Using default display value.</p>
        </CardFooter>
      )}
    </Card>
  );
};

export default TemperatureCard;
