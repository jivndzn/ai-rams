
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bluetooth, BluetoothOff, RefreshCw, Info } from "lucide-react";
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
  const [compatInfo, setCompatInfo] = useState({ 
    isCompatible: false, 
    browserName: "", 
    message: "" 
  });
  
  useEffect(() => {
    // Get compatibility info when component mounts
    setCompatInfo(getBrowserCompatibilityInfo());
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      if (isConnected()) {
        disconnectDevice();
      } else {
        await connectToDevice();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadSensors = () => {
    onUpdateFromDevice();
  };

  if (!compatInfo.isCompatible) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <BluetoothOff className="mr-2 h-5 w-5 text-red-500" />
            Bluetooth Not Supported in {compatInfo.browserName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {compatInfo.message}
          </p>
          <p className="text-sm text-muted-foreground">
            Using simulated data instead. For real device connectivity, please switch to a supported browser.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Bluetooth className="mr-2 h-5 w-5 text-blue-500" />
          Sensor Connection
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2 h-6 w-6">
                <Info className="h-4 w-4" />
                <span className="sr-only">Bluetooth compatibility info</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Web Bluetooth is only fully supported in Chrome, Edge, and Opera on desktop and Android devices. 
                It is not supported in Firefox, Safari, or any iOS browser.
              </p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect to your Arduino Uno sensor via Bluetooth to read real-time data from the pH, temperature, and turbidity sensors.
          </p>
          <div className="flex space-x-2">
            <Button 
              onClick={handleConnect} 
              disabled={isLoading}
              variant={isConnected() ? "destructive" : "default"}
            >
              {isLoading ? 
                "Connecting..." : 
                isConnected() ? "Disconnect" : "Connect to Sensor"}
            </Button>
            
            {isConnected() && (
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
