
import PhCard from "@/components/dashboard/PhCard";
import TemperatureCard from "@/components/dashboard/TemperatureCard";
import WaterQualityCard from "@/components/dashboard/WaterQualityCard";
import { SensorData } from "@/lib/sensors";

interface SensorCardsGridProps {
  sensorData: SensorData;
  averages: {
    avgPh: number;
    avgTemp: number;
    avgQuality: number;
  };
  recommendation: string;
  mostRecentReading: any | null;
  qualityTrend?: 'rising' | 'falling' | 'stable';
}

const SensorCardsGrid = ({ 
  sensorData, 
  averages, 
  recommendation,
  mostRecentReading,
  qualityTrend
}: SensorCardsGridProps) => {
  return (
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
    </div>
  );
};

export default SensorCardsGrid;
