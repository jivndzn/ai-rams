
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import DashboardHeader from "@/components/dashboard/Header";
import DashboardFooter from "@/components/dashboard/Footer";
import TableView from "@/components/history/TableView";
import CardView from "@/components/history/CardView";
import ExportToCsv from "@/components/history/ExportToCsv";
import { useSensorReadings } from "@/hooks/useSensorReadings";
import { SensorReading } from "@/lib/supabase";

const History = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();
  
  const { readings, isLoading, loadHistoricalData } = useSensorReadings(100);
  
  // Filtering state
  const [showFilters, setShowFilters] = useState(false);
  const [filteredReadings, setFilteredReadings] = useState<SensorReading[]>([]);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    phMin: 0,
    phMax: 14,
    tempMin: 0,
    tempMax: 40,
    qualityMin: 0,
    qualityMax: 100,
    source: "all"
  });
  
  // Effect to apply filters
  useEffect(() => {
    let result = [...readings];
    
    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter(r => r.created_at && new Date(r.created_at) >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of the day
      result = result.filter(r => r.created_at && new Date(r.created_at) <= toDate);
    }
    
    // Filter by pH range
    result = result.filter(r => r.ph >= filters.phMin && r.ph <= filters.phMax);
    
    // Filter by temperature range
    result = result.filter(r => r.temperature >= filters.tempMin && r.temperature <= filters.tempMax);
    
    // Filter by quality range
    result = result.filter(r => r.quality >= filters.qualityMin && r.quality <= filters.qualityMax);
    
    // Filter by source
    if (filters.source !== "all") {
      result = result.filter(r => r.data_source === filters.source);
    }
    
    setFilteredReadings(result);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [readings, filters]);
  
  const handleNavigateBack = () => {
    navigate('/');
  };
  
  const uniqueSources = ["all", ...new Set(readings.map(r => r.data_source))];
  
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
            <Button 
              variant={showFilters ? "default" : "outline"} 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            <Button variant="outline" onClick={loadHistoricalData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <ExportToCsv readings={filteredReadings} />
          </div>
        </div>
        
        {showFilters && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Filter Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom">Date From</Label>
                  <Input 
                    id="dateFrom" 
                    type="date" 
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateTo">Date To</Label>
                  <Input 
                    id="dateTo" 
                    type="date" 
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="source">Data Source</Label>
                  <Select 
                    value={filters.source} 
                    onValueChange={(value) => setFilters({...filters, source: value})}
                  >
                    <SelectTrigger id="source">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueSources.map(source => (
                        <SelectItem key={source} value={source}>
                          {source === "all" ? "All Sources" : source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>pH Range: {filters.phMin.toFixed(1)} - {filters.phMax.toFixed(1)}</Label>
                  <div className="pt-4">
                    <Slider 
                      value={[filters.phMin, filters.phMax]}
                      min={0}
                      max={14}
                      step={0.1}
                      onValueChange={(value) => setFilters({
                        ...filters, 
                        phMin: value[0], 
                        phMax: value[1]
                      })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Temperature Range: {filters.tempMin.toFixed(1)}°C - {filters.tempMax.toFixed(1)}°C</Label>
                  <div className="pt-4">
                    <Slider 
                      value={[filters.tempMin, filters.tempMax]}
                      min={0}
                      max={40}
                      step={0.5}
                      onValueChange={(value) => setFilters({
                        ...filters, 
                        tempMin: value[0], 
                        tempMax: value[1]
                      })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Quality Range: {filters.qualityMin}% - {filters.qualityMax}%</Label>
                  <div className="pt-4">
                    <Slider 
                      value={[filters.qualityMin, filters.qualityMax]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => setFilters({
                        ...filters, 
                        qualityMin: value[0], 
                        qualityMax: value[1]
                      })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({
                    dateFrom: "",
                    dateTo: "",
                    phMin: 0,
                    phMax: 14,
                    tempMin: 0,
                    tempMax: 40,
                    qualityMin: 0,
                    qualityMax: 100,
                    source: "all"
                  })}
                >
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {isLoading 
              ? "Loading data..." 
              : `Showing ${filteredReadings.length} of ${readings.length} records`}
          </p>
        </div>
        
        <Tabs defaultValue="table" className="w-full mb-6">
          <TabsList>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="cards">Card View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="mt-4">
            <TableView 
              readings={filteredReadings}
              isLoading={isLoading}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
            />
          </TabsContent>
          
          <TabsContent value="cards" className="mt-4">
            <CardView 
              readings={filteredReadings}
              isLoading={isLoading}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
            />
          </TabsContent>
        </Tabs>
        
        <DashboardFooter />
      </div>
    </div>
  );
};

export default History;
