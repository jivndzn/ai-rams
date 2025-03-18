
import { Droplets, RefreshCw, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import QualityGauge from "@/components/QualityGauge";
import { getQualityDescription } from "@/lib/sensors";

interface WaterQualityCardProps {
  qualityValue: number;
  recommendation: string;
  onUpdateReadings: () => void;
  dataSource?: string;
  onRefreshHistory?: () => void;
}

const WaterQualityCard = ({ 
  qualityValue, 
  recommendation, 
  onUpdateReadings,
  dataSource = "Simulation",
  onRefreshHistory
}: WaterQualityCardProps) => {
  const qualityDescription = getQualityDescription(qualityValue);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center">
            <Droplets className="mr-2 h-5 w-5 text-blue-500" />
            Rainwater Quality Assessment
          </div>
          <div className="flex space-x-2">
            {onRefreshHistory && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs"
                onClick={onRefreshHistory}
              >
                <Database className="mr-1 h-3 w-3" />
                Load History
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={onUpdateReadings}
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Update
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <QualityGauge value={qualityValue} />
          
          <div className="flex flex-col space-y-1 md:ml-4">
            <h3 className="text-lg font-semibold">{qualityDescription} Quality</h3>
            <p className="text-sm text-muted-foreground">
              Data source: {dataSource}
            </p>
            <div className="mt-2 p-2 bg-muted rounded-md">
              <h4 className="text-sm font-medium">Recommended Use:</h4>
              <p className="text-sm">{recommendation}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <p className="text-xs text-muted-foreground">
          Quality assessment is based on turbidity, pH, and temperature measurements.
          {dataSource === "Arduino device" && " Data is saved to Supabase."}
        </p>
      </CardFooter>
    </Card>
  );
};

export default WaterQualityCard;
