
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SensorReading } from "@/lib/supabase";
import { toast } from "sonner";

export function useSensorReadings(limit: number = 100) {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const loadHistoricalData = useCallback(async () => {
    try {
      console.log("Loading historical data...");
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      console.log("Received data:", data);
      
      if (!data || data.length === 0) {
        // Still set the empty array to prevent previous data from showing
        setReadings([]);
        toast.info("No sensor readings found", {
          description: "Connect your Arduino to start collecting data"
        });
      } else {
        // Process the data to standardize pH field
        const processedData = data.map(reading => ({
          id: reading.id,
          created_at: reading.created_at,
          ph: reading.pH, // Use uppercase pH from database
          pH: reading.pH, // Keep the original property too
          temperature: reading.temperature,
          quality: reading.quality,
          data_source: reading.data_source || "unknown" // Ensure data_source is never undefined
        }));
        
        setReadings(processedData);
        setLastUpdated(new Date());
        
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
    
    // Set up real-time subscription for sensor_readings table
    const channel = supabase
      .channel('sensor_readings_realtime')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'sensor_readings' 
        }, 
        (payload) => {
          console.log('New sensor reading received:', payload);
          const newReading = payload.new as SensorReading;
          
          // Process new reading to standardize pH field
          const processedReading = {
            id: newReading.id,
            created_at: newReading.created_at,
            ph: newReading.pH, // Use uppercase pH from database
            pH: newReading.pH, // Keep the original property too
            temperature: newReading.temperature,
            quality: newReading.quality,
            data_source: newReading.data_source || "unknown"
          };
          
          // Add new reading to the top of the list (most recent first)
          setReadings(prevReadings => 
            [processedReading, ...prevReadings].slice(0, limit)
          );
          
          // Update last updated timestamp
          setLastUpdated(new Date());
          
          toast.info("New sensor reading", {
            description: `New reading from ${processedReading.data_source}`
          });
        }
      )
      .subscribe();
    
    return () => {
      // Clean up subscription on unmount
      supabase.removeChannel(channel);
    };
  }, [loadHistoricalData, limit]);

  // Categorize readings by source or time period
  const getDatasetsBySource = useCallback(() => {
    const datasets: Record<string, SensorReading[]> = {};
    
    readings.forEach(reading => {
      const source = reading.data_source || 'unknown';
      if (!datasets[source]) {
        datasets[source] = [];
      }
      datasets[source].push(reading);
    });
    
    return datasets;
  }, [readings]);
  
  // Get datasets by time range (today, last week, etc.)
  const getDatasetsByTimeRange = useCallback(() => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const today: SensorReading[] = [];
    const lastWeek: SensorReading[] = [];
    const older: SensorReading[] = [];
    
    readings.forEach(reading => {
      if (!reading.created_at) {
        return;
      }
      
      const readingDate = new Date(reading.created_at);
      
      if (readingDate >= oneDayAgo) {
        today.push(reading);
      } else if (readingDate >= oneWeekAgo) {
        lastWeek.push(reading);
      } else {
        older.push(reading);
      }
    });
    
    return { today, lastWeek, older };
  }, [readings]);

  return {
    readings,
    isLoading,
    error,
    loadHistoricalData,
    getDatasetsBySource,
    getDatasetsByTimeRange,
    lastUpdated
  };
}
