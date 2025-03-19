
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLatestSensorReadings } from "@/lib/supabase";
import { SensorReading } from "@/lib/supabase";
import { getQualityDescription, getQualityColor, getPhColor, getWaterUseRecommendation } from "@/lib/sensors";
import { ChevronLeft, Download, Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardHeader from "@/components/dashboard/Header";
import DashboardFooter from "@/components/dashboard/Footer";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const History = () => {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();
  
  const totalPages = Math.ceil(readings.length / itemsPerPage);
  const currentReadings = readings.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );
  
  useEffect(() => {
    loadHistoricalData();
  }, []);
  
  const loadHistoricalData = async () => {
    try {
      setIsLoading(true);
      // Fetch a larger number of records for the history page
      const data = await getLatestSensorReadings(100);
      setReadings(data);
      toast.success("Historical data loaded", {
        description: `Loaded ${data.length} records from database`
      });
    } catch (error) {
      console.error("Error loading historical data:", error);
      toast.error("Failed to load historical data", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNavigateBack = () => {
    navigate('/');
  };
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };
  
  const exportToCsv = () => {
    if (!readings.length) {
      toast.error("No data to export");
      return;
    }
    
    const headers = ["ID", "Timestamp", "pH", "Temperature", "Quality", "Data Source"];
    const csvContent = [
      headers.join(","),
      ...readings.map(reading => [
        reading.id,
        reading.created_at,
        reading.ph,
        reading.temperature,
        reading.quality,
        reading.data_source
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `water-quality-data-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Data exported successfully");
  };
  
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="max-w-full mx-auto p-4 md:p-6">
        <DashboardHeader />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center">
            <Button variant="ghost" onClick={handleNavigateBack} className="mr-2">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold">Sensor Reading History</h1>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={loadHistoricalData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportToCsv}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="table" className="w-full mb-6">
          <TabsList>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="cards">Card View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="mt-4">
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
                      <Pagination className="mt-4">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                            />
                          </PaginationItem>
                          
                          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            const pageNumber = i + 1;
                            return (
                              <PaginationItem key={pageNumber}>
                                <PaginationLink 
                                  isActive={currentPage === pageNumber}
                                  onClick={() => setCurrentPage(pageNumber)}
                                >
                                  {pageNumber}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cards" className="mt-4">
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
                  <Pagination className="mt-6">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const pageNumber = i + 1;
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink 
                              isActive={currentPage === pageNumber}
                              onClick={() => setCurrentPage(pageNumber)}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
        
        <DashboardFooter />
      </div>
    </div>
  );
};

export default History;
