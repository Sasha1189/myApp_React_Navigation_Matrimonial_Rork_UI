import React from "react";
import { View, TouchableOpacity } from "react-native";
import {
  Home,
  Heart,
  MessageCircle,
  User,
  Filter,
  Search,
} from "lucide-react-native";
import { theme } from "../constants/theme";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { TabParamList } from "./types";
import { useAppNavigation } from "./hooks";
import HomeScreen from "../features/home/screens/HomeScreen";
import MatchesScreen from "../features/matches/screens/MatchesScreen";
import MessagesScreen from "../features/messages/screens/MessagesScreen";
import ProfileScreen from "../features/profile/screens/ProfileScreen";

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  const navigation = useAppNavigation();
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        // headerTransparent: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textLight,
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: "white",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Discover",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
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
        }}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesScreen}
        options={{
          title: "Matches",
          tabBarIcon: ({ color }) => <Heart size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
