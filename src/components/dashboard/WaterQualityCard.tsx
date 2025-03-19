
import { Droplets, RefreshCw, Database, Waves, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import QualityGauge from "@/components/QualityGauge";
import { getQualityDescription, getTurbidityDescription, getTurbidityRecommendation } from "@/lib/sensors";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WaterQualityCardProps {
  qualityValue: number;
  recommendation: string;
  onUpdateReadings: () => void;
  dataSource?: string;
  onRefreshHistory?: () => void;
  lastUpdated: string;
  avgQuality?: number;
}

const WaterQualityCard = ({ 
  qualityValue, 
  recommendation, 
  onUpdateReadings,
  dataSource = "Simulation",
  onRefreshHistory,
  lastUpdated,
  avgQuality
}: WaterQualityCardProps) => {
  const qualityDescription = getQualityDescription(qualityValue);
  const turbidityDescription = getTurbidityDescription(qualityValue);
  const turbidityRecommendation = getTurbidityRecommendation(qualityValue);
  
  const handleUpdateClick = () => {
    console.log("Update button clicked");
    onUpdateReadings();
  };
  
  const handleHistoryClick = () => {
    console.log("Load History button clicked");
    if (onRefreshHistory) {
      onRefreshHistory();
    }
  };
  
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
                onClick={handleHistoryClick}
              >
                <Database className="mr-1 h-3 w-3" />
                Load History
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={handleUpdateClick}
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Update
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="w-full md:w-auto">
            <QualityGauge value={qualityValue} />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center text-xs text-muted-foreground mt-1 cursor-help">
                    <Info className="h-3 w-3 mr-1" />
                    <span>Higher values indicate dirtier water</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Arduino sensor: 0% = Clear water, 100% = Dirty water</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex flex-col space-y-1 md:ml-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{qualityDescription} Quality</h3>
              <Badge variant="outline" className="ml-1">
                <Waves className="mr-1 h-3 w-3" />
                {turbidityDescription}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Data source: {dataSource}
            </p>
            
            <div className="mt-2 p-2 bg-muted rounded-md">
              <h4 className="text-sm font-medium">Turbidity Assessment:</h4>
              <p className="text-sm">{turbidityRecommendation}</p>
            </div>
            
            <div className="mt-2 p-2 bg-muted rounded-md">
              <h4 className="text-sm font-medium">pH-Based Recommendation:</h4>
              <p className="text-sm">{recommendation}</p>
            </div>
            
            {avgQuality !== undefined && avgQuality > 0 && (
              <p className="text-xs text-muted-foreground border-t border-border pt-2 mt-2">
                Average quality (last 10 readings): <span className="font-medium">{avgQuality.toFixed(0)}%</span>
                {" "}<span className="text-xs">({getTurbidityDescription(avgQuality)})</span>
              </p>
            )}
            
            <p className="text-xs text-muted-foreground mt-2">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <p className="text-xs text-muted-foreground">
          Quality assessment is based on turbidity, pH, and temperature measurements.
          {dataSource === "arduino_uno" && " Data is saved to Supabase."}
        </p>
      </CardFooter>
    </Card>
  );
};

export default WaterQualityCard;
