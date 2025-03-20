
import { useState, useEffect, useCallback } from "react";
import { getLatestSensorReadings } from "@/lib/supabase";
import { SensorReading } from "@/lib/supabase";
import { toast } from "sonner";

// Define valid ranges for sensor data
const VALID_RANGES = {
  temperature: { min: 0, max: 40 },   // 0-40°C is reasonable for water temperature
  ph: { min: 0, max: 14 },            // pH scale is 0-14
  quality: { min: 0, max: 100 }       // Quality percentage 0-100%
};

export function useSensorReadings(limit: number = 100) {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [invalidReadingsCount, setInvalidReadingsCount] = useState(0);
  
  const isValidReading = (reading: SensorReading): boolean => {
    // Check if temperature is in valid range
    if (
      reading.temperature < VALID_RANGES.temperature.min || 
      reading.temperature > VALID_RANGES.temperature.max
    ) {
      return false;
    }
    
    // Get the pH value (handling both lowercase and uppercase variants)
    const phValue = reading.ph !== undefined ? reading.ph : (reading.pH as any);
    
    // Check if pH is in valid range
    if (phValue < VALID_RANGES.ph.min || phValue > VALID_RANGES.ph.max) {
      return false;
    }
    
    // Quality check is less strict as 0 is a valid value
    if (
      reading.quality < VALID_RANGES.quality.min || 
      reading.quality > VALID_RANGES.quality.max
    ) {
      return false;
    }
    
    return true;
  };
  
  const loadHistoricalData = useCallback(async () => {
    try {
      console.log("Loading historical data...");
      setIsLoading(true);
      setError(null);
      
      const data = await getLatestSensorReadings(limit);
      console.log("Received data:", data);
      
      if (!data || data.length === 0) {
        // Still set the empty array to prevent previous data from showing
        setReadings([]);
        toast.info("No sensor readings found", {
          description: "Connect your Arduino to start collecting data"
        });
      } else {
        // Process and filter the data to handle invalid readings
        let invalidCount = 0;
        const processedData = data
          .map(reading => ({
            ...reading,
            // Ensure we handle both "ph" and "pH" cases from the database
            ph: reading.ph !== undefined ? reading.ph : (reading.pH as any)
          }))
          .filter(reading => {
            const valid = isValidReading(reading);
            if (!valid) invalidCount++;
            return valid;
          });
        
        setInvalidReadingsCount(invalidCount);
        
        if (invalidCount > 0) {
          toast.warning(`Filtered out ${invalidCount} invalid readings`, {
            description: "Some sensor readings were outside expected ranges"
          });
        }
        
        setReadings(processedData);
        
        if (processedData.length > 0) {
          toast.success("Historical data loaded", {
            description: `Loaded ${processedData.length} valid records from database`
          });
        } else {
          toast.warning("No valid sensor readings found", {
            description: "All readings were outside expected ranges. Check sensor calibration."
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error loading historical data:", error);
      
      // Cast error to Error type for proper handling
      const err = error instanceof Error ? error : new Error(String(error));
      setError(err);
      
      toast.error("Failed to load historical data", {
        description: err.message
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    console.log("useSensorReadings hook mounted, loading data...");
    loadHistoricalData();
    
    // Optional: Set up a polling mechanism to refresh data
    const interval = setInterval(() => {
      loadHistoricalData();
    }, 5 * 60 * 1000); // Refresh every 5 minutes
    
    return () => clearInterval(interval);
  }, [loadHistoricalData]);

  return {
    readings,
    isLoading,
    error,
    loadHistoricalData,
    invalidReadingsCount,
  };
}
