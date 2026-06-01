import { createStackNavigator } from "@react-navigation/stack";
import { AuthStackParamList } from "./types";
import LandingScreen from "../features/auth/screens/LandingScreen";
import EmailSignInScreen from "../features/auth/screens/EmailSignInScreen";
import EmailSignUpScreen from "../features/auth/screens/EmailSignUpScreen";
import WebViewScreen from "../features/settings/screens/WebViewScreen";
import { useTranslation } from "react-i18next";

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="EmailSignIn" component={EmailSignInScreen} />
      <Stack.Screen name="EmailSignUp" component={EmailSignUpScreen} />
      <Stack.Screen
        name="WebView"
        component={WebViewScreen}
        options={({ route }) => ({
          headerShown: true,
          title: route.params.title ?? t("navigation.webView"),
        })}
      />
    </Stack.Navigator>
  );
}
