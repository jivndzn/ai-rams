
import { useState, useEffect } from "react";
import { Filter, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SensorReading } from "@/lib/supabase";
import { useIsMobile } from "@/hooks/use-mobile";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  readings: SensorReading[];
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

const FilterPanel = ({ 
  readings, 
  filters, 
  setFilters, 
  showFilters, 
  setShowFilters 
}: FilterPanelProps) => {
  const isMobile = useIsMobile();
  const uniqueSources = ["all", ...new Set(readings.map(r => r.data_source))];
  
  // Convert string dates to Date objects for Calendar
  const [fromDate, setFromDate] = useState<Date | undefined>(
    filters.dateFrom ? new Date(filters.dateFrom) : undefined
  );
  
  const [toDate, setToDate] = useState<Date | undefined>(
    filters.dateTo ? new Date(filters.dateTo) : undefined
  );
  
  // Update filters when dates change
  const handleFromDateChange = (date: Date | undefined) => {
    setFromDate(date);
    if (date) {
      setFilters({
        ...filters,
        dateFrom: format(date, 'yyyy-MM-dd')
      });
    } else {
      setFilters({
        ...filters,
        dateFrom: ""
      });
    }
  };
  
  const handleToDateChange = (date: Date | undefined) => {
    setToDate(date);
    if (date) {
      setFilters({
        ...filters,
        dateTo: format(date, 'yyyy-MM-dd')
      });
    } else {
      setFilters({
        ...filters,
        dateTo: ""
      });
    }
  };

  return (
    <>
      <Button 
        variant={showFilters ? "default" : "outline"} 
        onClick={() => setShowFilters(!showFilters)}
        size={isMobile ? "sm" : "default"}
      >
        <Filter className="h-4 w-4 mr-2" />
        {isMobile ? "Filters" : showFilters ? "Hide Filters" : "Show Filters"}
      </Button>
      
      {showFilters && (
        <Card className="mb-6 animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Filter Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !fromDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, "PPP") : <span>Pick a start date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={handleFromDateChange}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Date To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !toDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, "PPP") : <span>Pick an end date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={handleToDateChange}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
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
                onClick={() => {
                  setFromDate(undefined);
                  setToDate(undefined);
                  setFilters({
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
                }}
              >
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default FilterPanel;
