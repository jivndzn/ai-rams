
import HistoricalChart from "@/components/dashboard/HistoricalChart";
import ChatSection from "@/components/dashboard/ChatSection";
import { SensorData } from "@/lib/sensors";
import { SensorReading } from "@/lib/supabase";

interface VisualizationSectionProps {
  historicalData: SensorReading[];
  isLoading: boolean;
  datasetsBySource: Record<string, SensorReading[]>;
  datasetsByTime: {
    today: SensorReading[];
    lastWeek: SensorReading[];
    older: SensorReading[];
  };
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
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 lg:gap-6">
      <div className="lg:col-span-1">
        <HistoricalChart 
          historicalData={historicalData}
          isLoading={isLoading} 
          datasetsBySource={datasetsBySource}
          datasetsByTime={datasetsByTime}
        />
      </div>
    </div>
  );
};

export default VisualizationSection;
