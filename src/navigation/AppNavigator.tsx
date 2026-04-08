import React from "react";
import { Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FilterScreen, SearchScreen } from "@/features/home/screens";
import ChatScreen from "../features/messages/screens/ChatScreen";
import PaywallScreen from "@/features/subscription/screens/PaywallScreen";
import { SettingsScreen, WebViewScreen } from "@/features/settings/screens";
import {
  EditProfileScreen,
  ManagePhotosScreen,
  UserDetailsScreen,
} from "@/features/profile/screens";
import {
  EditAboutMeScreen,
  EditPersonalInfoScreen,
  EditFamilyDetailsScreen,
  EditContactDetailsScreen,
  EditEducationCareerScreen,
  EditLifestyleScreen,
  EditPartnerPreferencesScreen,
} from "@/features/profile/components/sections";
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
          backgroundColor: theme.colors.background,
        },
        headerTitle: ({ children }) => (
          <Text
            style={{
              fontSize: theme.fontSize.md,
              fontWeight: "700",
              color: theme.colors.text,
              textTransform: "uppercase", // Now this will work!
              letterSpacing: 1.5, // Now this will work!
              opacity: 0.8,
            }}
          >
            {children}
          </Text>
        ),
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
        name="WebView"
        component={WebViewScreen}
        options={({ route }) => ({
          title: route.params.title ?? t("navigation.webView"),
        })}
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
