import { NavigatorScreenParams } from "@react-navigation/native";

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
};

export type AuthStackParamList = {
  Landing: undefined;
  PhoneSignIn: undefined;
  Splash: undefined;
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  Chat: { matchId: string };
  UserDetails: { userId: string };
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
