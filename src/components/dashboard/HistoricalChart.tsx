import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SensorReading } from "@/lib/supabase";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimeForChart } from "@/lib/datetime";

interface HistoricalChartProps {
  historicalData: SensorReading[];
  isLoading?: boolean;
}

const HistoricalChart = ({ historicalData, isLoading = false }: HistoricalChartProps) => {
  // Process data for the chart
  const chartData = historicalData.map(reading => ({
    time: formatTimeForChart(reading.created_at),
    ph: reading.ph ?? reading.pH,  // Handle both ph and pH properties
    temperature: reading.temperature,
    quality: reading.quality,
    created_at: reading.created_at
  })).sort((a, b) => {
    // Sort by timestamp (ascending) so chart reads left to right
    return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Historical Readings</CardTitle>
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
                  formatter={(value, name) => {
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoricalChart;
