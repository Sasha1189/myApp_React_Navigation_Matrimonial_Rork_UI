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
    <Stack.Navigator
      initialRouteName="Tabs"
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTitleStyle: {
          fontSize: theme.fontSize.sm,
          fontWeight: "700",
          color: theme.colors.text,
        },
        headerTintColor: theme.colors.primary,
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
        options={{
          title: t("navigation.chat"),
        }}
      />
      <Stack.Screen
        name="Details"
        component={UserDetailsScreen}
        options={{
          title: t("navigation.details"),
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: t("navigation.editProfile"),
        }}
      />
      <Stack.Screen
        name="ManagePhotos"
        component={ManagePhotosScreen}
        options={{
          title: t("navigation.managePhotos"),
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
          title: t("navigation.settings"),
        }}
      />
      <Stack.Screen
        name="EditAboutMe"
        component={EditAboutMeScreen}
        options={{
          title: t("navigation.editAbout"),
        }}
      />
      <Stack.Screen
        name="EditPersonal"
        component={EditPersonalInfoScreen}
        options={{
          title: t("navigation.editPersonal"),
        }}
      />
      <Stack.Screen
        name="EditContact"
        component={EditContactDetailsScreen}
        options={{
          title: t("navigation.editContact"),
        }}
      />
      <Stack.Screen
        name="EditEducation"
        component={EditEducationCareerScreen}
        options={{
          title: t("navigation.editEducation"),
        }}
      />
      <Stack.Screen
        name="EditFamily"
        component={EditFamilyDetailsScreen}
        options={{
          title: t("navigation.editFamily"),
        }}
      />

      <Stack.Screen
        name="EditLifestyle"
        component={EditLifestyleScreen}
        options={{
          title: t("navigation.editLifeStyle"),
        }}
      />
      <Stack.Screen
        name="EditPartner"
        component={EditPartnerPreferencesScreen}
        options={{
          title: t("navigation.editPartnerPreferences"),
        }}
      />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{
          title: t("navigation.paywall"),
        }}
      />
    </Stack.Navigator>
  );
}
