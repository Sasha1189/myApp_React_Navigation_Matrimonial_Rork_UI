import React from "react";
import { View, TouchableOpacity } from "react-native";
import {
  Heart,
  Settings2,
  Cherry,
  MessageCircle,
  User,
  Filter,
  Search,
  Settings,
} from "lucide-react-native";
import { Image } from "expo-image";
import { theme } from "../constants/theme";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { TabParamList } from "./types";
import { useAppNavigation } from "./hooks";
import HomeScreen from "../features/home/screens/HomeScreen";
import MessagesScreen from "../features/messages/screens/MessagesScreen";
import ProfileScreen from "../features/profile/screens/ProfileScreen";

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  const navigation = useAppNavigation();
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: "white",

        headerTitleAlign: "center",
        headerTitleStyle: {
          fontSize: 24,
          alignItems: "center",
          fontWeight: "bold",
          color: theme.colors.background,
          letterSpacing: 2,
        },

        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textLight,

        tabBarItemStyle: {
          paddingVertical: theme.spacing.sm,
        },
      }}
    >
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={30} color={color} />,
          headerRight: () => (
            <TouchableOpacity
              style={{
                backgroundColor: "rgba(255,255,255,0.12)",
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.md,
                marginHorizontal: theme.spacing.lg,
              }}
              onPress={() => navigation.navigate("Settings")}
            >
              <Settings size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "LONARI",
          tabBarIcon: ({ color }) => <Heart size={30} color={color} />,
          headerRight: () => (
            <View style={{ flexDirection: "row", marginRight: 12 }}>
              <TouchableOpacity
                style={{ marginHorizontal: 8 }}
                onPress={() => navigation.navigate("Search")}
              >
                <Search size={20} color={theme.colors.background} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ marginHorizontal: 8 }}
                onPress={() => navigation.navigate("Filter")}
              >
                <Settings2 size={20} color={theme.colors.background} />
              </TouchableOpacity>
            </View>
          ),
          headerLeft: () => (
            <View
              style={{
                // 1. SHADOW WRAPPER: Holds the elevation/shadow
                width: 50,
                height: 50,
                marginLeft: 15,
                borderRadius: 25,
                backgroundColor: "transparent",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
                elevation: 8, // Crucial for Android
              }}
            >
              <View
                style={{
                  flex: 1,
                  borderRadius: 25,
                  overflow: "hidden",
                  backgroundColor: theme.colors.background, // Light lavender/gray background
                  borderWidth: 2,
                  borderColor: "rgba(255,255,255,0.4)", // White glass-effect border
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../../assets/icon.png")}
                  style={{
                    width: "200%",
                    height: "200%",
                  }}
                  contentFit="contain"
                  cachePolicy={"memory-disk"}
                />
              </View>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => <MessageCircle size={30} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
