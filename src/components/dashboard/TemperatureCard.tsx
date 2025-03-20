
import { Thermometer, AlertTriangle, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import TemperatureGauge from "@/components/TemperatureGauge";
import { useTheme } from "@/providers/ThemeProvider";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TemperatureCardProps {
  temperatureValue: number;
  avgTemp?: number;
}

const TemperatureCard = ({ temperatureValue, avgTemp }: TemperatureCardProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Detect specific calibration errors in temperature sensor
  const isCalibrationError = temperatureValue === -127.0;
  const isOutOfRange = temperatureValue < 0 || temperatureValue > 40;
  const isAbnormal = isCalibrationError || isOutOfRange;
  
  // Use a display value that's safe for the gauge
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="destructive" className="ml-auto">
                    {isCalibrationError ? (
                      <>
                        <Settings className="h-3 w-3 mr-1 animate-spin" />
                        Calibration Error
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Sensor Error
                      </>
                    )}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Detected value: {temperatureValue}°C</p>
                  <p className="text-xs mt-1">
                    {isCalibrationError 
                      ? "The value -127.0°C indicates a sensor calibration issue" 
                      : "Temperature is outside the valid range of 0-40°C"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TemperatureGauge value={displayValue} isError={isAbnormal} />
        <div className="mt-6 space-y-2">
          {isAbnormal ? (
            <p className={`text-sm font-medium text-destructive`}>
              {isCalibrationError 
                ? "Sensor needs calibration (reading: -127.0°C)" 
                : `Invalid reading detected: ${temperatureValue}°C`}
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
      
      {isCalibrationError && (
        <CardFooter className={`pt-0 text-xs ${isDarkMode ? "text-amber-400" : "text-amber-700"}`}>
          <p>The -127.0°C reading is a known calibration issue with this type of sensor. Check Arduino wiring or code.</p>
        </CardFooter>
      )}
      
      {isOutOfRange && !isCalibrationError && (
        <CardFooter className={`pt-0 text-xs ${isDarkMode ? "text-amber-400" : "text-amber-700"}`}>
          <p>Reading outside valid range (0-40°C). Check sensor placement and calibration.</p>
        </CardFooter>
      )}
    </Card>
  );
};

export default TemperatureCard;
