
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bluetooth, BluetoothOff, RefreshCw } from "lucide-react";
import { connectToDevice, disconnectDevice, isConnected, isWebBluetoothSupported } from "@/lib/bluetooth";

interface BluetoothConnectorProps {
  onUpdateFromDevice: () => void;
}

const BluetoothConnector: React.FC<BluetoothConnectorProps> = ({ onUpdateFromDevice }) => {
  const [isLoading, setIsLoading] = useState(false);
  const supported = isWebBluetoothSupported();

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

  if (!supported) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <BluetoothOff className="mr-2 h-5 w-5 text-red-500" />
            Bluetooth Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your browser doesn't support the Web Bluetooth API. Try using Chrome, Edge, or Opera on a desktop or Android device.
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
