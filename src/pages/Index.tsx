
import { useState } from "react";
import { getGeminiApiKey } from "@/lib/env";
import { useNavigate } from "react-router-dom";
import { useDashboardData } from "@/hooks/useDashboardData";

// Components
import DashboardHeader from "@/components/dashboard/Header";
import DashboardFooter from "@/components/dashboard/Footer";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import SensorCardsGrid from "@/components/dashboard/SensorCardsGrid";
import VisualizationSection from "@/components/dashboard/VisualizationSection";

const Index = () => {
  const [apiKey, setApiKey] = useState<string>(getGeminiApiKey());
  const navigate = useNavigate();
  
  // Use our custom hook to get all dashboard data
  const { 
    historicalData,
    isLoading,
    datasetsBySource,
    datasetsByTime,
    sensorData,
    mostRecentReading,
    recommendation,
    averages,
    qualityTrend
  } = useDashboardData();
  
  const handleViewHistory = () => {
    navigate('/history');
  };
  
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="max-w-full mx-auto p-4 md:p-6">
        <DashboardHeader />
        
        <DashboardTopBar onViewHistory={handleViewHistory} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
          <SensorCardsGrid 
            sensorData={sensorData}
            averages={averages}
            recommendation={recommendation}
            mostRecentReading={mostRecentReading}
            qualityTrend={qualityTrend}
          />
          
          <div className="lg:col-span-1">
            <ChatSection 
              sensorData={sensorData}
              apiKey={apiKey}
              setApiKey={setApiKey}
            />
          </div>
        </div>
        
        <VisualizationSection
          historicalData={historicalData}
          isLoading={isLoading}
          datasetsBySource={datasetsBySource}
          datasetsByTime={datasetsByTime}
          sensorData={sensorData}
          apiKey={apiKey}
          setApiKey={setApiKey}
        />
        
        <DashboardFooter />
      </div>
    </div>
  );
};

export default Index;
