import { ScrollView, Text, View, TouchableOpacity, Switch, Alert } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function SettingsScreen() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(colorScheme === "dark");
  const [notifications, setNotifications] = useState(true);
  const [autoConnect, setAutoConnect] = useState(false);

  const handleAbout = () => {
    Alert.alert(
      "About Ninebot Tuning",
      "Version 1.0.0\n\nNinebot Tuning App - Kostenlose Tuning-Software für Ninebot E-Scooter.\n\nDiese App ist nicht offiziell mit Ninebot verbunden und wird ohne Garantie bereitgestellt.",
      [{ text: "OK" }]
    );
  };

  const handleLicense = () => {
    Alert.alert(
      "Lizenz & Disclaimer",
      "WARNUNG: Das Tuning von E-Scootern kann zu Schäden führen und ist in vielen Ländern im öffentlichen Straßenverkehr nicht zulässig.\n\nNutzer tragen die volle Verantwortung für die Verwendung dieser App.",
      [{ text: "Verstanden" }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      "Datenschutz",
      "Diese App speichert keine persönlichen Daten auf externen Servern. Alle Daten werden lokal auf deinem Gerät gespeichert.",
      [{ text: "OK" }]
    );
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="items-center gap-2 mt-4">
            <Text className="text-3xl font-bold text-foreground">Settings</Text>
          </View>

          {/* Appearance Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground px-4">Appearance</Text>
            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 12,
                padding: 16,
              }}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-medium text-foreground">Dark Mode</Text>
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={darkMode ? colors.primary : colors.muted}
                />
              </View>
            </View>
          </View>

          {/* Connection Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground px-4">Connection</Text>
            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 12,
                padding: 16,
                gap: 16,
              }}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-medium text-foreground">Auto-Connect</Text>
                <Switch
                  value={autoConnect}
                  onValueChange={setAutoConnect}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={autoConnect ? colors.primary : colors.muted}
                />
              </View>
              <Text className="text-xs text-muted">
                Automatisch mit dem letzten Scooter verbinden
              </Text>
            </View>
          </View>

          {/* Notifications Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground px-4">Notifications</Text>
            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 12,
                padding: 16,
                gap: 16,
              }}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-medium text-foreground">Enable Notifications</Text>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={notifications ? colors.primary : colors.muted}
                />
              </View>
              <Text className="text-xs text-muted">
                Erhalte Benachrichtigungen über Verbindungsstatus und Fehler
              </Text>
            </View>
          </View>

          {/* Information Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground px-4">Information</Text>
            <View className="gap-2">
              <TouchableOpacity
                onPress={handleAbout}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-medium text-foreground">About</Text>
                  <Text className="text-sm text-muted">›</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLicense}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-medium text-foreground">License & Disclaimer</Text>
                  <Text className="text-sm text-muted">›</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePrivacy}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-medium text-foreground">Privacy Policy</Text>
                  <Text className="text-sm text-muted">›</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Warning Section */}
          <View
            style={{
              backgroundColor: colors.error,
              borderRadius: 12,
              padding: 16,
              gap: 8,
            }}
          >
            <Text className="text-sm font-semibold text-white">⚠️ Wichtiger Hinweis</Text>
            <Text className="text-xs text-white leading-relaxed">
              Das Tuning von E-Scootern kann zu Schäden am Gerät führen und ist in vielen Ländern im öffentlichen Straßenverkehr nicht zulässig. Nutzer tragen die volle Verantwortung für die Verwendung dieser App.
            </Text>
          </View>

          {/* Version Info */}
          <View className="items-center gap-1 pb-4">
            <Text className="text-xs text-muted">Ninebot Tuning v1.0.0</Text>
            <Text className="text-xs text-muted">© 2026 - Kostenlose Community App</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
