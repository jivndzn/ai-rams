
import { SensorReading } from "@/lib/supabase";
import { getQualityDescription, getQualityColor, getPhColor, getWaterUseRecommendation } from "@/lib/sensors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import HistoryPagination from "./HistoryPagination";

interface CardViewProps {
  readings: SensorReading[];
  isLoading: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
}

const CardView = ({ readings, isLoading, currentPage, setCurrentPage, itemsPerPage }: CardViewProps) => {
  const totalPages = Math.ceil(readings.length / itemsPerPage);
  const currentReadings = readings.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentReadings.length > 0 ? (
              currentReadings.map((reading) => (
                <Card key={reading.id} className="overflow-hidden">
                  <div className={`h-2 ${getQualityColor(reading.quality)} w-full`}></div>
                  <CardHeader className="py-4">
                    <CardTitle className="flex justify-between items-center text-base">
                      <span>Reading #{reading.id}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(reading.created_at)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">pH Level</p>
                        <div className="flex items-center">
                          <div className={`${getPhColor(reading.ph)} w-3 h-3 rounded-full mr-2`}></div>
                          <p className="text-2xl font-semibold">{reading.ph.toFixed(1)}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Temperature</p>
                        <p className="text-2xl font-semibold">{reading.temperature.toFixed(1)}°C</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-1">
                      <p className="text-sm font-medium">Quality Assessment</p>
                      <div className="flex items-center">
                        <div className={`${getQualityColor(reading.quality)} w-3 h-3 rounded-full mr-2`}></div>
                        <p className="text-lg font-semibold">{reading.quality.toFixed(0)}% ({getQualityDescription(reading.quality)})</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-1">
                      <p className="text-sm font-medium">Recommended Use</p>
                      <p className="text-sm">{getWaterUseRecommendation(reading.ph)}</p>
                    </div>
                    
                    <div className="mt-4 pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">Source: {reading.data_source}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </div>
          
          {readings.length > itemsPerPage && (
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
