import React from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import {
  Heart,
  Settings2,
  MessageCircle,
  User,
  Search,
  Settings,
} from "lucide-react-native";
import { Image } from "expo-image";
import { useAppTheme } from "@/theme/ThemeContext";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { TabParamList } from "./types";
import { useAppNavigation } from "./hooks";
import HomeScreen from "../features/home/screens/HomeScreen";
import MessagesScreen from "../features/messages/screens/MessagesScreen";
import ProfileScreen from "../features/profile/screens/ProfileScreen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  const { theme } = useAppTheme();
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  if (!theme) return null;

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: true,
        // RHF Aesthetic: White/Clean headers instead of solid colors
        headerStyle: {
          backgroundColor: theme.colors.card,
          elevation: 0, // Remove shadow for flat look
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontSize: theme.fontSize.lg,
          fontWeight: "700",
          color: theme.colors.text,
          textTransform: "uppercase", // RHF style
          letterSpacing: 1.5,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height:
            Platform.OS === "ios"
              ? 60 + insets.bottom // iOS Home Indicator
              : 64 + (insets.bottom > 0 ? insets.bottom : 0), // Android Buttons/Gestures
          paddingBottom: insets.bottom > 0 ? insets.bottom : theme.spacing.sm,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textLight,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t("navigation.home"),
          tabBarIcon: ({ color }) => <Heart size={26} color={color} />,
          headerLeft: () => (
            <View style={{ marginLeft: theme.spacing.md }}>
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: theme.borderRadius.sm,
                  backgroundColor: theme.colors.primaryLight,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  overflow: "hidden",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../../assets/icon.png")}
                  style={{ width: "200%", height: "200%" }}
                  contentFit="contain"
                  cachePolicy={"disk"}
                />
              </View>
            </View>
          ),
          headerRight: () => (
            <View
              style={{ flexDirection: "row", marginRight: theme.spacing.md }}
            >
              <TouchableOpacity
                onPress={() => navigation.navigate("Search")}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: theme.borderRadius.sm,
                  backgroundColor: `${theme.colors.primary}12`,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: theme.spacing.md,
                }}
              >
                <Search size={22} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("Filter")}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: theme.borderRadius.sm,
                  backgroundColor: `${theme.colors.primary}12`,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Settings2 size={22} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          title: t("navigation.messages"),
          tabBarIcon: ({ color }) => <MessageCircle size={26} color={color} />,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t("navigation.profile"),
          tabBarIcon: ({ color }) => <User size={26} color={color} />,
          headerRight: () => (
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: `${theme.colors.primary}12`,
                alignItems: "center",
                justifyContent: "center",
                marginRight: theme.spacing.md,
              }}
              onPress={() => navigation.navigate("Settings")}
            >
              <Settings size={22} color={theme.colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
