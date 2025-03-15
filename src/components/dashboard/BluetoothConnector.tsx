
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bluetooth, BluetoothOff, RefreshCw, Info, ExternalLink } from "lucide-react";
import { 
  connectToDevice, 
  disconnectDevice, 
  isConnected, 
  isWebBluetoothSupported, 
  getBrowserCompatibilityInfo 
} from "@/lib/bluetooth";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  
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
    } catch (error) {
      // Error handling is done in the bluetooth.ts file
      // We'll just display the dialog with help information
      setShowHelpDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadSensors = () => {
    onUpdateFromDevice();
  };

  const getBrowserSpecificHelp = () => {
    if (compatInfo.browserName === "Chrome" || compatInfo.browserName === "Edge") {
      return (
        <div className="space-y-4">
          <h3 className="font-medium">Follow these steps to enable Web Bluetooth:</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Copy and paste this URL in a new tab: <code className="bg-muted px-1 py-0.5 rounded">chrome://flags/#enable-web-bluetooth</code></li>
            <li>Change "Default" to "Enabled"</li>
            <li>Click the "Relaunch" button at the bottom of the page</li>
            <li>Return to this page and try connecting again</li>
          </ol>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <p>Web Bluetooth is not supported in {compatInfo.browserName}.</p>
          <p>Please switch to Chrome, Edge, or Opera to use this feature.</p>
        </div>
      );
    }
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
          <p className="text-sm text-muted-foreground mb-4">
            Using simulated data instead. For real device connectivity, please switch to a supported browser.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowHelpDialog(true)}
          >
            <Info className="mr-2 h-4 w-4" />
            Learn More
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
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
            <div className="flex flex-wrap gap-2">
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
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowHelpDialog(true)}
              >
                <Info className="mr-2 h-4 w-4" />
                Troubleshooting
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bluetooth Troubleshooting</DialogTitle>
            <DialogDescription>
              Web Bluetooth has specific browser requirements and may need to be enabled.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {getBrowserSpecificHelp()}
            
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-2">Additional Resources:</h3>
              <a 
                href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center"
              >
                Web Bluetooth API Documentation
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BluetoothConnector;
