
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi, WifiOff, RefreshCw, Info } from "lucide-react";
import { toast } from "sonner";
import { 
  connectToDevice, 
  disconnectDevice, 
  isConnected, 
  getNetworkCompatibilityInfo 
} from "@/lib/wifi";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";

interface WiFiConnectorProps {
  onUpdateFromDevice: () => void;
}

const WiFiConnector: React.FC<WiFiConnectorProps> = ({ onUpdateFromDevice }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(isConnected());
  const [customIP, setCustomIP] = useState("192.168.4.1");
  const [compatInfo, setCompatInfo] = useState({ 
    isCompatible: false, 
    browserName: "", 
    message: "" 
  });
  
  useEffect(() => {
    // Get compatibility info when component mounts
    setCompatInfo(getNetworkCompatibilityInfo());
    // Set initial connection status
    setConnectionStatus(isConnected());

    // Add an interval to check connection status periodically
    const interval = setInterval(() => {
      setConnectionStatus(isConnected());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      if (isConnected()) {
        disconnectDevice();
        setConnectionStatus(false);
        toast.info("Disconnected from sensor device");
      } else {
        const formattedIP = customIP.startsWith('http') 
          ? customIP 
          : `http://${customIP}`;
        
        const success = await connectToDevice({
          customIP: formattedIP
        });
        
        setConnectionStatus(success);
        
        // After successful connection, read sensor data
        if (success) {
          toast.success("Successfully connected to sensor device");
          onUpdateFromDevice();
        } else {
          toast.error("Failed to connect to sensor device", {
            description: "Please make sure your device is powered on and the IP address is correct."
          });
        }
      }
    } catch (error) {
      console.error("WiFi connection error:", error);
      toast.error("Connection error", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadSensors = () => {
    toast.info("Reading sensor data...");
    onUpdateFromDevice();
  };

  return (
    <Card className="mb-4 lg:mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          {connectionStatus ? (
            <Wifi className="mr-2 h-5 w-5 text-blue-500" />
          ) : (
            <WifiOff className="mr-2 h-5 w-5 text-muted-foreground" />
          )}
          WiFi Sensor Connection
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2 h-6 w-6">
                <Info className="h-4 w-4" />
                <span className="sr-only">Connection info</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Connect to an ESP8266/ESP32 WiFi sensor or any HTTP-based sensor API.
                Enter the sensor's IP address to establish a connection.
              </p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect to your WiFi sensor hardware to read real-time data from pH, temperature, and turbidity sensors.
            {!connectionStatus && " Currently using simulated data."}
          </p>
          
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2">
              <Input 
                type="text" 
                value={customIP} 
                onChange={(e) => setCustomIP(e.target.value)}
                placeholder="Sensor IP Address (e.g., 192.168.4.1)"
                disabled={isLoading || connectionStatus}
                className="max-w-xs"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleConnect} 
                disabled={isLoading}
                variant={connectionStatus ? "destructive" : "default"}
                className={connectionStatus ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              >
                {isLoading ? 
                  "Connecting..." : 
                  connectionStatus ? "Disconnect" : "Connect to Sensor"}
              </Button>
              
              {connectionStatus && (
                <Button 
                  onClick={handleReadSensors} 
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Read Sensors
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WiFiConnector;
