import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useBLEDevice } from "@/hooks/use-ble-device";
import { SCOOTER_MODELS, detectScooterModel } from "@/lib/ble-service";

export default function TuningScreen() {
  const colors = useColors();
  const ble = useBLEDevice();
  const [speedLimit, setSpeedLimit] = useState(25);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Bestimme Min/Max Geschwindigkeit basierend auf Scooter-Modell
  const getSpeedRange = () => {
    if (!ble.selectedDevice) return { min: 25, max: 50, default: 25 };

    const modelKey = detectScooterModel(ble.selectedDevice.name);
    if (!modelKey) return { min: 25, max: 50, default: 25 };

    const model = SCOOTER_MODELS[modelKey];
    return {
      min: model.defaultSpeed,
      max: model.maxSpeed,
      default: model.defaultSpeed,
    };
  };

  const speedRange = getSpeedRange();

  useEffect(() => {
    if (ble.scooterInfo?.speed) {
      setSpeedLimit(ble.scooterInfo.speed);
    } else {
      setSpeedLimit(speedRange.default);
    }
  }, [ble.scooterInfo, speedRange.default]);

  const handleApplyTuning = async () => {
    if (speedLimit === speedRange.default) {
      Alert.alert("Info", "Geschwindigkeit ist bereits auf Werkseinstellung");
      return;
    }

    const success = await ble.sendTuningCommand(speedLimit);
    if (success) {
      Alert.alert("Erfolg", `Geschwindigkeitslimit auf ${speedLimit} km/h gesetzt`);
    } else {
      Alert.alert("Fehler", ble.error || "Tuning fehlgeschlagen");
    }
  };

  const handleResetTuning = async () => {
    const success = await ble.resetTuning();
    if (success) {
      Alert.alert("Erfolg", `Tuning zurückgesetzt auf ${speedRange.default} km/h`);
      setShowResetConfirm(false);
    } else {
      Alert.alert("Fehler", ble.error || "Reset fehlgeschlagen");
    }
  };

  const handleSpeedChange = (direction: "up" | "down") => {
    const step = 1;
    if (direction === "up" && speedLimit < speedRange.max) {
      setSpeedLimit(speedLimit + step);
    } else if (direction === "down" && speedLimit > speedRange.min) {
      setSpeedLimit(speedLimit - step);
    }
  };

  if (!ble.isConnected || !ble.selectedDevice || !ble.scooterInfo) {
    return (
      <ScreenContainer className="p-4 items-center justify-center">
        <Text className="text-lg text-muted">Nicht mit Scooter verbunden</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="items-center gap-2 mt-4">
            <Text className="text-3xl font-bold text-foreground">Tuning Settings</Text>
            <Text className="text-sm text-muted">{ble.selectedDevice.name}</Text>
          </View>

          {/* Geschwindigkeitslimit Schieber */}
          <View className="bg-surface rounded-2xl p-6 border border-border gap-4">
            <View className="gap-2">
              <Text className="text-lg font-semibold text-foreground">Geschwindigkeitslimit</Text>
              <Text className="text-sm text-muted">
                Werkseinstellung: {speedRange.default} km/h | Max: {speedRange.max} km/h
              </Text>
            </View>

            {/* Speed Display */}
            <View className="items-center gap-2">
              <Text className="text-5xl font-bold text-primary">{speedLimit}</Text>
              <Text className="text-sm text-muted">km/h</Text>
            </View>

            {/* Custom Slider with Buttons */}
            <View className="gap-4">
              {/* Progress Bar */}
              <View
                style={{
                  height: 8,
                  backgroundColor: colors.border,
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    backgroundColor: colors.primary,
                    width: `${((speedLimit - speedRange.min) / (speedRange.max - speedRange.min)) * 100}%`,
                  }}
                />
              </View>

              {/* Control Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => handleSpeedChange("down")}
                  disabled={speedLimit <= speedRange.min}
                  style={{
                    flex: 1,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingVertical: 12,
                    opacity: speedLimit <= speedRange.min ? 0.5 : 1,
                  }}
                >
                  <Text className="text-lg font-semibold text-foreground text-center">−</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSpeedLimit(speedRange.default)}
                  style={{
                    flex: 2,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingVertical: 12,
                  }}
                >
                  <Text className="text-sm font-medium text-foreground text-center">
                    Reset zu {speedRange.default}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSpeedChange("up")}
                  disabled={speedLimit >= speedRange.max}
                  style={{
                    flex: 1,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingVertical: 12,
                    opacity: speedLimit >= speedRange.max ? 0.5 : 1,
                  }}
                >
                  <Text className="text-lg font-semibold text-foreground text-center">+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Speed Range Labels */}
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">{speedRange.min} km/h</Text>
              <Text className="text-xs text-muted">{speedRange.max} km/h</Text>
            </View>
          </View>

          {/* Profil Info */}
          <View className="bg-surface rounded-2xl p-6 border border-border gap-3">
            <Text className="text-lg font-semibold text-foreground">Profil</Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Status</Text>
                <View className="flex-row items-center gap-2">
                  <View className="w-2 h-2 rounded-full bg-success" />
                  <Text className="text-sm font-medium text-foreground">Getunt</Text>
                </View>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Aktuelles Limit</Text>
                <Text className="text-sm font-medium text-foreground">{speedLimit} km/h</Text>
              </View>
            </View>
          </View>

          {/* Unlock Sequenz Info */}
          <View className="bg-surface rounded-2xl p-6 border border-border gap-3">
            <Text className="text-lg font-semibold text-foreground">Unlock-Sequenz</Text>
            <Text className="text-sm text-muted">
              Drücke die konfigurierte Tastenkombination am Scooter, um zwischen Original- und Getunt-Modus zu wechseln.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 16,
              }}
            >
              <Text className="text-sm font-medium text-foreground text-center">
                Sequenz konfigurieren
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            {/* Apply Button */}
            <TouchableOpacity
              onPress={handleApplyTuning}
              disabled={ble.isLoading}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingVertical: 16,
                paddingHorizontal: 24,
                opacity: ble.isLoading ? 0.6 : 1,
              }}
            >
              <View className="flex-row items-center justify-center gap-2">
                {ble.isLoading ? (
                  <>
                    <ActivityIndicator color="white" size="small" />
                    <Text className="text-base font-semibold text-white">Applying...</Text>
                  </>
                ) : (
                  <Text className="text-base font-semibold text-white">Apply Tuning</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Reset Button */}
            <TouchableOpacity
              onPress={() => setShowResetConfirm(true)}
              style={{
                backgroundColor: colors.error,
                borderRadius: 12,
                paddingVertical: 16,
                paddingHorizontal: 24,
              }}
            >
              <Text className="text-base font-semibold text-white text-center">
                Reset to Factory
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {ble.error ? (
            <View className="bg-error rounded-2xl p-4 border border-error">
              <Text className="text-sm font-medium text-white">{ble.error}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 24,
              gap: 16,
              maxWidth: 300,
            }}
          >
            <Text className="text-lg font-semibold text-foreground">Bestätigung</Text>
            <Text className="text-sm text-muted">
              Möchtest du das Tuning wirklich zurücksetzen? Dies setzt die Geschwindigkeit auf {speedRange.default} km/h zurück.
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowResetConfirm(false)}
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingVertical: 12,
                }}
              >
                <Text className="text-sm font-medium text-foreground text-center">Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleResetTuning}
                disabled={ble.isLoading}
                style={{
                  flex: 1,
                  backgroundColor: colors.error,
                  borderRadius: 8,
                  paddingVertical: 12,
                  opacity: ble.isLoading ? 0.6 : 1,
                }}
              >
                <Text className="text-sm font-medium text-white text-center">
                  {ble.isLoading ? "Resetting..." : "Reset"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}
    </ScreenContainer>
  );
}
