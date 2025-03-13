
import { Thermometer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TemperatureGauge from "@/components/TemperatureGauge";

interface TemperatureCardProps {
  temperatureValue: number;
}

const TemperatureCard = ({ temperatureValue }: TemperatureCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Thermometer className="mr-2 h-5 w-5 text-orange-500" />
          Temperature
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TemperatureGauge value={temperatureValue} />
        <p className="mt-6 text-sm text-muted-foreground">
          {temperatureValue < 15 
            ? "Cool water temperature" 
            : temperatureValue > 25 
              ? "Warm water temperature" 
              : "Moderate water temperature"}
        </p>
      </CardContent>
    </Card>
  );
};

export default TemperatureCard;
