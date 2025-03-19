
import { SensorReading } from "@/lib/supabase";
import { getQualityDescription, getQualityColor, getPhColor, getWaterUseRecommendation } from "@/lib/sensors";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HistoryPagination from "./HistoryPagination";

interface TableViewProps {
  readings: SensorReading[];
  isLoading: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
}

const TableView = ({ readings, isLoading, currentPage, setCurrentPage, itemsPerPage }: TableViewProps) => {
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
    <Card>
      <CardHeader className="py-4">
        <CardTitle>Water Quality Records</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>pH Level</TableHead>
                    <TableHead>Temperature</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Recommended Use</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentReadings.length > 0 ? (
                    currentReadings.map((reading) => (
                      <TableRow key={reading.id}>
                        <TableCell>{formatDate(reading.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className={`${getPhColor(reading.ph)} w-3 h-3 rounded-full mr-2`}></div>
                            {reading.ph.toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell>{reading.temperature.toFixed(1)}°C</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className={`${getQualityColor(reading.quality)} w-3 h-3 rounded-full mr-2`}></div>
                            {reading.quality.toFixed(0)}% ({getQualityDescription(reading.quality)})
                          </div>
                        </TableCell>
                        <TableCell>{getWaterUseRecommendation(reading.ph)}</TableCell>
                        <TableCell>{reading.data_source}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
      </CardContent>
    </Card>
  );
};

export default TableView;
