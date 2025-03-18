
interface BluetoothDevice {
  gatt?: BluetoothRemoteGATTServer;
  id: string;
  name?: string;
  watchingAdvertisements: boolean;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
  dispatchEvent(event: Event): boolean;
  watchAdvertisements(): Promise<void>;
  unwatchAdvertisements(): void;
}

interface BluetoothRemoteGATTServer {
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryService(service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService>;
  getPrimaryServices(service?: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService[]>;
  readonly device: BluetoothDevice;
  readonly connected: boolean;
}

interface BluetoothRemoteGATTService {
  getCharacteristic(characteristic: BluetoothCharacteristicUUID): Promise<BluetoothRemoteGATTCharacteristic>;
  getCharacteristics(characteristic?: BluetoothCharacteristicUUID): Promise<BluetoothRemoteGATTCharacteristic[]>;
  readonly device: BluetoothDevice;
  readonly uuid: string;
  readonly isPrimary: boolean;
}

interface BluetoothRemoteGATTCharacteristic {
  readValue(): Promise<DataView>;
  writeValue(value: BufferSource): Promise<void>;
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
  dispatchEvent(event: Event): boolean;
  readonly service: BluetoothRemoteGATTService;
  readonly uuid: string;
  readonly properties: BluetoothCharacteristicProperties;
  readonly value: DataView | null;
}

interface BluetoothCharacteristicProperties {
  readonly broadcast: boolean;
  readonly read: boolean;
  readonly writeWithoutResponse: boolean;
  readonly write: boolean;
  readonly notify: boolean;
  readonly indicate: boolean;
  readonly authenticatedSignedWrites: boolean;
  readonly reliableWrite: boolean;
  readonly writableAuxiliaries: boolean;
}

interface Bluetooth {
  requestDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice>;
  getAvailability(): Promise<boolean>;
  getDevices(): Promise<BluetoothDevice[]>;
  requestLEScan(options?: BluetoothLEScanOptions): Promise<void>;
}

interface BluetoothLEScanOptions {
  acceptAllAdvertisements?: boolean;
  filters?: BluetoothLEScanFilter[];
  keepRepeatedDevices?: boolean;
}

interface RequestDeviceOptions {
  filters?: BluetoothLEScanFilter[];
  optionalServices?: BluetoothServiceUUID[];
  acceptAllDevices?: boolean;
}

interface BluetoothLEScanFilter {
  services?: BluetoothServiceUUID[];
  name?: string;
  namePrefix?: string;
  manufacturerData?: BluetoothManufacturerDataFilter[];
  serviceData?: BluetoothServiceDataFilter[];
}

interface BluetoothManufacturerDataFilter {
  companyIdentifier: number;
  dataPrefix?: BufferSource;
  mask?: BufferSource;
}

interface BluetoothServiceDataFilter {
  service: BluetoothServiceUUID;
  dataPrefix?: BufferSource;
  mask?: BufferSource;
}

type BluetoothServiceUUID = string | number;
type BluetoothCharacteristicUUID = string | number;

interface Navigator {
  bluetooth: Bluetooth;
}
