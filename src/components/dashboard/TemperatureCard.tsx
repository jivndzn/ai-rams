
import { Thermometer, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/ThemeProvider";

interface TemperatureCardProps {
  temperatureValue: number | undefined;
  avgTemp?: number;
}

const TemperatureCard = ({ temperatureValue, avgTemp }: TemperatureCardProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Handle missing temperature data
  const isDataMissing = temperatureValue === undefined || temperatureValue === null;
  
  // Check if the temperature is showing a calibration error (only if we have data)
  // -127°C is a common default value when the DS18B20 sensor is not properly connected
  const isCalibrationError = !isDataMissing && (temperatureValue === -127 || temperatureValue < -50 || temperatureValue > 125);
  
  // Calculate marker position (as percentage for 0-40°C range)
  const safeValue = isDataMissing ? 22 : (isCalibrationError ? 22 : temperatureValue);
  const constrainedValue = Math.min(Math.max(safeValue, 0), 40);
  const position = (constrainedValue / 40) * 100;
  
  // Determine color based on temperature
  let tempColor = "#3B82F6"; // blue
  if (safeValue > 30) {
    tempColor = "#EF4444"; // red
  } else if (safeValue > 20) {
    tempColor = "#F97316"; // orange
  }
  
  return (
    <Card className="shadow-md overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg font-medium">
          <Thermometer className="mr-2 h-5 w-5 text-orange-500" />
          Temperature
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isDataMissing ? (
          <Alert variant="default" className="mb-3 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <HelpCircle className="h-4 w-4" />
            <AlertTitle>No Data Available</AlertTitle>
            <AlertDescription>
              No temperature readings have been received yet. Connect your sensors or add sample data.
            </AlertDescription>
          </Alert>
        ) : isCalibrationError ? (
          <div className="p-4 mb-3 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 rounded-md">
            <p className="text-sm font-medium">
              Sensor Error: Temperature reading of {temperatureValue}°C indicates a sensor connection issue.
            </p>
          </div>
        ) : (
          <div className="mt-2 mb-6">
            <div className="relative w-full h-10 bg-gray-200 rounded-full overflow-hidden">
              {/* Temperature scale labels */}
              <div className="absolute top-0 left-2 text-xs text-gray-500">0°C</div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">20°C</div>
              <div className="absolute top-0 right-2 text-xs text-gray-500">40°C</div>
              
              {/* Marker */}
              <div 
                className="absolute bottom-0 w-4 h-10"
                style={{ 
                  left: `${position}%`, 
                  transform: "translateX(-50%)",
                  backgroundColor: tempColor,
                  borderRadius: "4px",
                }}
              />
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <p className={cn(
            "text-sm border-b pb-2",
            isDarkMode ? "text-slate-300 border-slate-700" : "text-slate-600 border-slate-200"
          )}>
            {isDataMissing 
              ? "Waiting for temperature data" 
              : isCalibrationError 
                ? "Sensor needs attention" 
                : safeValue < 15 
                  ? "Cool water temperature" 
                  : safeValue > 25 
                    ? "Warm water temperature" 
                    : "Moderate water temperature"}
          </p>
          
          {avgTemp !== undefined && avgTemp > 0 && !isNaN(avgTemp) && (
            <p className={cn(
              "text-sm pt-1",
              isDarkMode ? "text-slate-400" : "text-slate-500"
            )}>
              Average temperature (last 10 readings): <span className="font-medium">{avgTemp.toFixed(1)}°C</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TemperatureCard;
