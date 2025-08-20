import { createStackNavigator } from "@react-navigation/stack";
import { AuthStackParamList } from "./types";
import LandingScreen from "../features/auth/screens/LandingScreen";
import PhoneSignInScreen from "../features/auth/screens/PhoneSignInScreen";
import SplashScreen from "../features/auth/screens/SplashScreen";
import OTPVerifyScreen from "../features/auth/screens/OtpVerifyScreen";

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="PhoneSignIn" component={PhoneSignInScreen} />
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
    </Stack.Navigator>
  );
}
