
import { Droplets, RefreshCw, Database, Waves, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import QualityGauge from "@/components/QualityGauge";
import { getQualityDescription, getTurbidityDescription, getTurbidityRecommendation } from "@/lib/sensors";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/providers/ThemeProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatTimestamp } from "@/lib/datetime";

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
  const isMobile = useIsMobile();
  
  const isConcerning = qualityValue > 70; // Adjusted to align with quality levels
  
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
  
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  return (
    <Card className={`overflow-hidden ${isDarkMode ? "border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950" : "border-slate-200 bg-gradient-to-b from-white to-slate-50"} shadow-lg`}>
      <CardHeader className={`pb-2 border-b ${isDarkMode ? "border-slate-800" : "border-slate-200"}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <CardTitle className="flex items-center text-lg">
            <Droplets className="mr-2 h-5 w-5 text-blue-400" />
            {isMobile ? "Quality Assessment" : "Rainwater Quality Assessment"}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {onRefreshHistory && (
              <Button 
                variant="outline" 
                size="sm" 
                className={`h-8 text-xs ${isDarkMode ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"}`}
                onClick={handleHistoryClick}
              >
                <Database className="mr-1 h-3 w-3" />
                {isMobile ? "" : "Load "}History
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className={`h-8 text-xs ${isDarkMode ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"}`}
              onClick={handleUpdateClick}
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Update
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2 pt-4">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-6">
          <div className="w-full md:w-2/5">
            <QualityGauge value={qualityValue} />
          </div>
          
          <div className="flex flex-col space-y-3 md:w-3/5">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className={`text-lg font-semibold ${isConcerning ? 'text-red-500' : (isDarkMode ? 'text-blue-300' : 'text-blue-600')}`}>
                {qualityDescription} Quality
              </h3>
              <Badge variant="outline" className={`ml-1 ${
                isConcerning 
                  ? (isDarkMode ? 'border-red-800 bg-red-950/50' : 'border-red-300 bg-red-50') 
                  : (isDarkMode ? 'border-blue-800 bg-blue-950/50' : 'border-blue-300 bg-blue-50')
              }`}>
                <Waves className="mr-1 h-3 w-3" />
                {turbidityDescription}
              </Badge>
              
              {isConcerning && (
                <Badge variant="destructive" className="ml-auto sm:ml-0">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Concerning
                </Badge>
              )}
            </div>
            
            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Data source: <span className={isDarkMode ? "text-slate-300 font-medium" : "text-slate-800 font-medium"}>{dataSource}</span>
            </p>
            
            <div className={`mt-2 p-3 ${isDarkMode ? "bg-slate-800/50 border-slate-700/50" : "bg-slate-100/80 border-slate-200/80"} backdrop-blur-sm rounded-md border shadow-inner`}>
              <h4 className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-slate-700"} mb-1`}>Turbidity Assessment:</h4>
              <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>{turbidityRecommendation}</p>
            </div>
            
            <div className={`p-3 ${isDarkMode ? "bg-slate-800/50 border-slate-700/50" : "bg-slate-100/80 border-slate-200/80"} backdrop-blur-sm rounded-md border shadow-inner`}>
              <h4 className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-slate-700"} mb-1`}>pH-Based Recommendation:</h4>
              <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>{recommendation}</p>
            </div>
            
            {avgQuality !== undefined && avgQuality > 0 && (
              <p className={`text-xs ${isDarkMode ? "text-slate-400 border-slate-800" : "text-slate-600 border-slate-200"} border-t pt-2`}>
                Average quality (last 10 readings): <span className={`font-medium ${isDarkMode ? "text-slate-300" : "text-slate-800"}`}>{avgQuality.toFixed(0)}%</span>
                {" "}<span className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>({getTurbidityDescription(avgQuality)})</span>
              </p>
            )}
            
            <p className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>
              Last updated: <span className={isDarkMode ? "text-slate-400" : "text-slate-600"}>{formatTimestamp(new Date(lastUpdated))}</span>
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className={`pt-2 border-t ${isDarkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-slate-50/50"}`}>
        <p className="text-xs text-slate-500">
          Quality assessment is based on turbidity, pH, and temperature measurements.
          {dataSource === "arduino_uno" && " Data is saved to Supabase."}
        </p>
      </CardFooter>
    </Card>
  );
};

export default WaterQualityCard;
