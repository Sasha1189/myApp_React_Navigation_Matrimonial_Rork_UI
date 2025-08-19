import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

import type {
  RootStackParamList,
  AuthStackParamList,
  AppStackParamList,
  TabParamList,
} from "./types";

//
// 🔹 Root stack
//
export function useRootNavigation() {
  return useNavigation<StackNavigationProp<RootStackParamList>>();
}
export function useRootRoute<T extends keyof RootStackParamList>() {
  return useRoute<{ key: string; name: T; params: RootStackParamList[T] }>();
}

//
// 🔹 Auth stack
//
export function useAuthNavigation() {
  return useNavigation<StackNavigationProp<AuthStackParamList>>();
}
export function useAuthRoute<T extends keyof AuthStackParamList>() {
  return useRoute<{ key: string; name: T; params: AuthStackParamList[T] }>();
}

//
// 🔹 App stack
//
export function useAppNavigation() {
  return useNavigation<StackNavigationProp<AppStackParamList>>();
}
export function useAppRoute<T extends keyof AppStackParamList>() {
  return useRoute<{ key: string; name: T; params: AppStackParamList[T] }>();
}

//
// 🔹 Tabs
//
export function useTabNavigation() {
  return useNavigation<BottomTabNavigationProp<TabParamList>>();
}
export function useTabRoute<T extends keyof TabParamList>() {
  return useRoute<{ key: string; name: T; params: TabParamList[T] }>();
}
