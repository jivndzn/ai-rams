
import { Droplets, RefreshCw, Database, Waves, Info, AlertTriangle } from "lucide-react";
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
  
  // Determine if water quality is concerning
  const isConcerning = qualityValue > 80;
  
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
    <Card className="overflow-hidden border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 shadow-lg">
      <CardHeader className="pb-2 border-b border-slate-800">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center">
            <Droplets className="mr-2 h-5 w-5 text-blue-400" />
            Rainwater Quality Assessment
          </div>
          <div className="flex space-x-2">
            {onRefreshHistory && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200"
                onClick={handleHistoryClick}
              >
                <Database className="mr-1 h-3 w-3" />
                Load History
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200"
              onClick={handleUpdateClick}
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Update
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2 pt-4">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-6">
          <div className="w-full md:w-2/5">
            <QualityGauge value={qualityValue} />
          </div>
          
          <div className="flex flex-col space-y-3 md:w-3/5">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`text-lg font-semibold ${isConcerning ? 'text-red-400' : 'text-blue-300'}`}>
                {qualityDescription} Quality
              </h3>
              <Badge variant="outline" className={`ml-1 ${isConcerning ? 'border-red-800 bg-red-950/50' : 'border-blue-800 bg-blue-950/50'}`}>
                <Waves className="mr-1 h-3 w-3" />
                {turbidityDescription}
              </Badge>
              
              {isConcerning && (
                <Badge variant="destructive" className="ml-auto">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Concerning
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-slate-400">
              Data source: <span className="text-slate-300 font-medium">{dataSource}</span>
            </p>
            
            <div className="mt-2 p-3 bg-slate-800/50 backdrop-blur-sm rounded-md border border-slate-700/50 shadow-inner">
              <h4 className="text-sm font-medium text-slate-300 mb-1">Turbidity Assessment:</h4>
              <p className="text-sm text-slate-400">{turbidityRecommendation}</p>
            </div>
            
            <div className="p-3 bg-slate-800/50 backdrop-blur-sm rounded-md border border-slate-700/50 shadow-inner">
              <h4 className="text-sm font-medium text-slate-300 mb-1">pH-Based Recommendation:</h4>
              <p className="text-sm text-slate-400">{recommendation}</p>
            </div>
            
            {avgQuality !== undefined && avgQuality > 0 && (
              <p className="text-xs text-slate-400 border-t border-slate-800 pt-2">
                Average quality (last 10 readings): <span className="font-medium text-slate-300">{avgQuality.toFixed(0)}%</span>
                {" "}<span className="text-xs text-slate-400">({getTurbidityDescription(avgQuality)})</span>
              </p>
            )}
            
            <p className="text-xs text-slate-500">
              Last updated: <span className="text-slate-400">{lastUpdated}</span>
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t border-slate-800 bg-slate-900/50">
        <p className="text-xs text-slate-500">
          Quality assessment is based on turbidity, pH, and temperature measurements.
          {dataSource === "arduino_uno" && " Data is saved to Supabase."}
        </p>
      </CardFooter>
    </Card>
  );
};

export default WaterQualityCard;
