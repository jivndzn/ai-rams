
import { Droplet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PhGauge from "@/components/PhGauge";

interface PhCardProps {
  phValue: number | undefined;
  avgPh?: number;
}

const PhCard = ({ phValue, avgPh }: PhCardProps) => {
  // Use a safe value for display logic
  const safeValue = typeof phValue === 'number' ? phValue : 7.0;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Droplet className="mr-2 h-5 w-5 text-aqua-500" />
          pH Level
        </CardTitle>
      </CardHeader>
      <CardContent>
        <PhGauge value={phValue} />
        <div className="mt-6 space-y-2">
          <p className="text-sm text-muted-foreground">
            {safeValue < 7 
              ? "Acidic water (pH < 7)" 
              : safeValue > 7 
                ? "Alkaline water (pH > 7)" 
                : "Neutral water (pH = 7)"}
          </p>
          
          {typeof avgPh === 'number' && (
            <p className="text-xs text-muted-foreground border-t border-border pt-2 mt-2">
              Average pH (last 10 readings): <span className="font-medium">{avgPh.toFixed(1)}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PhCard;
