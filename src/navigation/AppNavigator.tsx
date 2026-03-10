import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChatScreen from "../features/messages/screens/ChatScreen";
import FilterScreen from "../features/home/screens/FilterScreen";
import SearchScreen from "../features/home/screens/SearchScreen";
import EditProfileScreen from "../features/profile/screens/EditProfileScreen";
import ManagePhotosScreen from "../features/profile/screens/ManagePhotosScreen";
import UserDetailsScreen from "../features/profile/screens/UserDetailsScreen";
import SettingsScreen from "../features/settings/screens/SettingsScreen";
import SubscriptionScreen from "../features/subscription/screens/SubscriptionScreen";
import EditAboutMeScreen from "@/features/profile/components/sections/EditAboutMeScreen";
import EditPersonalInfoScreen from "@/features/profile/components/sections/PersonalInfoSection";
import EditContactDetailsScreen from "@/features/profile/components/sections/ContactDetailsSection";
import EditEducationCareerScreen from "@/features/profile/components/sections/EducationCareerSection";
import EditLifestyleScreen from "@/features/profile/components/sections/LifestyleSection";
import EditPartnerPreferencesScreen from "@/features/profile/components/sections/PartnerPreferencesSection";
import TabNavigator from "./TabNavigator";
import { AppStackParamList } from "./types";
import { useAppTheme } from "@/theme/ThemeContext";

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  const { theme } = useAppTheme();
  if (!theme) return null;

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
        options={{
          headerShown: true,
          title: "Chat",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="Details"
        component={UserDetailsScreen}
        options={{
          headerShown: true,
          title: "Profile Details",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerShown: true,
          title: "Edit Profile",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="ManagePhotos"
        component={ManagePhotosScreen}
        options={{
          headerShown: true,
          title: "Add Photos",
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
          headerShown: true,
          title: "Settings",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{
          headerShown: true,
          title: "Subscription",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="EditAboutMe"
        component={EditAboutMeScreen}
        options={{
          headerShown: true,
          title: "Edit About Me",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="EditPersonal"
        component={EditPersonalInfoScreen}
        options={{
          headerShown: true,
          title: "Edit About Me",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="EditContact"
        component={EditContactDetailsScreen}
        options={{
          headerShown: true,
          title: "Edit Contact Details",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="EditEducation"
        component={EditEducationCareerScreen}
        options={{
          headerShown: true,
          title: "Edit Education Details",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="EditLifestyle"
        component={EditLifestyleScreen}
        options={{
          headerShown: true,
          title: "Edit Lifestyle Details",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="EditPartner"
        component={EditPartnerPreferencesScreen}
        options={{
          headerShown: true,
          title: "Edit Preferance Details",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
    </Stack.Navigator>
  );
}
