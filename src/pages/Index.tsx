
import { useState, useEffect, useMemo } from "react";
import { SensorData, getWaterUseRecommendation } from "@/lib/sensors";
import { toast } from "sonner";
import { getGeminiApiKey } from "@/lib/env";
import { useSensorReadings } from "@/hooks/useSensorReadings";
import { getAverageSensorReadings } from "@/lib/supabase";
import { formatTimestamp, getCurrentDateFormatted } from "@/lib/datetime";

// Components
import DashboardHeader from "@/components/dashboard/Header";
import PhCard from "@/components/dashboard/PhCard";
import TemperatureCard from "@/components/dashboard/TemperatureCard";
import WaterQualityCard from "@/components/dashboard/WaterQualityCard";
import HistoricalChart from "@/components/dashboard/HistoricalChart";
import ChatSection from "@/components/dashboard/ChatSection";
import DashboardFooter from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [apiKey, setApiKey] = useState<string>(getGeminiApiKey());
  const [recommendation, setRecommendation] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>(getCurrentDateFormatted());
  const navigate = useNavigate();
  
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
  
  // Get average values for display
  const [averages, setAverages] = useState({ avgPh: 0, avgTemp: 0, avgQuality: 0 });
  
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
  
  useEffect(() => {
    if (sensorData.ph !== undefined) {
      const recommendation = getWaterUseRecommendation(sensorData.ph);
      setRecommendation(recommendation);
    } else {
      setRecommendation("");
    }
  }, [sensorData]);
  
  // Update date/time regularly
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(getCurrentDateFormatted());
    };
    
    // Update time every minute
    const intervalId = setInterval(updateTime, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
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
  
  const handleViewHistory = () => {
    navigate('/history');
  };
  
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="max-w-full mx-auto p-4 md:p-6">
        <DashboardHeader />
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Water Quality Dashboard</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {currentTime}
            </div>
            <Button 
              variant="outline" 
              onClick={handleViewHistory}
            >
              View Full History
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <PhCard 
                phValue={sensorData.ph} 
                avgPh={averages.avgPh} 
                timestamp={mostRecentReading?.created_at}
              />
              <TemperatureCard 
                temperatureValue={sensorData.temperature} 
                avgTemp={averages.avgTemp}
                timestamp={mostRecentReading?.created_at}
              />
            </div>
            
            <WaterQualityCard 
              qualityValue={sensorData.quality}
              recommendation={recommendation}
              dataSource={sensorData.data_source}
              lastUpdated={mostRecentReading?.created_at ?? undefined}
              avgQuality={averages.avgQuality}
              qualityTrend={qualityTrend}
            />
            
            <HistoricalChart 
              historicalData={historicalData}
              isLoading={isLoading} 
              datasetsBySource={datasetsBySource}
              datasetsByTime={datasetsByTime}
            />
          </div>
          
          <div className="lg:col-span-1">
            <ChatSection 
              sensorData={sensorData}
              apiKey={apiKey}
              setApiKey={setApiKey}
            />
          </div>
        </div>
        
        <DashboardFooter />
      </div>
    </div>
  );
};

export default Index;
