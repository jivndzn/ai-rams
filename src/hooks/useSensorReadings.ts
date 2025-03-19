
import { useState, useEffect, useCallback } from "react";
import { getLatestSensorReadings } from "@/lib/supabase";
import { SensorReading } from "@/lib/supabase";
import { toast } from "sonner";

export function useSensorReadings(limit: number = 100) {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
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
        // Process the data to handle potential column name differences
        const processedData = data.map(reading => ({
          ...reading,
          // Ensure we handle both "ph" and "pH" cases from the database
          ph: reading.ph !== undefined ? reading.ph : (reading.pH as any)
        }));
        setReadings(processedData);
        toast.success("Historical data loaded", {
          description: `Loaded ${processedData.length} records from database`
        });
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
  };
}
