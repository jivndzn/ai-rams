
import { useState, useEffect } from "react";
import { SensorData, getWaterUseRecommendation, simulateSensorReading } from "@/lib/sensors";
import { toast } from "sonner";
import { getGeminiApiKey } from "@/lib/env";
import { readSensorData, isConnected } from "@/lib/bluetooth";

// Components
import DashboardHeader from "@/components/dashboard/Header";
import PhCard from "@/components/dashboard/PhCard";
import TemperatureCard from "@/components/dashboard/TemperatureCard";
import WaterQualityCard from "@/components/dashboard/WaterQualityCard";
import HistoricalChart from "@/components/dashboard/HistoricalChart";
import ChatSection from "@/components/dashboard/ChatSection";
import DashboardFooter from "@/components/dashboard/Footer";
import BluetoothConnector from "@/components/dashboard/BluetoothConnector";

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
  
  useEffect(() => {
    updateSensorData();
    
    const interval = setInterval(() => {
      updateSensorData();
    }, 900000); // 15 minutes
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const recommendation = getWaterUseRecommendation(sensorData.ph);
    setRecommendation(recommendation);
    
    setHistoricalData(prev => {
      const newData = [...prev, sensorData].slice(-24);
      return newData;
    });
  }, [sensorData]);
  
  const updateSensorData = async () => {
    // Try to read from Bluetooth device if connected
    if (isConnected()) {
      const deviceData = await readSensorData();
      if (deviceData) {
        setSensorData(deviceData);
        setLastUpdateSource("arduino");
        toast.success("Sensor data updated from Arduino device", { 
          description: `Timestamp: ${new Date(deviceData.timestamp).toLocaleTimeString()}` 
        });
        
        // Here we would add code to send the data to Supabase
        // once the Supabase integration is set up
        
        return;
      }
    }
    
    // Fall back to simulated data if no Bluetooth connection
    const newData = simulateSensorReading();
    setSensorData(newData);
    setLastUpdateSource("simulated");
    toast.info("Sensor data updated (simulated)", { 
      description: `Timestamp: ${new Date(newData.timestamp).toLocaleTimeString()}` 
    });
  };
  
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="max-w-full mx-auto p-4 md:p-6">
        <DashboardHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            <BluetoothConnector onUpdateFromDevice={updateSensorData} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <PhCard phValue={sensorData.ph} />
              <TemperatureCard temperatureValue={sensorData.temperature} />
            </div>
            
            <WaterQualityCard 
              qualityValue={sensorData.quality}
              recommendation={recommendation}
              onUpdateReadings={updateSensorData}
              dataSource={lastUpdateSource === "arduino" ? "Arduino device" : "Simulation"}
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
