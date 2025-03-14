
import { useState, useEffect } from "react";
import { SensorData, getWaterUseRecommendation, simulateSensorReading } from "@/lib/sensors";
import { toast } from "sonner";
import { getGeminiApiKey, validateApiKeyFormat } from "@/lib/env";

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
  const [apiKey, setApiKey] = useState<string>(() => {
    // Initialize with environment variable or localStorage value only (no default)
    return getGeminiApiKey();
  });
  const [recommendation, setRecommendation] = useState<string>("");
  
  useEffect(() => {
    // Load API key on initial render from environment or localStorage
    const initialApiKey = getGeminiApiKey();
    if (initialApiKey) {
      setApiKey(initialApiKey);
    }
    
    updateSensorData();
    
    // Changed from 3600000ms (1 hour) to 900000ms (15 minutes)
    const interval = setInterval(() => {
      updateSensorData();
    }, 900000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    // Store valid API keys in localStorage
    if (apiKey && validateApiKeyFormat(apiKey)) {
      localStorage.setItem("gemini-api-key", apiKey);
    }
  }, [apiKey]);
  
  useEffect(() => {
    const recommendation = getWaterUseRecommendation(sensorData.ph);
    setRecommendation(recommendation);
    
    setHistoricalData(prev => {
      const newData = [...prev, sensorData].slice(-24);
      return newData;
    });
  }, [sensorData]);
  
  const updateSensorData = () => {
    const newData = simulateSensorReading();
    setSensorData(newData);
    toast.success("Sensor data updated", { 
      description: `Timestamp: ${new Date(newData.timestamp).toLocaleTimeString()}` 
    });
  };
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PhCard phValue={sensorData.ph} />
              <TemperatureCard temperatureValue={sensorData.temperature} />
            </div>
            
            <WaterQualityCard 
              qualityValue={sensorData.quality}
              recommendation={recommendation}
              onUpdateReadings={updateSensorData}
            />
            
            <HistoricalChart historicalData={historicalData} />
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
