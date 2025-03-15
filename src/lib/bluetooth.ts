
import { toast } from "sonner";
import { SensorData } from "./sensors";

// Define the Bluetooth Service and Characteristic UUIDs
// These should match what's configured on your Arduino
const SENSOR_SERVICE_UUID = "0000181a-0000-1000-8000-00805f9b34fb"; // Environmental Sensing service
const PH_CHARACTERISTIC_UUID = "00002a6e-0000-1000-8000-00805f9b34fb"; // pH level
const TEMPERATURE_CHARACTERISTIC_UUID = "00002a6e-0000-1000-8000-00805f9b34fb"; // Temperature
const TURBIDITY_CHARACTERISTIC_UUID = "00002a6e-0000-1000-8000-00805f9b34fb"; // Turbidity (quality)

interface BluetoothState {
  device: globalThis.BluetoothDevice | null;
  server: BluetoothRemoteGATTServer | null;
  service: BluetoothRemoteGATTService | null;
  phCharacteristic: BluetoothRemoteGATTCharacteristic | null;
  temperatureCharacteristic: BluetoothRemoteGATTCharacteristic | null;
  turbidityCharacteristic: BluetoothRemoteGATTCharacteristic | null;
  connected: boolean;
}

// Initialize the Bluetooth state
const bluetoothState: BluetoothState = {
  device: null,
  server: null,
  service: null,
  phCharacteristic: null,
  temperatureCharacteristic: null,
  turbidityCharacteristic: null,
  connected: false,
};

// Check if Web Bluetooth API is supported
export const isWebBluetoothSupported = (): boolean => {
  return navigator.bluetooth !== undefined;
};

// Connect to a Bluetooth device
export const connectToDevice = async (): Promise<boolean> => {
  try {
    if (!isWebBluetoothSupported()) {
      toast.error("Web Bluetooth API is not supported in this browser");
      return false;
    }

    // Request the device with the specific service
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [SENSOR_SERVICE_UUID] }],
    });

    // Add event listener for disconnection
    device.addEventListener('gattserverdisconnected', onDisconnected);

    toast.info("Connecting to device...");
    
    // Connect to the GATT server
    const server = await device.gatt?.connect();
    if (!server) {
      toast.error("Failed to connect to GATT server");
      return false;
    }

    // Get the service
    const service = await server.getPrimaryService(SENSOR_SERVICE_UUID);
    
    // Get characteristics
    const phCharacteristic = await service.getCharacteristic(PH_CHARACTERISTIC_UUID);
    const temperatureCharacteristic = await service.getCharacteristic(TEMPERATURE_CHARACTERISTIC_UUID);
    const turbidityCharacteristic = await service.getCharacteristic(TURBIDITY_CHARACTERISTIC_UUID);
    
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
    toast.error(`Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return false;
  }
};

// Disconnect from the device
export const disconnectDevice = (): void => {
  if (bluetoothState.device && bluetoothState.connected) {
    bluetoothState.server?.disconnect();
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

    // Read pH value
    const phValue = await bluetoothState.phCharacteristic?.readValue();
    const ph = phValue ? parseFloat(new TextDecoder().decode(phValue)) : 7.0;
    
    // Read temperature value
    const tempValue = await bluetoothState.temperatureCharacteristic?.readValue();
    const temperature = tempValue ? parseFloat(new TextDecoder().decode(tempValue)) : 22.0;
    
    // Read turbidity (quality) value
    const qualityValue = await bluetoothState.turbidityCharacteristic?.readValue();
    const quality = qualityValue ? parseFloat(new TextDecoder().decode(qualityValue)) : 75;
    
    return {
      ph,
      temperature,
      quality,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Error reading sensor data:", error);
    toast.error("Failed to read sensor data");
    return null;
  }
};
