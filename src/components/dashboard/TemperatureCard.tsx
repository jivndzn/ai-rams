
import { Thermometer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TemperatureGauge from "@/components/TemperatureGauge";
import { useTheme } from "@/providers/ThemeProvider";

interface TemperatureCardProps {
  temperatureValue: number;
  avgTemp?: number;
}

const TemperatureCard = ({ temperatureValue, avgTemp }: TemperatureCardProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  return (
    <Card className={isDarkMode ? "bg-slate-900 border-slate-800 shadow-lg" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Thermometer className="mr-2 h-5 w-5 text-orange-500" />
          Temperature
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TemperatureGauge value={temperatureValue} />
        <div className="mt-6 space-y-2">
          <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-muted-foreground"}`}>
            {temperatureValue < 15 
              ? "Cool water temperature" 
              : temperatureValue > 25 
                ? "Warm water temperature" 
                : "Moderate water temperature"}
          </p>
          
          {avgTemp !== undefined && avgTemp > 0 && (
            <p className={`text-xs ${isDarkMode ? "text-slate-500 border-slate-800" : "text-muted-foreground border-border"} border-t pt-2 mt-2`}>
              Average temperature (last 10 readings): <span className={`font-medium ${isDarkMode ? "text-slate-300" : ""}`}>{avgTemp.toFixed(1)}°C</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TemperatureCard;
