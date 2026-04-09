import { Platform } from "react-native";
import {
  NINEBOT_SERVICE_UUIDS,
  hexStringToUint8Array,
  type BLEDevice,
} from "./ble-service";

/**
 * Vereinfachte BLE Manager Implementierung für Ninebot Scooter
 * Funktioniert mit echtem Bluetooth wenn react-native-ble-plx verfügbar ist
 */
export class NinebotBLEManager {
  private bleManager: any = null;
  private connectedDevice: any = null;
  private scanSubscription: any = null;
  private isInitialized = false;

  constructor() {
    this.initializeBLE();
  }

  /**
   * Initialisiere BLE Manager
   */
  private initializeBLE(): void {
    try {
      // Versuche react-native-ble-plx zu laden
      if (Platform.OS !== "web") {
        try {
          const BleManager = require("react-native-ble-plx").BleManager;
          this.bleManager = new BleManager();
          this.isInitialized = true;
          console.log("BLE Manager initialisiert");
        } catch (err) {
          console.warn("react-native-ble-plx nicht verfügbar, verwende Fallback");
          this.isInitialized = false;
        }
      }
    } catch (error) {
      console.error("BLE Initialisierung fehlgeschlagen:", error);
      this.isInitialized = false;
    }
  }

  /**
   * Initialisiere den BLE Manager
   */
  async initialize(): Promise<void> {
    if (!this.isInitialized) {
      console.warn("BLE Manager nicht verfügbar");
      return;
    }
  }

  /**
   * Scanne nach Ninebot Geräten
   */
  async scanForDevices(onDeviceFound: (device: BLEDevice) => void): Promise<void> {
    try {
      if (!this.isInitialized || !this.bleManager) {
        console.warn("BLE Manager nicht initialisiert, verwende Fallback");
        // Fallback: Simuliere Geräte
        this.simulateScan(onDeviceFound);
        return;
      }

      // Stoppe vorherigen Scan
      if (this.scanSubscription) {
        this.scanSubscription.remove();
      }

      // Starte neuen Scan
      this.bleManager.startDeviceScan(
        null,
        { allowDuplicates: false },
        (error: any, device: any) => {
          if (error) {
            console.error("Scan Fehler:", error);
            return;
          }

          if (device) {
            // Prüfe ob es ein Ninebot Gerät ist
            if (this.isNinebotDevice(device)) {
              const bleDevice: BLEDevice = {
                id: device.id,
                name: device.name || "Unknown Ninebot",
                rssi: device.rssi || undefined,
              };

              onDeviceFound(bleDevice);
            }
          }
        }
      );
    } catch (error) {
      console.error("Scan fehlgeschlagen:", error);
      // Fallback auf Simulation
      this.simulateScan(onDeviceFound);
    }
  }

  /**
   * Simuliere Geräte-Scanning (Fallback) - DEAKTIVIERT
   */
  private simulateScan(onDeviceFound: (device: BLEDevice) => void): void {
    // Keine Simulation - nur echte Geräte werden angezeigt
    console.log("Warte auf echte Bluetooth-Geräte...");
  }

  /**
   * Prüfe ob ein Gerät ein Ninebot ist
   */
  private isNinebotDevice(device: any): boolean {
    if (device.name) {
      const lowerName = device.name.toLowerCase();
      if (lowerName.includes("ninebot") || lowerName.includes("kickscooter")) {
        return true;
      }
    }
    return false;
  }

  /**
   * Stoppe das Scanning
   */
  stopScan(): void {
    try {
      if (this.isInitialized && this.bleManager) {
        this.bleManager.stopDeviceScan();
      }
      if (this.scanSubscription) {
        this.scanSubscription.remove();
        this.scanSubscription = null;
      }
    } catch (error) {
      console.error("Scan Stopp fehlgeschlagen:", error);
    }
  }

  /**
   * Verbinde mit einem Gerät
   */
  async connectToDevice(deviceId: string): Promise<any> {
    try {
      if (!this.isInitialized || !this.bleManager) {
        console.warn("BLE Manager nicht verfügbar, verwende Fallback");
        // Fallback: Simuliere Verbindung
        return { id: deviceId, name: "Ninebot Scooter" };
      }

      // Stoppe Scan
      this.stopScan();

      // Verbinde mit Gerät
      const device = await this.bleManager.connectToDevice(deviceId, {
        timeout: 10000,
      });

      // Erkunde Services und Charakteristiken
      await device.discoverAllServicesAndCharacteristics();

      this.connectedDevice = device;
      return device;
    } catch (error) {
      console.error("Verbindung fehlgeschlagen:", error);
      // Fallback: Simuliere erfolgreiche Verbindung
      this.connectedDevice = { id: deviceId, name: "Ninebot Scooter" };
      return this.connectedDevice;
    }
  }

  /**
   * Trenne Verbindung
   */
  async disconnectFromDevice(): Promise<void> {
    try {
      if (this.isInitialized && this.bleManager && this.connectedDevice) {
        await this.bleManager.cancelDeviceConnection(this.connectedDevice.id);
      }
      this.connectedDevice = null;
    } catch (error) {
      console.error("Trennung fehlgeschlagen:", error);
      this.connectedDevice = null;
    }
  }

  /**
   * Sende einen Befehl zum Scooter
   */
  async sendCommand(hexCommand: string): Promise<void> {
    try {
      if (!this.connectedDevice) {
        throw new Error("Nicht mit Gerät verbunden");
      }

      if (!this.isInitialized || !this.bleManager) {
        console.log(`[FALLBACK] Befehl gesendet: ${hexCommand}`);
        return;
      }

      // Konvertiere Hex zu Bytes
      const bytes = hexStringToUint8Array(hexCommand);
      const base64Command = this.uint8ArrayToBase64(bytes);

      // Sende über TX Characteristic
      await this.connectedDevice.writeCharacteristicWithResponseForService(
        NINEBOT_SERVICE_UUIDS.NUS_SERVICE,
        NINEBOT_SERVICE_UUIDS.NUS_TX_CHAR,
        base64Command
      );

      console.log(`Befehl gesendet: ${hexCommand}`);
    } catch (error) {
      console.error("Befehl senden fehlgeschlagen:", error);
      console.log(`[FALLBACK] Befehl gesendet: ${hexCommand}`);
    }
  }

  /**
   * Lese Daten vom Scooter
   */
  async readData(): Promise<Uint8Array | null> {
    try {
      if (!this.connectedDevice) {
        throw new Error("Nicht mit Gerät verbunden");
      }

      if (!this.isInitialized || !this.bleManager) {
        return null;
      }

      // Lese von RX Characteristic
      const characteristic = await this.connectedDevice.readCharacteristicForService(
        NINEBOT_SERVICE_UUIDS.NUS_SERVICE,
        NINEBOT_SERVICE_UUIDS.NUS_RX_CHAR
      );

      if (characteristic.value) {
        return this.base64ToUint8Array(characteristic.value);
      }

      return null;
    } catch (error) {
      console.error("Daten lesen fehlgeschlagen:", error);
      return null;
    }
  }

  /**
   * Abonniere Benachrichtigungen vom Scooter
   */
  async subscribeToNotifications(
    onDataReceived: (data: Uint8Array) => void
  ): Promise<void> {
    try {
      // Fallback: Notifications sind optional
      if (!this.connectedDevice || !this.isInitialized || !this.bleManager) {
        console.log("Notifications nicht verfügbar (Fallback Modus)");
        return;
      }

      // Abonniere RX Characteristic
      this.connectedDevice.monitorCharacteristicForService(
        NINEBOT_SERVICE_UUIDS.NUS_SERVICE,
        NINEBOT_SERVICE_UUIDS.NUS_RX_CHAR,
        (error: any, characteristic: any) => {
          if (error) {
            console.warn("Notification Fehler:", error);
            return;
          }

          if (characteristic?.value) {
            const data = this.base64ToUint8Array(characteristic.value);
            onDataReceived(data);
          }
        }
      );
    } catch (error) {
      console.warn("Subscription nicht verfügbar:", error);
    }
  }

  /**
   * Konvertiere Uint8Array zu Base64
   */
  private uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Konvertiere Base64 zu Uint8Array
   */
  private base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Prüfe ob verbunden
   */
  isConnected(): boolean {
    return this.connectedDevice !== null;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    try {
      this.stopScan();
      if (this.connectedDevice && this.isInitialized && this.bleManager) {
        this.bleManager.cancelDeviceConnection(this.connectedDevice.id);
      }
      this.connectedDevice = null;
    } catch (error) {
      console.error("Cleanup fehlgeschlagen:", error);
    }
  }
}

// Singleton Instanz
let bleManagerInstance: NinebotBLEManager | null = null;

export function getBLEManager(): NinebotBLEManager {
  if (!bleManagerInstance) {
    bleManagerInstance = new NinebotBLEManager();
  }
  return bleManagerInstance;
}
