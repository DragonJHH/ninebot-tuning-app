import { describe, it, expect } from "vitest";
import {
  hexStringToUint8Array,
  uint8ArrayToHexString,
  calculateChecksum,
  generateSpeedLimitCommand,
  validateCommand,
  detectScooterModel,
  SCOOTER_MODELS,
} from "../ble-service";

describe("BLE Service", () => {
  describe("hexStringToUint8Array", () => {
    it("should convert hex string to Uint8Array", () => {
      const hex = "5aa5";
      const result = hexStringToUint8Array(hex);
      expect(result).toEqual(new Uint8Array([0x5a, 0xa5]));
    });

    it("should handle empty string", () => {
      const result = hexStringToUint8Array("");
      expect(result).toEqual(new Uint8Array([]));
    });

    it("should handle long hex strings", () => {
      const hex = "5aa5007057457776656e467a39";
      const result = hexStringToUint8Array(hex);
      expect(result.length).toBe(hex.length / 2);
    });
  });

  describe("uint8ArrayToHexString", () => {
    it("should convert Uint8Array to hex string", () => {
      const bytes = new Uint8Array([0x5a, 0xa5]);
      const result = uint8ArrayToHexString(bytes);
      expect(result).toBe("5AA5");
    });

    it("should pad single digit hex values", () => {
      const bytes = new Uint8Array([0x0a, 0x0f]);
      const result = uint8ArrayToHexString(bytes);
      expect(result).toBe("0A0F");
    });

    it("should handle empty array", () => {
      const result = uint8ArrayToHexString(new Uint8Array([]));
      expect(result).toBe("");
    });
  });

  describe("calculateChecksum", () => {
    it("should calculate XOR checksum", () => {
      const data = new Uint8Array([0x5a, 0xa5, 0x00, 0x07]);
      const checksum = calculateChecksum(data);
      expect(typeof checksum).toBe("number");
      expect(checksum).toBeGreaterThanOrEqual(0);
      expect(checksum).toBeLessThanOrEqual(255);
    });

    it("should return 0 for empty array", () => {
      const data = new Uint8Array([]);
      const checksum = calculateChecksum(data);
      expect(checksum).toBe(0);
    });

    it("should return same value for single byte", () => {
      const data = new Uint8Array([0x42]);
      const checksum = calculateChecksum(data);
      expect(checksum).toBe(0x42);
    });
  });

  describe("generateSpeedLimitCommand", () => {
    it("should generate valid speed limit command", () => {
      const command = generateSpeedLimitCommand(25);
      expect(command).toBeTruthy();
      expect(command.startsWith("5AA5")).toBe(true);
      expect(command.length % 2).toBe(0);
    });

    it("should generate different commands for different speeds", () => {
      const cmd25 = generateSpeedLimitCommand(25);
      const cmd50 = generateSpeedLimitCommand(50);
      expect(cmd25).not.toBe(cmd50);
    });

    it("should handle various speed values", () => {
      const speeds = [25, 32, 35, 40, 45, 50];
      speeds.forEach((speed) => {
        const command = generateSpeedLimitCommand(speed);
        expect(command).toBeTruthy();
        expect(command.startsWith("5AA5")).toBe(true);
      });
    });
  });

  describe("validateCommand", () => {
    it("should validate correct command", () => {
      const command = "5aa5007057457776656e467a39";
      expect(validateCommand(command)).toBe(true);
    });

    it("should reject command without header", () => {
      const command = "007057457776656e467a39";
      expect(validateCommand(command)).toBe(false);
    });

    it("should reject odd-length commands", () => {
      const command = "5aa50070574577766";
      expect(validateCommand(command)).toBe(false);
    });

    it("should reject too short commands", () => {
      const command = "5aa5";
      expect(validateCommand(command)).toBe(false);
    });

    it("should be case insensitive", () => {
      const command1 = "5aa5007057457776656e467a39";
      const command2 = "5AA5007057457776656e467a39";
      expect(validateCommand(command1)).toBe(validateCommand(command2));
    });
  });

  describe("detectScooterModel", () => {
    it("should detect G2 model", () => {
      const model = detectScooterModel("Ninebot G2");
      expect(model).toBe("G2");
    });

    it("should detect G30 model", () => {
      const model = detectScooterModel("Ninebot G30");
      expect(model).toBe("G30");
    });

    it("should detect F2 model", () => {
      const model = detectScooterModel("Ninebot F2");
      expect(model).toBe("F2");
    });

    it("should be case insensitive", () => {
      const model1 = detectScooterModel("ninebot g2");
      const model2 = detectScooterModel("NINEBOT G2");
      expect(model1).toBe(model2);
    });

    it("should return null for unknown model", () => {
      const model = detectScooterModel("Unknown Device");
      expect(model).toBeNull();
    });

    it("should detect GT3 model", () => {
      const model = detectScooterModel("Ninebot GT3");
      expect(model).toBe("GT3");
    });
  });

  describe("SCOOTER_MODELS", () => {
    it("should have valid model definitions", () => {
      Object.entries(SCOOTER_MODELS).forEach(([key, model]) => {
        expect(model.name).toBeTruthy();
        expect(model.maxSpeed).toBeGreaterThan(0);
        expect(model.defaultSpeed).toBeGreaterThan(0);
        expect(model.maxSpeed).toBeGreaterThanOrEqual(model.defaultSpeed);
      });
    });

    it("should have at least 10 models", () => {
      expect(Object.keys(SCOOTER_MODELS).length).toBeGreaterThanOrEqual(10);
    });
  });
});
