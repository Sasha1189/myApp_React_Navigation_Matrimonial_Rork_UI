import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { NavigatorScreenParams } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack"; // Use NativeStack
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Profile } from "src/types/profile";

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
};

export type AuthStackParamList = {
  Landing: undefined;
  // PhoneSignIn: undefined;
  EmailSignIn: undefined;
  Splash: undefined;
  WebView: { url: string; title?: string };
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  Chat: {
    roomId: string;
    uid: string;
    otherUser: {
      uid: string;
      name: string;
      photo: string;
    };
  };
  Details: { profile: Profile } | { userId: string } | { self: true };
  EditProfile: undefined;
  ManagePhotos: undefined;
  Filter: undefined;
  Search: undefined;
  Settings: undefined;
  WebView: { url: string; title?: string };
  HelpSupport: undefined;
  SafetyPrivacy: undefined;
  Upgrade: undefined;
  EditAboutMe: undefined;
  EditPersonal: undefined;
  EditContact: undefined;
  EditEducation: undefined;
  EditFamily: undefined;
  EditLifestyle: undefined;
  EditPartner: undefined;
  Paywall: undefined;
  // Removed Paywall from here unless you want it as a Modal inside the app
};

export type TabParamList = {
  Home: undefined;
  Messages: undefined;
  Profile: undefined;
};

// --- CLEANER HELPER TYPES ---

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AppStackScreenProps<T extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = BottomTabScreenProps<
  TabParamList,
  T
>;
