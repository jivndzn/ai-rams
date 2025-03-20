
import { Thermometer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TemperatureGauge from "@/components/TemperatureGauge";
import { useTheme } from "@/providers/ThemeProvider";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface TemperatureCardProps {
  temperatureValue: number;
  avgTemp?: number;
}

const TemperatureCard = ({ temperatureValue, avgTemp }: TemperatureCardProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Check if the temperature is showing a calibration error
  // -127°C is a common default value when the DS18B20 sensor is not properly connected
  const isCalibrationError = temperatureValue === -127 || temperatureValue < -50 || temperatureValue > 125;
  
  return (
    <Card className={isDarkMode ? "bg-slate-900 border-slate-800 shadow-lg" : "bg-white border-slate-200 shadow-md"}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Thermometer className="mr-2 h-5 w-5 text-orange-500" />
          Temperature
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isCalibrationError ? (
          <Alert variant="destructive" className="mb-3">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sensor Error</AlertTitle>
            <AlertDescription>
              Temperature reading of {temperatureValue}°C indicates a sensor connection or calibration error.
            </AlertDescription>
          </Alert>
        ) : (
          <TemperatureGauge value={temperatureValue} />
        )}
        
        <div className="mt-6 space-y-2">
          <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            {isCalibrationError 
              ? "Sensor needs attention" 
              : temperatureValue < 15 
                ? "Cool water temperature" 
                : temperatureValue > 25 
                  ? "Warm water temperature" 
                  : "Moderate water temperature"}
          </p>
          
          {avgTemp !== undefined && avgTemp > 0 && !isNaN(avgTemp) && (
            <p className={`text-xs ${isDarkMode ? "text-slate-500 border-slate-800" : "text-slate-500 border-slate-200"} border-t pt-2 mt-2`}>
              Average temperature (last 10 readings): <span className={`font-medium ${isDarkMode ? "text-slate-300" : "text-slate-800"}`}>{avgTemp.toFixed(1)}°C</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TemperatureCard;
