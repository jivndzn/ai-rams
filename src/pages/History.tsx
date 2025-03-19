
import { useState, useEffect } from "react";
import DashboardHeader from "@/components/dashboard/Header";
import DashboardFooter from "@/components/dashboard/Footer";
import HistoryHeader from "@/components/history/HistoryHeader";
import HistoryTabs from "@/components/history/HistoryTabs";
import { useSensorReadings } from "@/hooks/useSensorReadings";
import { SensorReading } from "@/lib/supabase";

const History = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
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
  
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="max-w-full mx-auto p-3 md:p-6">
        <DashboardHeader />
        
        <HistoryHeader 
          readings={readings}
          filteredReadings={filteredReadings}
          loadHistoricalData={loadHistoricalData}
          filters={filters}
          setFilters={setFilters}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />
        
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {isLoading 
              ? "Loading data..." 
              : `Showing ${filteredReadings.length} of ${readings.length} records`}
          </p>
        </div>
        
        <HistoryTabs 
          filteredReadings={filteredReadings}
          isLoading={isLoading}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
        />
        
        <DashboardFooter />
      </div>
    </div>
  );
};

export default History;
