import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PhGauge from "@/components/PhGauge";
import TemperatureGauge from "@/components/TemperatureGauge";
import QualityGauge from "@/components/QualityGauge";
import ChatBox from "@/components/ChatBox";
import { SensorData, getWaterUseRecommendation, simulateSensorReading } from "@/lib/sensors";
import { Droplet, Thermometer, Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";

const Index = () => {
  const [sensorData, setSensorData] = useState<SensorData>({
    ph: 7.0,
    temperature: 22.0,
    quality: 75,
    timestamp: Date.now(),
  });
  const [historicalData, setHistoricalData] = useState<SensorData[]>([]);
  const [apiKey, setApiKey] = useState<string>("");
  const [recommendation, setRecommendation] = useState<string>("");
  
  useEffect(() => {
    const storedApiKey = localStorage.getItem("gemini-api-key");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
    
    updateSensorData();
    
    const interval = setInterval(() => {
      updateSensorData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (apiKey) {
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
      description: new Date(newData.timestamp).toLocaleTimeString() 
    });
  };
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center">
            <Droplet className="mr-2 h-8 w-8 text-aqua-500" />
            AquaBot: Rainwater Quality Analyzer
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time rainwater quality analysis and usage recommendations
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Droplet className="mr-2 h-5 w-5 text-aqua-500" />
                    pH Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PhGauge value={sensorData.ph} />
                  <p className="mt-6 text-sm text-muted-foreground">
                    {sensorData.ph < 7 
                      ? "Acidic water (pH < 7)" 
                      : sensorData.ph > 7 
                        ? "Alkaline water (pH > 7)" 
                        : "Neutral water (pH = 7)"}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Thermometer className="mr-2 h-5 w-5 text-orange-500" />
                    Temperature
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TemperatureGauge value={sensorData.temperature} />
                  <p className="mt-6 text-sm text-muted-foreground">
                    {sensorData.temperature < 15 
                      ? "Cool water temperature" 
                      : sensorData.temperature > 25 
                        ? "Warm water temperature" 
                        : "Moderate water temperature"}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Activity className="mr-2 h-5 w-5 text-teal-500" />
                  Overall Water Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QualityGauge value={sensorData.quality} />
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-1">Recommended Use:</h3>
                  <p className="text-lg">{recommendation}</p>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-4 w-full" 
                  onClick={updateSensorData}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Update Readings
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Historical Readings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={historicalData.map(data => ({
                        ...data,
                        time: formatTime(data.timestamp)
                      }))}
                      margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="time" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value, index) => index % 4 === 0 ? value : ''}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(label) => `Time: ${label}`}
                        formatter={(value, name) => {
                          if (name === 'quality') return [`${value}%`, 'Quality'];
                          if (name === 'ph') return [`${value.toFixed(1)}`, 'pH'];
                          if (name === 'temperature') return [`${value.toFixed(1)}°C`, 'Temperature'];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="ph" 
                        stroke="#0098d1" 
                        name="pH"
                        strokeWidth={2}
                        dot={{ r: 1 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="temperature" 
                        stroke="#f97316" 
                        name="Temperature"
                        strokeWidth={2}
                        dot={{ r: 1 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="quality" 
                        stroke="#0ca05f" 
                        name="Quality"
                        strokeWidth={2}
                        dot={{ r: 1 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">AquaBot Assistant</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-4rem)]">
                <ChatBox 
                  sensorData={sensorData} 
                  apiKey={apiKey}
                  setApiKey={(key) => setApiKey(key)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>AquaBot Rainwater Analysis System • Data updates every 30 seconds</p>
          <p className="mt-1">Powered by Gemini AI • {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
