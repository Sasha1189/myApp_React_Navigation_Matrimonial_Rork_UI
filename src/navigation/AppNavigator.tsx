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

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Tabs"
      screenOptions={{
        headerShown: true,
      }}
    >
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
      <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="ManagePhotos" component={ManagePhotosScreen} />
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
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
    </Stack.Navigator>
  );
};
