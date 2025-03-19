
import { useState, useEffect } from "react";
import { getLatestSensorReadings } from "@/lib/supabase";
import { SensorReading } from "@/lib/supabase";
import { toast } from "sonner";

export function useSensorReadings(limit: number = 100) {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const loadHistoricalData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getLatestSensorReadings(limit);
      
      if (data.length === 0) {
        // Still set the empty array to prevent previous data from showing
        setReadings([]);
        toast.info("No sensor readings found", {
          description: "Connect your Arduino to start collecting data"
        });
      } else {
        setReadings(data);
        toast.success("Historical data loaded", {
          description: `Loaded ${data.length} records from database`
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
  };

  useEffect(() => {
    loadHistoricalData();
    
    // Optional: Set up a polling mechanism to refresh data
    const interval = setInterval(() => {
      loadHistoricalData();
    }, 5 * 60 * 1000); // Refresh every 5 minutes
    
    return () => clearInterval(interval);
  }, [limit]);

  return {
    readings,
    isLoading,
    error,
    loadHistoricalData,
  };
}
