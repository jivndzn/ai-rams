
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bluetooth, 
  BluetoothOff, 
  RefreshCw, 
  Info, 
  Smartphone,
  AlertCircle,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { 
  connectToDevice, 
  disconnectDevice, 
  isConnected, 
  isWebBluetoothSupported, 
  getBrowserCompatibilityInfo 
} from "@/lib/bluetooth";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  const [hasError, setHasError] = useState(false);
  const [acceptAllDevices, setAcceptAllDevices] = useState(false);
  
  useEffect(() => {
    // Get compatibility info when component mounts
    setCompatInfo(getBrowserCompatibilityInfo());
    // Set initial connection status
    setConnectionStatus(isConnected());

    // Add an interval to check connection status periodically
    const interval = setInterval(() => {
      const connected = isConnected();
      setConnectionStatus(connected);
      // Clear error state if we're connected
      if (connected) {
        setHasError(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      if (isConnected()) {
        await disconnectDevice();
        setConnectionStatus(false);
        toast.info("Disconnected from sensor device");
      } else {
        const success = await connectToDevice({
          // If accept all devices is enabled, we use that instead of filters
          acceptAllDevices: acceptAllDevices,
          filters: !acceptAllDevices ? [
            { namePrefix: "Arduino" },
            { namePrefix: "pH" },
            { namePrefix: "Water" },
            { namePrefix: "Sensor" }
          ] : undefined
        });
        
        setConnectionStatus(success);
        setHasError(!success);
        
        // After successful connection, read sensor data
        if (success) {
          toast.success("Successfully connected to Arduino device");
          onUpdateFromDevice();
        } else {
          toast.error("Bluetooth unsuccessful", {
            description: "Could not connect to Arduino device. Make sure it's powered on and in range."
          });
        }
      }
    } catch (error) {
      console.error("Bluetooth connection error:", error);
      setHasError(true);
      toast.error("Bluetooth unsuccessful", {
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
          Arduino Connection
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2 h-6 w-6">
                <Info className="h-4 w-4" />
                <span className="sr-only">Connection info</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Connect to any Arduino BLE device with environmental sensing capabilities.
                Data will be stored in Supabase once connected.
              </p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          {!compatInfo.isCompatible && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Browser not compatible</AlertTitle>
              <AlertDescription>
                {compatInfo.message}
              </AlertDescription>
            </Alert>
          )}
          
          {hasError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Bluetooth unsuccessful</AlertTitle>
              <AlertDescription>
                Could not connect to Arduino device. Please ensure your device is powered on, 
                in range, and has the correct Bluetooth service enabled.
              </AlertDescription>
            </Alert>
          )}
          
          <p className="text-sm text-muted-foreground">
            Connect to your Arduino sensor to read real-time data from the pH, temperature, and turbidity sensors.
            {!connectionStatus && " Currently using simulated data."}
          </p>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="accept-all"
              checked={acceptAllDevices}
              onCheckedChange={setAcceptAllDevices}
            />
            <Label htmlFor="accept-all">Show all Bluetooth devices</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Enable this option to see all available Bluetooth devices, not just those with Arduino-specific names.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={handleConnect} 
              disabled={isLoading || !compatInfo.isCompatible}
              variant={connectionStatus ? "destructive" : "default"}
              className={connectionStatus ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {isLoading ? (
                <>
                  <Search className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : connectionStatus ? (
                <>
                  <BluetoothOff className="mr-2 h-4 w-4" />
                  Disconnect
                </>
              ) : (
                <>
                  <Bluetooth className="mr-2 h-4 w-4" />
                  Connect to Arduino
                </>
              )}
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
