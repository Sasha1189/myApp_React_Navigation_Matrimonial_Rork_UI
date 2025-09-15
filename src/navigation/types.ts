import { NavigatorScreenParams } from "@react-navigation/native";
import { Profile } from "src/types/profile";
// import {Profile} from "../types/profile";

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
};

export type AuthStackParamList = {
  Landing: undefined;
  PhoneSignIn: undefined;
  Splash: undefined;
  OTPVerify: {
    phone: string;
    verificationId: string;
  };
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  Chat: { otherUserId: string };
  UserDetails:
    | { profile: Profile }  // full profile preloaded
    | { userId: string }               // only id, fetch if missing
    | { self: true };                  // special case: show current user;
  EditProfile: undefined;
  ManagePhotos: undefined;
  Filter: undefined;
  Search: undefined;
  Settings: undefined;
  HelpSupport: undefined;
  SafetyPrivacy: undefined;
  Subscription: undefined;
};

export type TabParamList = {
  Home: undefined;
  Matches: undefined;
  Messages: undefined;
  Profile: undefined;
};

//
// ✅ Convenience Types
//
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  import("@react-navigation/stack").StackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> =
  import("@react-navigation/bottom-tabs").BottomTabScreenProps<TabParamList, T>;
