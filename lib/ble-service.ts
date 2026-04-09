/**
 * BLE Service für Ninebot Scooter Kommunikation
 * 
 * Diese Datei enthält die Logik für die Bluetooth Low Energy Kommunikation
 * mit Ninebot Scootern über das Nordic UART Service (NUS) Protokoll.
 */

// Ninebot BLE Service UUIDs
export const NINEBOT_SERVICE_UUIDS = {
  NUS_SERVICE: "6E400001-B5A3-F393-E0A9-E50E24DCCA9E",
  NUS_RX_CHAR: "6E400003-B5A3-F393-E0A9-E50E24DCCA9E", // Empfangen
  NUS_TX_CHAR: "6E400002-B5A3-F393-E0A9-E50E24DCCA9E", // Senden
};

// Ninebot Manufacturer ID
export const NINEBOT_MANUFACTURER_ID = 16974; // 0x4246

/**
 * Scooter-Modelle und ihre Eigenschaften
 */
export const SCOOTER_MODELS = {
  G30: { name: "Ninebot G30", maxSpeed: 50, defaultSpeed: 27 },
  G2: { name: "Ninebot G2", maxSpeed: 50, defaultSpeed: 32 },
  G2_MAX: { name: "Ninebot G2 Max", maxSpeed: 55, defaultSpeed: 35 },
  G2D: { name: "Ninebot G2D", maxSpeed: 50, defaultSpeed: 32 },
  F2: { name: "Ninebot F2", maxSpeed: 45, defaultSpeed: 32 },
  F2_PLUS: { name: "Ninebot F2 Plus", maxSpeed: 45, defaultSpeed: 32 },
  F2_PRO: { name: "Ninebot F2 Pro", maxSpeed: 45, defaultSpeed: 32 },
  F3: { name: "Ninebot F3", maxSpeed: 45, defaultSpeed: 35 },
  ZT3: { name: "Ninebot ZT3", maxSpeed: 50, defaultSpeed: 38 },
  ZT3D: { name: "Ninebot ZT3D", maxSpeed: 50, defaultSpeed: 38 },
  GT3: { name: "Ninebot GT3", maxSpeed: 55, defaultSpeed: 50 },
  GT3D: { name: "Ninebot GT3D", maxSpeed: 55, defaultSpeed: 50 },
  G3: { name: "Ninebot G3", maxSpeed: 50, defaultSpeed: 41 },
  G3D: { name: "Ninebot G3D", maxSpeed: 50, defaultSpeed: 41 },
  MAX: { name: "Ninebot MAX", maxSpeed: 55, defaultSpeed: 40 },
} as const;

/**
 * Hex-Befehle für verschiedene Tuning-Operationen
 * 
 * Format: 5aa5 [Länge] [Befehl] [Daten] [Prüfsumme]
 */
export const TUNING_COMMANDS = {
  // Allgemeiner Tuning-Code (funktioniert auf vielen Modellen)
  UNIVERSAL_UNLOCK: "5aa5007057457776656e467a39",
  
  // Geschwindigkeitslimit Befehle (Register 0x73)
  SPEED_LIMIT_25: "5aa5007073000fa0", // 25 km/h = 250 * 0.1
  SPEED_LIMIT_32: "5aa5007073001400", // 32 km/h = 320 * 0.1
  SPEED_LIMIT_35: "5aa5007073001600", // 35 km/h = 350 * 0.1
  SPEED_LIMIT_40: "5aa5007073001900", // 40 km/h = 400 * 0.1
  SPEED_LIMIT_45: "5aa5007073001c00", // 45 km/h = 450 * 0.1
  SPEED_LIMIT_50: "5aa5007073001f00", // 50 km/h = 500 * 0.1
};

/**
 * Interface für BLE Device
 */
export interface BLEDevice {
  id: string;
  name: string;
  rssi?: number;
  manufacturerData?: ArrayBuffer;
}

/**
 * Interface für Scooter Info
 */
export interface ScooterInfo {
  model: string;
  serial: string;
  firmware: string;
  battery: number;
  speed?: number;
  distance?: number;
}

/**
 * Konvertiere Hex-String zu Uint8Array
 */
export function hexStringToUint8Array(hexString: string): Uint8Array {
  const bytes = [];
  for (let i = 0; i < hexString.length; i += 2) {
    bytes.push(parseInt(hexString.substr(i, 2), 16));
  }
  return new Uint8Array(bytes);
}

/**
 * Konvertiere Uint8Array zu Hex-String
 */
export function uint8ArrayToHexString(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/**
 * Berechne XOR Prüfsumme für Ninebot Befehle
 */
export function calculateChecksum(data: Uint8Array): number {
  let checksum = 0;
  for (let i = 0; i < data.length; i++) {
    checksum ^= data[i];
  }
  return checksum;
}

/**
 * Generiere einen Geschwindigkeitslimit-Befehl
 * 
 * @param speedKmh Geschwindigkeit in km/h
 * @returns Hex-String des Befehls
 */
export function generateSpeedLimitCommand(speedKmh: number): string {
  // Konvertiere km/h zu interner Einheit (0.1 km/h)
  const speedValue = Math.round(speedKmh * 10);
  
  // Erstelle den Befehl
  const header = hexStringToUint8Array("5aa5");
  const length = new Uint8Array([0x00, 0x07]); // Länge des Befehls
  const register = new Uint8Array([0x73]); // Register für Geschwindigkeitslimit
  const value = new Uint8Array([
    (speedValue >> 8) & 0xFF,
    speedValue & 0xFF,
  ]);
  
  // Kombiniere alle Teile
  const command = new Uint8Array(header.length + length.length + register.length + value.length + 1);
  let offset = 0;
  
  command.set(header, offset);
  offset += header.length;
  command.set(length, offset);
  offset += length.length;
  command.set(register, offset);
  offset += register.length;
  command.set(value, offset);
  offset += value.length;
  
  // Berechne und füge Prüfsumme hinzu
  const checksum = calculateChecksum(command.slice(0, offset));
  command[offset] = checksum;
  
  return uint8ArrayToHexString(command);
}

/**
 * Parse Scooter Info aus BLE Antwort
 * 
 * @param data Empfangene Daten
 * @returns Geparste Scooter Info
 */
export function parseScooterInfo(data: Uint8Array): Partial<ScooterInfo> {
  const info: Partial<ScooterInfo> = {};
  
  // Versuche, verschiedene Informationen aus den Daten zu extrahieren
  // Dies ist eine vereinfachte Implementierung
  
  // Beispiel: Batterie-Status (typischerweise bei Index 10-11)
  if (data.length > 11) {
    const batteryRaw = (data[10] << 8) | data[11];
    info.battery = Math.min(100, Math.max(0, batteryRaw / 100));
  }
  
  return info;
}

/**
 * Validiere einen Ninebot Befehl
 * 
 * @param command Hex-String des Befehls
 * @returns true wenn gültig, false sonst
 */
export function validateCommand(command: string): boolean {
  // Prüfe ob der Befehl mit 5aa5 beginnt (case-insensitive)
  const upperCommand = command.toUpperCase();
  if (!upperCommand.startsWith("5AA5")) {
    return false;
  }
  
  // Prüfe ob die Länge gerade ist (Hex-Paare)
  if (command.length % 2 !== 0) {
    return false;
  }
  
  // Prüfe ob die Länge mindestens 8 Zeichen ist (5aa5 + Länge + Befehl + Prüfsumme)
  if (command.length < 8) {
    return false;
  }
  
  return true;
}

/**
 * Erkenne Scooter-Modell aus Gerätenamen
 * 
 * @param deviceName Name des BLE-Geräts
 * @returns Modell-Schlüssel oder null
 */
export function detectScooterModel(deviceName: string): keyof typeof SCOOTER_MODELS | null {
  const upperName = deviceName.toUpperCase();
  
  // Spezielle Behandlung für Kickscooter Namen
  if (upperName.includes("KICKSCOOTER")) {
    if (upperName.includes("MAX G2") || upperName.includes("G2 MAX")) {
      return "G2_MAX";
    }
    if (upperName.includes("MAX")) {
      return "MAX";
    }
    if (upperName.includes("G30")) {
      return "G30";
    }
    if (upperName.includes("G3")) {
      return "G3";
    }
  }
  
  // Versuche, das Modell aus dem Namen zu erkennen
  for (const [key, model] of Object.entries(SCOOTER_MODELS)) {
    if (upperName.includes(key.replace(/_/g, ""))) {
      return key as keyof typeof SCOOTER_MODELS;
    }
  }
  
  return null;
}
