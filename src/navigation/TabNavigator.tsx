import React from "react";
import { View, TouchableOpacity } from "react-native";
import {
  Heart,
  Cherry,
  MessageCircle,
  User,
  Filter,
  Search,
  Settings,
} from "lucide-react-native";
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
          // fontSize: 24,
          // fontWeight: "600",
          fontSize: 24,
          alignItems: "center",
          fontWeight: "600",
          // fontStyle: "sans-serif-medium",
          color: theme.colors.primaryLight,
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
          title: "Lonari",
          tabBarIcon: ({ color }) => <Heart size={30} color={color} />,
          headerRight: () => (
            <View style={{ flexDirection: "row", marginRight: 12 }}>
              <TouchableOpacity
                style={{ marginHorizontal: 8 }}
                onPress={() => navigation.navigate("Filter")}
              >
                <Filter size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ marginHorizontal: 8 }}
                onPress={() => navigation.navigate("Search")}
              >
                <Search size={20} color="white" />
              </TouchableOpacity>
            </View>
          ),
          headerLeft: () => (
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                borderWidth: 0.5,
                borderColor: "#F5F7FA",
              }}
            >
              <Cherry size={40} color="#F5F7FA" />
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
