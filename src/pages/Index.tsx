
import { useState, useEffect } from "react";
import { SensorData, getWaterUseRecommendation, simulateSensorReading } from "@/lib/sensors";
import { toast } from "sonner";
import { getGeminiApiKey } from "@/lib/env";
import { saveSensorReading, getLatestSensorReadings } from "@/lib/supabase";

// Components
import DashboardHeader from "@/components/dashboard/Header";
import PhCard from "@/components/dashboard/PhCard";
import TemperatureCard from "@/components/dashboard/TemperatureCard";
import WaterQualityCard from "@/components/dashboard/WaterQualityCard";
import HistoricalChart from "@/components/dashboard/HistoricalChart";
import ChatSection from "@/components/dashboard/ChatSection";
import DashboardFooter from "@/components/dashboard/Footer";

const Index = () => {
  const [sensorData, setSensorData] = useState<SensorData>({
    ph: 7.0,
    temperature: 22.0,
    quality: 75,
    timestamp: Date.now(),
  });
  const [historicalData, setHistoricalData] = useState<SensorData[]>([]);
  const [apiKey, setApiKey] = useState<string>(getGeminiApiKey());
  const [recommendation, setRecommendation] = useState<string>("");
  const [lastUpdateSource, setLastUpdateSource] = useState<"arduino" | "simulated">("simulated");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  useEffect(() => {
    // Load historical data first
    loadHistoricalData().then(() => {
      // Only update with simulated data if we don't have historical data
      if (historicalData.length === 0) {
        updateSensorData();
      }
    });
    
    const interval = setInterval(() => {
      updateSensorData();
    }, 900000); // 15 minutes
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const recommendation = getWaterUseRecommendation(sensorData.ph);
    setRecommendation(recommendation);
    
    // Only add to historical data if this is new data
    // (prevents duplicating data when component re-renders)
    if (historicalData.length === 0 || 
        sensorData.timestamp !== historicalData[historicalData.length - 1].timestamp) {
      setHistoricalData(prev => {
        const newData = [...prev, sensorData].slice(-24);
        return newData;
      });
    }
  }, [sensorData]);
  
  const loadHistoricalData = async () => {
    try {
      setIsLoading(true);
      const readings = await getLatestSensorReadings(24);
      
      if (readings.length > 0) {
        // Convert Supabase data to SensorData format
        const historicalReadings: SensorData[] = readings.map(reading => ({
          ph: reading.ph, // Note the capitalization here - matches Supabase column
          temperature: reading.temperature,
          quality: reading.quality,
          timestamp: reading.created_at ? new Date(reading.created_at).getTime() : Date.now(),
        }));
        
        setHistoricalData(historicalReadings);
        
        // Update current sensor data with the most recent reading
        const mostRecent = historicalReadings[0];
        if (mostRecent) {
          setSensorData(mostRecent);
          setLastUpdateSource(mostRecent.data_source === "arduino_uno" ? "arduino" : "simulated");
        }
        
        toast.success("Loaded historical sensor data", {
          description: `Loaded ${readings.length} readings from database`
        });
      } else {
        toast.info("No historical data found", {
          description: "Connect your Arduino to start collecting data"
        });
      }
    } catch (error) {
      console.error("Failed to load historical data:", error);
      toast.error("Failed to load historical data", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsLoading(false);
    }
    
    return historicalData.length > 0;
  };
  
  const updateSensorData = async () => {
    try {
      // Use simulated data
      const newData = simulateSensorReading();
      setSensorData(newData);
      setLastUpdateSource("simulated");
      
      // Only show notification when debugging
      if (process.env.NODE_ENV === "development") {
        toast.info("Using simulated sensor data", { 
          description: `Simulation at ${new Date().toLocaleTimeString()}` 
        });
      }
    } catch (error) {
      console.error("Error updating sensor data:", error);
      toast.error("Failed to update sensor data");
    }
  };
  
  const handleManualRefresh = () => {
    toast.info("Refreshing sensor data...");
    updateSensorData();
  };
  
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="max-w-full mx-auto p-4 md:p-6">
        <DashboardHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <PhCard phValue={sensorData.ph} />
              <TemperatureCard temperatureValue={sensorData.temperature} />
            </div>
            
            <WaterQualityCard 
              qualityValue={sensorData.quality}
              recommendation={recommendation}
              onUpdateReadings={handleManualRefresh}
              dataSource={lastUpdateSource === "arduino" ? "Arduino via Python" : "Simulation"}
              onRefreshHistory={loadHistoricalData}
              lastUpdated={new Date(sensorData.timestamp).toLocaleString()}
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
