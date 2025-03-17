
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bluetooth, BluetoothOff, RefreshCw, Info, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { 
  connectToDevice, 
  disconnectDevice, 
  isConnected, 
  isWebBluetoothSupported, 
  getBrowserCompatibilityInfo 
} from "@/lib/bluetooth";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface BluetoothConnectorProps {
  onUpdateFromDevice: () => void;
}

const BluetoothConnector: React.FC<BluetoothConnectorProps> = ({ onUpdateFromDevice }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(isConnected());
  const [compatInfo, setCompatInfo] = useState({ 
    isCompatible: false, 
    browserName: "", 
    message: "" 
  });
  
  useEffect(() => {
    // Get compatibility info when component mounts
    setCompatInfo(getBrowserCompatibilityInfo());
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
        await disconnectDevice();
        setConnectionStatus(false);
        toast.info("Disconnected from sensor device");
      } else {
        const success = await connectToDevice({
          // These filter options will only show relevant sensor devices
          // rather than all Bluetooth devices
          filters: [
            { services: ["environmental_sensing"] },
            { namePrefix: "pH" },
            { namePrefix: "Water" },
            { namePrefix: "Sensor" },
            { namePrefix: "Arduino" }
          ]
        });
        
        setConnectionStatus(success);
        
        // After successful connection, read sensor data
        if (success) {
          toast.success("Successfully connected to sensor device");
          onUpdateFromDevice();
        } else {
          toast.error("Failed to connect to sensor device", {
            description: "Please make sure your device is powered on and in range."
          });
        }
      }
    } catch (error) {
      console.error("Bluetooth connection error:", error);
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
            <Bluetooth className="mr-2 h-5 w-5 text-blue-500" />
          ) : (
            <Smartphone className="mr-2 h-5 w-5 text-blue-500" />
          )}
          Sensor Connection
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2 h-6 w-6">
                <Info className="h-4 w-4" />
                <span className="sr-only">Connection info</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Connect to any Bluetooth Low Energy sensor device or direct hardware interface.
                Works with most modern browsers and mobile devices.
              </p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect to your sensor hardware to read real-time data from the pH, temperature, and turbidity sensors.
            {!connectionStatus && " Currently using simulated data."}
          </p>
          
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
      </CardContent>
    </Card>
  );
};

export default BluetoothConnector;
