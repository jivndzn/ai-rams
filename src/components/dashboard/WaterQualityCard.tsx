
import { Activity, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QualityGauge from "@/components/QualityGauge";
import { Button } from "@/components/ui/button";

interface WaterQualityCardProps {
  qualityValue: number;
  recommendation: string;
  onUpdateReadings: () => void;
}

const WaterQualityCard = ({ 
  qualityValue, 
  recommendation, 
  onUpdateReadings 
}: WaterQualityCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Activity className="mr-2 h-5 w-5 text-teal-500" />
          Overall Water Quality
        </CardTitle>
      </CardHeader>
      <CardContent>
        <QualityGauge value={qualityValue} />
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-1">Recommended Use:</h3>
          <p className="text-lg">{recommendation}</p>
        </div>
        <Button 
          variant="outline" 
          className="mt-4 w-full" 
          onClick={onUpdateReadings}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Update Readings
        </Button>
      </CardContent>
    </Card>
  );
};

export default WaterQualityCard;
