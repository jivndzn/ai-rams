
import { Droplet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PhGauge from "@/components/PhGauge";

interface PhCardProps {
  phValue: number;
}

const PhCard = ({ phValue }: PhCardProps) => {
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
        <p className="mt-6 text-sm text-muted-foreground">
          {phValue < 7 
            ? "Acidic water (pH < 7)" 
            : phValue > 7 
              ? "Alkaline water (pH > 7)" 
              : "Neutral water (pH = 7)"}
        </p>
      </CardContent>
    </Card>
  );
};

export default PhCard;
