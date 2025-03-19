
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import FilterPanel from "./FilterPanel";
import ExportToCsv from "./ExportToCsv";
import { SensorReading } from "@/lib/supabase";

interface HistoryHeaderProps {
  readings: SensorReading[];
  filteredReadings: SensorReading[];
  loadHistoricalData: () => void;
  filters: {
    dateFrom: string;
    dateTo: string;
    phMin: number;
    phMax: number;
    tempMin: number;
    tempMax: number;
    qualityMin: number;
    qualityMax: number;
    source: string;
  };
  setFilters: (filters: any) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

const HistoryHeader = ({ 
  readings, 
  filteredReadings, 
  loadHistoricalData, 
  filters, 
  setFilters, 
  showFilters, 
  setShowFilters 
}: HistoryHeaderProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleNavigateBack = () => {
    navigate('/');
  };
  
  return (
    <div className="flex flex-col gap-4 md:gap-6 mb-4 md:mb-6">
      <div className="flex items-center justify-between">
        <Button 
          onClick={handleNavigateBack} 
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-md hover:shadow-lg transition-all duration-300 border-none"
          size={isMobile ? "sm" : "default"}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">{isMobile ? "Dashboard" : "Back to Dashboard"}</span>
        </Button>
        
        <div className="hidden sm:block">
          <Badge variant="outline" className="text-lg font-semibold bg-background/80 backdrop-blur-sm px-4 py-1.5 border-primary/20">
            Sensor Reading History
          </Badge>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold sm:hidden">Sensor Reading History</h1>
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto">
          <FilterPanel 
            readings={readings}
            filters={filters}
            setFilters={setFilters}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />
          <Button 
            variant="outline" 
            onClick={loadHistoricalData}
            size={isMobile ? "sm" : "default"}
            className="min-w-[40px]"
          >
            <RefreshCw className="h-4 w-4 mr-2 sm:mr-2" />
            <span className={isMobile ? "hidden sm:inline" : ""}>Refresh</span>
          </Button>
          <ExportToCsv readings={filteredReadings} />
        </div>
      </div>
    </div>
  );
};

export default HistoryHeader;
