
import HistoricalChart from "@/components/dashboard/HistoricalChart";
import ChatSection from "@/components/dashboard/ChatSection";
import { SensorData } from "@/lib/sensors";

interface VisualizationSectionProps {
  historicalData: any[];
  isLoading: boolean;
  datasetsBySource: Record<string, any[]>;
  datasetsByTime: Record<string, any[]>;
  sensorData: SensorData;
  apiKey: string;
  setApiKey: (key: string) => void;
}

const VisualizationSection = ({
  historicalData,
  isLoading,
  datasetsBySource,
  datasetsByTime,
  sensorData,
  apiKey,
  setApiKey
}: VisualizationSectionProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
      <div className="lg:col-span-2">
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
  );
};

export default VisualizationSection;
