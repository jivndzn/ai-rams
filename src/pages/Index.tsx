
import { useState, useEffect } from "react";
import { SensorData, getWaterUseRecommendation } from "@/lib/sensors";
import { toast } from "sonner";
import { getGeminiApiKey } from "@/lib/env";
import { getLatestSensorReadings, getAverageSensorReadings, SensorReading } from "@/lib/supabase";
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
  const [sensorData, setSensorData] = useState<SensorData>({
    ph: 7.0,
    temperature: 22.0,
    quality: 75,
    timestamp: Date.now(),
    data_source: "loading"
  });
  const [historicalData, setHistoricalData] = useState<SensorReading[]>([]);
  const [apiKey, setApiKey] = useState<string>(getGeminiApiKey());
  const [recommendation, setRecommendation] = useState<string>("");
  const [lastUpdateSource, setLastUpdateSource] = useState<string>("loading");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load historical data on component mount
    loadHistoricalData();
    
    // Set up refresh interval (every 5 minutes)
    const interval = setInterval(() => {
      loadHistoricalData();
    }, 300000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const recommendation = getWaterUseRecommendation(sensorData.ph);
    setRecommendation(recommendation);
  }, [sensorData]);
  
  const loadHistoricalData = async () => {
    try {
      setIsLoading(true);
      const readings = await getLatestSensorReadings(24);
      
      if (readings.length > 0) {
        // Convert Supabase data to SensorData format
        const historicalReadings: SensorData[] = readings.map(reading => ({
          ph: reading.ph ?? reading.pH ?? 7.0, // Fall back to pH if ph is not available
          temperature: reading.temperature ?? 0,
          quality: reading.quality ?? 0,
          timestamp: reading.created_at ? new Date(reading.created_at).getTime() : Date.now(),
          data_source: reading.data_source ?? "unknown"
        }));
        
        // Store the original readings in historicalData for the chart
        setHistoricalData(readings);
        
        // Update current sensor data with the most recent reading
        const mostRecent = historicalReadings[0];
        if (mostRecent) {
          setSensorData(mostRecent);
          setLastUpdateSource(mostRecent.data_source);
        }
        
        toast.success("Loaded sensor data", {
          description: `Loaded ${readings.length} readings from database`
        });
      } else {
        toast.info("No data found", {
          description: "Connect your Arduino to start collecting data"
        });
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsLoading(false);
    }
    
    return historicalData.length > 0;
  };
  
  // Get average values for display
  const [averages, setAverages] = useState({ avgPh: 0, avgTemp: 0, avgQuality: 0 });
  
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
  }, [historicalData]);
  
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
              {getCurrentDateFormatted()} (Manila)
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
              <PhCard phValue={sensorData.ph} avgPh={averages.avgPh} />
              <TemperatureCard temperatureValue={sensorData.temperature} avgTemp={averages.avgTemp} />
            </div>
            
            <WaterQualityCard 
              qualityValue={sensorData.quality}
              recommendation={recommendation}
              onUpdateReadings={loadHistoricalData}
              dataSource={lastUpdateSource}
              onRefreshHistory={loadHistoricalData}
              lastUpdated={sensorData.timestamp.toString()}
              avgQuality={averages.avgQuality}
            />
            
            <HistoricalChart 
              historicalData={historicalData}
              isLoading={isLoading} 
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
