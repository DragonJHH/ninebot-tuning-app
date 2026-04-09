import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useBLEDevice } from "@/hooks/use-ble-device";

export default function HomeScreen() {
  const colors = useColors();
  const ble = useBLEDevice();

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="items-center gap-2 mt-4">
            <Text className="text-3xl font-bold text-foreground">Ninebot Tuning</Text>
            <Text className="text-sm text-muted text-center">
              {ble.isConnected ? "Connected to " + ble.selectedDevice?.name : "Connect your scooter to get started"}
            </Text>
          </View>

          {/* Status Card */}
          {ble.isConnected && ble.scooterInfo ? (
            <View className="bg-surface rounded-2xl p-6 border border-border gap-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-foreground">Device Info</Text>
                <View className="w-3 h-3 rounded-full bg-success" />
              </View>
              
              <View className="gap-3">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Model</Text>
                  <Text className="text-sm font-medium text-foreground">{ble.scooterInfo.model}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Serial</Text>
                  <Text className="text-sm font-medium text-foreground">{ble.scooterInfo.serial}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Firmware</Text>
                  <Text className="text-sm font-medium text-foreground">{ble.scooterInfo.firmware}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Battery</Text>
                  <Text className="text-sm font-medium text-foreground">{ble.scooterInfo.battery}%</Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* Device List */}
          {!ble.isConnected && ble.devices.length > 0 ? (
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">Available Devices</Text>
              {ble.devices.map((device) => (
                <TouchableOpacity
                  key={device.id}
                  onPress={() => ble.connectDevice(device)}
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-base font-medium text-foreground">{device.name}</Text>
                      {device.rssi ? (
                        <Text className="text-xs text-muted mt-1">Signal: {device.rssi} dBm</Text>
                      ) : null}
                    </View>
                    {ble.isLoading && ble.selectedDevice?.id === device.id ? (
                      <ActivityIndicator color={colors.primary} />
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {/* Scan Button */}
          {!ble.isConnected ? (
            <TouchableOpacity
              onPress={ble.scanDevices}
              disabled={ble.isScanning}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingVertical: 16,
                paddingHorizontal: 24,
                opacity: ble.isScanning ? 0.6 : 1,
              }}
            >
              <View className="flex-row items-center justify-center gap-2">
                {ble.isScanning ? (
                  <>
                    <ActivityIndicator color="white" size="small" />
                    <Text className="text-base font-semibold text-white">Scanning...</Text>
                  </>
                ) : (
                  <Text className="text-base font-semibold text-white">
                    {ble.devices.length > 0 ? "Scan Again" : "Scan for Devices"}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ) : null}

          {/* Tuning Button */}
          {ble.isConnected ? (
            <View className="gap-3">
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                }}
              >
                <Text className="text-base font-semibold text-white text-center">
                  Tuning Settings
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={ble.disconnect}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                }}
              >
                <Text className="text-base font-semibold text-foreground text-center">
                  Disconnect
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Info Section */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-2 mt-4">
            <Text className="text-sm font-semibold text-foreground">About</Text>
            <Text className="text-xs text-muted leading-relaxed">
              This app allows you to tune your Ninebot electric scooter via Bluetooth. Supported models include G2, G30, F2, F3, GT3, and more.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
