
import { useState, useEffect, useMemo } from "react";
import { SensorData, getWaterUseRecommendation } from "@/lib/sensors";
import { useSensorReadings } from "@/hooks/useSensorReadings";
import { getAverageSensorReadings } from "@/lib/supabase";

export function useDashboardData() {
  const [recommendation, setRecommendation] = useState<string>("");
  
  // Use our enhanced hook with real-time updates
  const { 
    readings: historicalData, 
    isLoading,
    getDatasetsBySource,
    getDatasetsByTimeRange,
    lastUpdated
  } = useSensorReadings(24);
  
  // Process datasets
  const datasetsBySource = useMemo(() => getDatasetsBySource(), [getDatasetsBySource]);
  const datasetsByTime = useMemo(() => getDatasetsByTimeRange(), [getDatasetsByTimeRange]);
  
  // Get the most recent reading for current display
  const mostRecentReading = useMemo(() => {
    return historicalData.length > 0 ? historicalData[0] : null;
  }, [historicalData]);
  
  // Create current sensor data from most recent reading or use default values
  const sensorData = useMemo<SensorData>(() => {
    if (mostRecentReading) {
      return {
        ph: mostRecentReading.ph ?? mostRecentReading.pH ?? 7.0,
        temperature: mostRecentReading.temperature ?? 22.0,
        quality: mostRecentReading.quality ?? 75,
        timestamp: mostRecentReading.created_at 
          ? new Date(mostRecentReading.created_at).getTime() 
          : Date.now(),
        data_source: mostRecentReading.data_source ?? "unknown"
      };
    }
    
    // Default values if no data is available
    return {
      ph: undefined,
      temperature: undefined,
      quality: undefined,
      timestamp: Date.now(),
      data_source: "simulated"
    };
  }, [mostRecentReading]);
  
  // Calculate quality trend
  const qualityTrend = useMemo(() => {
    if (historicalData.length < 3) return undefined;
    
    // Get last 3 quality readings
    const recentReadings = historicalData
      .slice(0, 3)
      .map(r => r.quality ?? 0)
      .filter(q => q > 0);
    
    if (recentReadings.length < 2) return undefined;
    
    // Check if quality is consistently increasing or decreasing
    let rising = true;
    let falling = true;
    
    for (let i = 0; i < recentReadings.length - 1; i++) {
      if (recentReadings[i] <= recentReadings[i+1]) falling = false;
      if (recentReadings[i] >= recentReadings[i+1]) rising = false;
    }
    
    // Calculate the average change
    const totalChange = recentReadings[0] - recentReadings[recentReadings.length - 1];
    
    // Only show trend if the change is significant (more than 5%)
    if (Math.abs(totalChange) < 5) return 'stable';
    
    if (rising) return 'rising';
    if (falling) return 'falling';
    
    return 'stable';
  }, [historicalData]);
  
  // Get average values for display
  const [averages, setAverages] = useState({ avgPh: 0, avgTemp: 0, avgQuality: 0 });
  
  // Update recommendation when pH changes
  useEffect(() => {
    if (sensorData.ph !== undefined) {
      const recommendation = getWaterUseRecommendation(sensorData.ph);
      setRecommendation(recommendation);
    } else {
      setRecommendation("");
    }
  }, [sensorData]);
  
  // Fetch averages when data changes or periodically
  useEffect(() => {
    const fetchAverages = async () => {
      try {
        const avgData = await getAverageSensorReadings(10);
        setAverages(avgData);
      } catch (error) {
        console.error("Error fetching averages:", error);
      }
    };
    
    fetchAverages();
    
    // Refresh averages whenever historical data changes
    if (historicalData.length > 0) {
      fetchAverages();
    }
    
    // Also refresh periodically for guaranteed updates
    const intervalId = setInterval(fetchAverages, 60000);
    
    return () => clearInterval(intervalId);
  }, [historicalData, lastUpdated]);

  return {
    historicalData,
    isLoading,
    datasetsBySource,
    datasetsByTime,
    sensorData,
    mostRecentReading,
    recommendation,
    averages,
    qualityTrend
  };
}
