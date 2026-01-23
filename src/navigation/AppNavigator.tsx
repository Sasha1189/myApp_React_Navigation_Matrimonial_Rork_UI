import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChatScreen from "../features/messages/screens/ChatScreen";
import FilterScreen from "../features/home/screens/FilterScreen";
import SearchScreen from "../features/home/screens/SearchScreen";
import EditProfileScreen from "../features/profile/screens/EditProfileScreen";
import ManagePhotosScreen from "../features/profile/screens/ManagePhotosScreen";
import UserDetailsScreen from "../features/profile/screens/UserDetailsScreen";
import SettingsScreen from "../features/settings/screens/SettingsScreen";
import SubscriptionScreen from "../features/subscription/screens/SubscriptionScreen";
import TabNavigator from "./TabNavigator";
import { AppStackParamList } from "./types";
import { theme } from "../constants/theme";

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Tabs">
      <Stack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserDetails"
        component={UserDetailsScreen}
        options={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ManagePhotos"
        component={ManagePhotosScreen}
        options={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="Filter"
        component={FilterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
    </Stack.Navigator>
  );
};
