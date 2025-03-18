
import { toast } from "sonner";
import { SensorData, simulateSensorReading } from "./sensors";

// Define the Bluetooth Service and Characteristic UUIDs
// Standard UUIDs for Arduino and environmental sensing
const ENVIRONMENTAL_SENSING_SERVICE = "0000181a-0000-1000-8000-00805f9b34fb";
const ARDUINO_SERVICE = "19b10000-e8f2-537e-4f6c-d104768a1214"; // Common Arduino BLE service
const GENERIC_SERVICE = "00001800-0000-1000-8000-00805f9b34fb"; // Generic Access service - full UUID format

// Characteristic UUIDs
const PH_CHARACTERISTIC_UUID = "00002a6e-0000-1000-8000-00805f9b34fb"; // pH level
const TEMPERATURE_CHARACTERISTIC_UUID = "00002a6e-0000-1000-8000-00805f9b34fb"; // Temperature
const TURBIDITY_CHARACTERISTIC_UUID = "00002a6e-0000-1000-8000-00805f9b34fb"; // Turbidity (quality)

interface BluetoothState {
  device: BluetoothDevice | null;
  server: BluetoothRemoteGATTServer | null;
  service: BluetoothRemoteGATTService | null;
  phCharacteristic: BluetoothRemoteGATTCharacteristic | null;
  temperatureCharacteristic: BluetoothRemoteGATTCharacteristic | null;
  turbidityCharacteristic: BluetoothRemoteGATTCharacteristic | null;
  connected: boolean;
}

// Connection options interface
interface ConnectionOptions {
  filters?: BluetoothLEScanFilter[];
  acceptAllDevices?: boolean;
}

// Initialize the Bluetooth state
const bluetoothState: BluetoothState = {
  device: null,
  server: null,
  service: null,
  phCharacteristic: null,
  temperatureCharacteristic: null,
  turbidityCharacteristic: null,
  connected: false
};

// Check if Web Bluetooth API is supported by the browser
export const isWebBluetoothSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 
         typeof navigator.bluetooth !== 'undefined';
};

// Get browser compatibility information
export const getBrowserCompatibilityInfo = (): { 
  isCompatible: boolean; 
  browserName: string;
  message: string;
} => {
  const ua = navigator.userAgent;
  let browserName = "Unknown";
  let isCompatible = false;
  
  // Detect browser
  if (ua.includes("Chrome") && !ua.includes("Edg")) {
    browserName = "Chrome";
    isCompatible = true;
  } else if (ua.includes("Edg")) {
    browserName = "Edge";
    isCompatible = true;
  } else if (ua.includes("Opera") || ua.includes("OPR")) {
    browserName = "Opera";
    isCompatible = true;
  } else if (ua.includes("Firefox")) {
    browserName = "Firefox";
    isCompatible = false;
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    browserName = "Safari";
    isCompatible = false;
  }

  const message = isCompatible 
    ? "Your browser supports Bluetooth connectivity."
    : "Your browser doesn't support WebBluetooth API. Please use Chrome, Edge or Opera.";

  return { isCompatible, browserName, message };
};

// Connect to an Arduino Bluetooth device
export const connectToDevice = async (options: ConnectionOptions = {}): Promise<boolean> => {
  try {
    const { isCompatible } = getBrowserCompatibilityInfo();
    
    if (!isCompatible) {
      toast.error("Browser not compatible", {
        description: "Your browser doesn't support Bluetooth. Please use Chrome, Edge or Opera."
      });
      return false;
    }
    
    // Set default request options if not provided
    const requestOptions: RequestDeviceOptions = {
      acceptAllDevices: options.acceptAllDevices || false,
      filters: options.filters || [
        { namePrefix: "Arduino" },
        { namePrefix: "pH" },
        { namePrefix: "Water" },
        { namePrefix: "Sensor" }
      ],
      optionalServices: [
        ENVIRONMENTAL_SENSING_SERVICE,
        ARDUINO_SERVICE,
        GENERIC_SERVICE
      ]
    };

    // Request the device
    toast.info("Searching for Arduino devices...");
    
    const device = await navigator.bluetooth.requestDevice(requestOptions);

    // Add event listener for disconnection
    device.addEventListener('gattserverdisconnected', onDisconnected);

    toast.info(`Connecting to ${device.name || "Arduino"}...`);
    
    // Connect to the GATT server
    const server = await device.gatt?.connect();
    if (!server) {
      throw new Error("Failed to connect to GATT server");
    }

    // Try to get the primary services in order of preference
    let service: BluetoothRemoteGATTService | null = null;
    
    try {
      service = await server.getPrimaryService(ENVIRONMENTAL_SENSING_SERVICE);
      console.log("Connected to Environmental Sensing service");
    } catch (e) {
      try {
        service = await server.getPrimaryService(ARDUINO_SERVICE);
        console.log("Connected to Arduino service");
      } catch (e2) {
        try {
          service = await server.getPrimaryService(GENERIC_SERVICE);
          console.log("Connected to Generic service");
        } catch (e3) {
          throw new Error("No compatible services found on device");
        }
      }
    }
    
    if (!service) {
      throw new Error("Could not connect to any compatible service");
    }
    
    // Get characteristics - use try/catch for each to handle possible missing characteristics
    let phCharacteristic = null;
    let temperatureCharacteristic = null;
    let turbidityCharacteristic = null;
    
    try {
      phCharacteristic = await service.getCharacteristic(PH_CHARACTERISTIC_UUID);
    } catch (e) {
      console.warn("pH characteristic not found");
    }
    
    try {
      temperatureCharacteristic = await service.getCharacteristic(TEMPERATURE_CHARACTERISTIC_UUID);
    } catch (e) {
      console.warn("Temperature characteristic not found");
    }
    
    try {
      turbidityCharacteristic = await service.getCharacteristic(TURBIDITY_CHARACTERISTIC_UUID);
    } catch (e) {
      console.warn("Turbidity characteristic not found");
    }
    
    // Save to state
    bluetoothState.device = device;
    bluetoothState.server = server;
    bluetoothState.service = service;
    bluetoothState.phCharacteristic = phCharacteristic;
    bluetoothState.temperatureCharacteristic = temperatureCharacteristic;
    bluetoothState.turbidityCharacteristic = turbidityCharacteristic;
    bluetoothState.connected = true;
    
    toast.success(`Connected to ${device.name || "Arduino Sensor"}`);
    return true;
  } catch (error) {
    console.error("Bluetooth connection error:", error);
    toast.error("Bluetooth unsuccessful", {
      description: error instanceof Error 
        ? error.message 
        : "Could not connect to Arduino device. Make sure it's powered on and in range."
    });
    return false;
  }
};

// Disconnect from the device
export const disconnectDevice = (): void => {
  if (bluetoothState.connected) {
    if (bluetoothState.server) {
      bluetoothState.server.disconnect();
    }
    resetBluetoothState();
    toast.info("Disconnected from device");
  }
};

// Handle disconnection event
const onDisconnected = (): void => {
  toast.warning("Device disconnected");
  resetBluetoothState();
};

// Reset the Bluetooth state
const resetBluetoothState = (): void => {
  bluetoothState.device = null;
  bluetoothState.server = null;
  bluetoothState.service = null;
  bluetoothState.phCharacteristic = null;
  bluetoothState.temperatureCharacteristic = null;
  bluetoothState.turbidityCharacteristic = null;
  bluetoothState.connected = false;
};

// Check if currently connected
export const isConnected = (): boolean => {
  return bluetoothState.connected;
};

// Read sensor data from the connected device
export const readSensorData = async (): Promise<SensorData | null> => {
  try {
    if (!bluetoothState.connected) {
      toast.error("Not connected to any device");
      return null;
    }

    let phValue = 7.0;
    let temperature = 22.0;
    let quality = 75;
    
    // Try to read each value, falling back to defaults if a characteristic is missing
    // or if reading fails
    
    if (bluetoothState.phCharacteristic) {
      try {
        const value = await bluetoothState.phCharacteristic.readValue();
        phValue = parseFloat(new TextDecoder().decode(value)) || phValue;
      } catch (e) {
        console.warn("Failed to read pH value", e);
      }
    }
    
    if (bluetoothState.temperatureCharacteristic) {
      try {
        const value = await bluetoothState.temperatureCharacteristic.readValue();
        temperature = parseFloat(new TextDecoder().decode(value)) || temperature;
      } catch (e) {
        console.warn("Failed to read temperature value", e);
      }
    }
    
    if (bluetoothState.turbidityCharacteristic) {
      try {
        const value = await bluetoothState.turbidityCharacteristic.readValue();
        quality = parseFloat(new TextDecoder().decode(value)) || quality;
      } catch (e) {
        console.warn("Failed to read quality value", e);
      }
    }
    
    return {
      ph: phValue,
      temperature,
      quality,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Error reading sensor data:", error);
    toast.error("Failed to read sensor data", {
      description: "Check if device is still connected and try again."
    });
    return null;
  }
};
