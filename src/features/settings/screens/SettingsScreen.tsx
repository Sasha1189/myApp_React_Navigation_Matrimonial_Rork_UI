import { theme } from "../../../theme/index";
import { LinearGradient } from "expo-linear-gradient";
// import { Stack, router } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Eye,
  Globe,
  MapPin,
  Moon,
  Smartphone,
  Vibrate,
  Volume2,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<any>;
  type: "toggle" | "navigation" | "picker";
  value?: boolean | string;
  options?: string[];
  onPress?: () => void;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    soundEnabled: true,
    vibrationEnabled: true,
    showOnlineStatus: true,
    shareLocation: false,
    language: "English",
    distanceUnit: "Kilometers",
  });

  const updateSetting = (key: string, value: boolean | string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleLanguageChange = () => {
    const languages = [
      "English",
      "Hindi",
      "Marathi",
      "Tamil",
      "Telugu",
      "Bengali",
    ];
    Alert.alert(
      "Select Language",
      "Choose your preferred language",
      languages.map((lang) => ({
        text: lang,
        onPress: () => updateSetting("language", lang),
      }))
    );
  };

  const handleDistanceUnitChange = () => {
    const units = ["Kilometers", "Miles"];
    Alert.alert(
      "Distance Unit",
      "Choose your preferred distance unit",
      units.map((unit) => ({
        text: unit,
        onPress: () => updateSetting("distanceUnit", unit),
      }))
    );
  };

  const settingSections: SettingSection[] = [
    {
      title: "Notifications",
      items: [
        {
          id: "notifications",
          title: "Push Notifications",
          subtitle: "Receive notifications for new matches and messages",
          icon: Bell,
          type: "toggle",
          value: settings.notifications,
        },
        {
          id: "soundEnabled",
          title: "Sound",
          subtitle: "Play sounds for notifications",
          icon: Volume2,
          type: "toggle",
          value: settings.soundEnabled,
        },
        {
          id: "vibrationEnabled",
          title: "Vibration",
          subtitle: "Vibrate for notifications",
          icon: Vibrate,
          type: "toggle",
          value: settings.vibrationEnabled,
        },
      ],
    },
    {
      title: "Appearance",
      items: [
        {
          id: "darkMode",
          title: "Dark Mode",
          subtitle: "Use dark theme",
          icon: Moon,
          type: "toggle",
          value: settings.darkMode,
        },
        {
          id: "language",
          title: "Language",
          subtitle: settings.language,
          icon: Globe,
          type: "picker",
          onPress: handleLanguageChange,
        },
      ],
    },
    {
      title: "Privacy",
      items: [
        {
          id: "showOnlineStatus",
          title: "Show Online Status",
          subtitle: "Let others see when you are online",
          icon: Eye,
          type: "toggle",
          value: settings.showOnlineStatus,
        },
        {
          id: "shareLocation",
          title: "Share Location",
          subtitle: "Show your location to potential matches",
          icon: MapPin,
          type: "toggle",
          value: settings.shareLocation,
        },
      ],
    },
    {
      title: "Discovery",
      items: [
        {
          id: "distanceUnit",
          title: "Distance Unit",
          subtitle: settings.distanceUnit,
          icon: Smartphone,
          type: "picker",
          onPress: handleDistanceUnitChange,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.onPress}
        disabled={item.type === "toggle"}
      >
        <View style={styles.settingLeft}>
          <View style={styles.iconContainer}>
            <item.icon size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        <View style={styles.settingRight}>
          {item.type === "toggle" && (
            <Switch
              value={item.value as boolean}
              onValueChange={(value) => updateSetting(item.id, value)}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary + "40",
              }}
              thumbColor={
                item.value ? theme.colors.primary : theme.colors.textLight
              }
            />
          )}
          {item.type === "picker" && (
            <ChevronRight size={20} color={theme.colors.textLight} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {/* <Stack.Screen
        options={{
          headerShown: true,
          title: 'Settings',
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: 'white',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      /> */}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[theme.colors.primary + "20", "transparent"]}
          style={styles.headerGradient}
        />

        <View style={styles.content}>
          {settingSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionContent}>
                {section.items.map(renderSettingItem)}
              </View>
            </View>
          ))}

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Changes to privacy settings may take a few minutes to take effect.
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerGradient: {
    height: 100,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.sm,
  },
  sectionContent: {
    backgroundColor: "white",
    borderRadius: theme.borderRadius.lg,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  settingSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    lineHeight: 18,
  },
  settingRight: {
    marginLeft: theme.spacing.md,
  },
  infoCard: {
    backgroundColor: theme.colors.primary + "10",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    textAlign: "center",
    lineHeight: 20,
  },
});
