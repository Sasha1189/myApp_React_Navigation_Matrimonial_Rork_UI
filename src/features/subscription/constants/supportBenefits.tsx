import React from "react";
import {
  ShieldCheck,
  Server,
  Users,
  Heart,
  Sparkles,
} from "lucide-react-native";
import { AppTheme } from "@/theme/theme";
import { ReactNode } from "react";

export type SupportBenefit = {
  id: string;
  icon: ReactNode;
  translationKey: string; // The base path for the translation
  fallbackText: string;
};

export const SUPPORT_BENEFITS = (theme: AppTheme): SupportBenefit[] => [
  {
    id: "privacy",
    icon: <ShieldCheck size={22} color={theme.colors.primary} />,
    translationKey: "subscription.benefits.privacy",
    fallbackText: "Your privacy is our priority",
  },
  {
    id: "infrastructure",
    icon: <Server size={22} color={theme.colors.primary} />,
    translationKey: "subscription.benefits.infrastructure",
    fallbackText: "Fast and reliable infrastructure",
  },
  {
    id: "community",
    icon: <Users size={22} color={theme.colors.primary} />,
    translationKey: "subscription.benefits.community",
    fallbackText: "Help us grow the community",
  },
  {
    id: "values",
    icon: <Sparkles size={22} color={theme.colors.primary} />,
    translationKey: "subscription.benefits.values",
    fallbackText: "Supporting shared values",
  },
  {
    id: "legacy",
    icon: <Heart size={22} color={theme.colors.primary} />,
    translationKey: "subscription.benefits.legacy",
    fallbackText: "Building a legacy together",
  },
];
