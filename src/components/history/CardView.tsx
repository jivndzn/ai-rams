
import { SensorReading } from "@/lib/supabase";
import { getQualityDescription, getQualityColor, getPhColor, getWaterUseRecommendation } from "@/lib/sensors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import HistoryPagination from "./HistoryPagination";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CardViewProps {
  readings: SensorReading[];
  isLoading: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
}

const CardView = ({ readings, isLoading, currentPage, setCurrentPage, itemsPerPage }: CardViewProps) => {
  // Modified to use 12 items per page for the card view specifically
  const cardsPerPage = 12;
  const totalPages = Math.ceil(readings.length / cardsPerPage);
  const currentReadings = readings.slice(
    (currentPage - 1) * cardsPerPage, 
    currentPage * cardsPerPage
  );
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Helper function to safely format numeric values
  const safeFormat = (value: number | undefined, decimals: number = 1) => {
    return typeof value === 'number' ? value.toFixed(decimals) : 'N/A';
  };
  
  // Validate range of values
  const isValidTemperature = (temp?: number) => temp !== undefined && temp >= 0 && temp <= 40;
  const isValidPh = (ph?: number) => ph !== undefined && ph >= 0 && ph <= 14;
  const isValidQuality = (quality?: number) => quality !== undefined && quality >= 0 && quality <= 100;

  return (
    <>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(12).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentReadings.length > 0 ? (
              currentReadings.map((reading) => {
                // Apply safety checks for all numeric values
                const phValue = reading.ph ?? reading.pH ?? 0;
                const tempValue = reading.temperature ?? 0;
                const qualityValue = reading.quality ?? 0;
                
                // Determine if each value is valid
                const tempValid = isValidTemperature(tempValue);
                const phValid = isValidPh(phValue);
                const qualityValid = isValidQuality(qualityValue);
                
                // Determine if any value is invalid
                const hasInvalidValues = !tempValid || !phValid || !qualityValid;
                
                return (
                  <Card key={reading.id} className="overflow-hidden">
                    <div className={`h-2 ${getQualityColor(qualityValue)} w-full`}></div>
                    <CardHeader className="py-4">
                      <CardTitle className="flex justify-between items-center text-base">
                        <span>Reading #{reading.id}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(reading.created_at)}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      {hasInvalidValues && (
                        <Badge variant="destructive" className="mb-3">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Contains out-of-range values
                        </Badge>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">pH Level</p>
                          <div className="flex items-center">
                            {phValid ? (
                              <>
                                <div className={`${getPhColor(phValue)} w-3 h-3 rounded-full mr-2`}></div>
                                <p className="text-2xl font-semibold">{safeFormat(phValue)}</p>
                              </>
                            ) : (
                              <p className="text-sm text-destructive">Invalid: {safeFormat(phValue)}</p>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Temperature</p>
                          {tempValid ? (
                            <p className="text-2xl font-semibold">{safeFormat(tempValue)}°C</p>
                          ) : (
                            <p className="text-sm text-destructive">Invalid: {safeFormat(tempValue)}°C</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-1">
                        <p className="text-sm font-medium">Quality Assessment</p>
                        <div className="flex items-center">
                          {qualityValid ? (
                            <>
                              <div className={`${getQualityColor(qualityValue)} w-3 h-3 rounded-full mr-2`}></div>
                              <p className="text-lg font-semibold">{safeFormat(qualityValue, 0)}% ({getQualityDescription(qualityValue)})</p>
                            </>
                          ) : (
                            <p className="text-sm text-destructive">Invalid: {safeFormat(qualityValue, 0)}%</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-1">
                        <p className="text-sm font-medium">Recommended Use</p>
                        {phValid ? (
                          <p className="text-sm">{getWaterUseRecommendation(phValue)}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">Unavailable (invalid pH value)</p>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">Source: {reading.data_source}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </div>
          
          {readings.length > cardsPerPage && (
            <HistoryPagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          )}
        </>
      )}
    </>
  );
};

export default CardView;
