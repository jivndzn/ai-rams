
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SensorReading } from "@/lib/supabase";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimeForChart, isValidDate } from "@/lib/datetime";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HistoricalChartProps {
  historicalData: SensorReading[];
  isLoading?: boolean;
  datasetsBySource?: Record<string, SensorReading[]>;
  datasetsByTime?: {
    today: SensorReading[];
    lastWeek: SensorReading[];
    older: SensorReading[];
  };
}

const HistoricalChart = ({ 
  historicalData, 
  isLoading = false,
  datasetsBySource,
  datasetsByTime
}: HistoricalChartProps) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'all'>('all');
  const [dataSource, setDataSource] = useState<string>('all');
  
  // Process data for the chart based on selected filters
  const processChartData = () => {
    let filteredData = [...historicalData];
    
    // Filter by time range if datasetsByTime is available
    if (datasetsByTime && timeRange !== 'all') {
      if (timeRange === 'today') {
        filteredData = datasetsByTime.today;
      } else if (timeRange === 'week') {
        filteredData = [...datasetsByTime.today, ...datasetsByTime.lastWeek];
      }
    }
    
    // Filter by data source if datasetsBySource is available and not 'all'
    if (datasetsBySource && dataSource !== 'all') {
      filteredData = datasetsBySource[dataSource] || [];
    }
    
    return filteredData
      .filter(reading => reading.created_at && isValidDate(reading.created_at))
      .map(reading => ({
        time: formatTimeForChart(reading.created_at),
        ph: reading.ph ?? reading.pH,  // Handle both ph and pH properties
        temperature: reading.temperature,
        quality: reading.quality,
        created_at: reading.created_at,
        data_source: reading.data_source
      }))
      .sort((a, b) => {
        // Sort by timestamp (ascending) so chart reads left to right
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      });
  };
  
  const chartData = processChartData();
  
  // Generate sources for filter
  const availableSources = datasetsBySource 
    ? Object.keys(datasetsBySource)
    : [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle className="text-lg">Historical Readings</CardTitle>
          
          <div className="flex flex-wrap gap-2">
            {datasetsByTime && (
              <Tabs defaultValue={timeRange} onValueChange={(value) => setTimeRange(value as 'today' | 'week' | 'all')}>
                <TabsList className="h-8">
                  <TabsTrigger value="today" className="text-xs px-2 h-7">Today</TabsTrigger>
                  <TabsTrigger value="week" className="text-xs px-2 h-7">Week</TabsTrigger>
                  <TabsTrigger value="all" className="text-xs px-2 h-7">All Time</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            
            {availableSources.length > 1 && (
              <Tabs defaultValue={dataSource} onValueChange={setDataSource}>
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="text-xs px-2 h-7">All Sources</TabsTrigger>
                  {availableSources.map(source => (
                    <TabsTrigger key={source} value={source} className="text-xs px-2 h-7">
                      {source.charAt(0).toUpperCase() + source.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="space-y-2 w-full">
              <Skeleton className="h-[250px] w-full rounded-xl" /> 
              <div className="flex justify-between">
                <Skeleton className="h-4 w-[100px]" /> 
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value, index) => index % 3 === 0 ? value : ''}
                  />
                  <YAxis 
                    yAxisId="ph"
                    orientation="left" 
                    domain={[0, 14]} 
                    label={{ value: 'pH', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis 
                    yAxisId="temp" 
                    orientation="right" 
                    domain={['auto', 'auto']} 
                    label={{ value: '°C', angle: -90, position: 'insideRight' }}
                  />
                  <Tooltip 
                    labelFormatter={(label) => `Time: ${label}`}
                    formatter={(value, name, props) => {
                      if (name === 'quality') return [`${typeof value === 'number' ? value.toFixed(0) : value}%`, 'Quality'];
                      if (name === 'ph') return [`${typeof value === 'number' ? value.toFixed(1) : value}`, 'pH'];
                      if (name === 'temperature') return [`${typeof value === 'number' ? value.toFixed(1) : value}°C`, 'Temperature'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="ph" 
                    yAxisId="ph"
                    stroke="#0098d1" 
                    name="pH"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    yAxisId="temp"
                    stroke="#f97316" 
                    name="Temperature"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="quality" 
                    yAxisId="ph" // Use pH axis for quality as it's also 0-100
                    stroke="#0ca05f" 
                    name="Quality"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No valid data available to display
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoricalChart;
