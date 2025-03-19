
import { useState, useEffect } from "react";
import { getLatestSensorReadings } from "@/lib/supabase";
import { SensorReading } from "@/lib/supabase";
import { toast } from "sonner";

export function useSensorReadings(limit: number = 100) {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const loadHistoricalData = async () => {
    try {
      setIsLoading(true);
      const data = await getLatestSensorReadings(limit);
      setReadings(data);
      toast.success("Historical data loaded", {
        description: `Loaded ${data.length} records from database`
      });
      return true;
    } catch (error) {
      console.error("Error loading historical data:", error);
      toast.error("Failed to load historical data", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistoricalData();
  }, []);

  return {
    readings,
    isLoading,
    loadHistoricalData,
  };
}
