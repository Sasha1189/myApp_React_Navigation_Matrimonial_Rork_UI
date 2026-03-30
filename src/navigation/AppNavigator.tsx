import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChatScreen from "../features/messages/screens/ChatScreen";
import FilterScreen from "../features/home/screens/FilterScreen";
import SearchScreen from "../features/home/screens/SearchScreen";
import EditProfileScreen from "../features/profile/screens/EditProfileScreen";
import ManagePhotosScreen from "../features/profile/screens/ManagePhotosScreen";
import UserDetailsScreen from "../features/profile/screens/UserDetailsScreen";
import SettingsScreen from "../features/settings/screens/SettingsScreen";
import EditAboutMeScreen from "@/features/profile/components/sections/EditAboutMeScreen";
import EditPersonalInfoScreen from "@/features/profile/components/sections/PersonalInfoSection";
import EditFamilyDetailsScreen from "@/features/profile/components/sections/EditFamilyDetailsScreen";
import EditContactDetailsScreen from "@/features/profile/components/sections/ContactDetailsSection";
import EditEducationCareerScreen from "@/features/profile/components/sections/EducationCareerSection";
import EditLifestyleScreen from "@/features/profile/components/sections/LifestyleSection";
import EditPartnerPreferencesScreen from "@/features/profile/components/sections/PartnerPreferencesSection";
import PaywallScreen from "@/features/subscription/screens/PaywallScreen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TabNavigator from "./TabNavigator";
import { AppStackParamList } from "./types";
import { useAppTheme } from "@/theme/ThemeContext";
import { useTranslation } from "react-i18next";

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
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
          title: t("navigation.chat"), // Uppercase for that RHF Pro look
          headerStyle: {
            backgroundColor: theme.colors.card,
          },
          headerTitleAlign: "center",
          headerTintColor: theme.colors.primary, // Back button matches primary brand color
          headerTitleStyle: {
            fontSize: theme.fontSize.sm, // Slightly smaller/refined
            fontWeight: "800",
            color: theme.colors.text, // Dark text for high contrast on light card
          },
        }}
      />
      <Stack.Screen
        name="Details"
        component={UserDetailsScreen}
        options={{
          headerShown: true,
          title: t("navigation.details"),
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerShown: true,
          title: t("navigation.editProfile"),
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="ManagePhotos"
        component={ManagePhotosScreen}
        options={{
          headerShown: true,
          title: t("navigation.managePhotos"),
          headerTitleAlign: "center",
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
          title: t("navigation.settings"),
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="EditAboutMe"
        component={EditAboutMeScreen}
        options={{
          headerShown: true,
          title: t("navigation.editAbout"),
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="EditPersonal"
        component={EditPersonalInfoScreen}
        options={{
          headerShown: true,
          title: t("navigation.editPersonal"),
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="EditContact"
        component={EditContactDetailsScreen}
        options={{
          headerShown: true,
          title: t("navigation.editContact"),
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="EditEducation"
        component={EditEducationCareerScreen}
        options={{
          headerShown: true,
          title: t("navigation.editEducation"),
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="EditFamily"
        component={EditFamilyDetailsScreen}
        options={{
          headerShown: true,
          title: t("navigation.editFamily"),
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />

      <Stack.Screen
        name="EditLifestyle"
        component={EditLifestyleScreen}
        options={{
          headerShown: true,
          title: t("navigation.editLifeStyle"),
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="EditPartner"
        component={EditPartnerPreferencesScreen}
        options={{
          headerShown: true,
          title: t("navigation.editPartnerPreferences"),
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{
          headerShown: true,
          title: t("navigation.paywall"),
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "white",
        }}
      />
    </Stack.Navigator>
  );
}
