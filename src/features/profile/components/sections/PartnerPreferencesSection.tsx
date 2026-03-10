import React from "react";
import { ScrollView, View } from "react-native";
import { Controller } from "react-hook-form";
import {
  HeartHandshake,
  Ruler,
  MapPin,
  Home,
  GraduationCap,
  Briefcase,
  Banknote,
} from "lucide-react-native";

import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/theme/ThemeContext";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import { SECTION_CONFIG } from "../form/profileValidation";
import { Profile } from "../../../../types/profile";

import InputField from "../form/InputField";
import PickerField from "../form/PickerField";

// Your Options
import {
  maritalStatusOptions,
  highestQualification,
  occupationOptions,
  incomeOptions,
  livingWithParentsOptions,
} from "../form/profileOptions";

export default function EditPartnerPreferencesScreen({ navigation }: any) {
  const { profile, updateProfile } = useAuth();
  const { theme } = useAppTheme();

  const config = SECTION_CONFIG.find((s) => s.id === "partner")!;

  const { control } = useSectionEditor<Profile>(
    profile as Profile,
    config.fields,
    updateProfile,
    navigation,
    theme,
    config.title,
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.xxl,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ gap: theme.spacing.xs }}>
        {/* Preferred Marital Status */}
        <Controller
          control={control}
          name="preferredMaritalStatus"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label="Partner Marital Status"
              value={value}
              placeholder="Never Married, Divorced..."
              options={maritalStatusOptions}
              onSelect={onChange}
              icon={HeartHandshake}
              editable={true}
            />
          )}
        />

        {/* Preferred Education */}
        <Controller
          control={control}
          name="preferredEducation"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label="Education Preference"
              value={value}
              placeholder="Select qualification"
              options={highestQualification}
              onSelect={onChange}
              icon={GraduationCap}
              editable={true}
            />
          )}
        />

        {/* Preferred Profession */}
        <Controller
          control={control}
          name="preferredProfession"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label="Profession Preference"
              value={value}
              placeholder="Select occupation"
              options={occupationOptions}
              onSelect={onChange}
              icon={Briefcase}
              editable={true}
            />
          )}
        />

        {/* Preferred Income Range */}
        <Controller
          control={control}
          name="preferredIncomeRange"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label="Income Preference"
              value={value}
              placeholder="Select range"
              options={incomeOptions}
              onSelect={onChange}
              icon={Banknote}
              editable={true}
            />
          )}
        />

        {/* Preferred Location */}
        <Controller
          control={control}
          name="locationPreference"
          render={({ field: { onChange, value } }) => (
            <InputField
              label="Location Preference"
              value={value || ""}
              onChangeText={onChange}
              placeholder="e.g. Pune, Mumbai, etc."
              icon={MapPin}
              editable={true}
            />
          )}
        />

        {/* Living with Parents */}
        <Controller
          control={control}
          name="livingWithParents"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label="Living with Parents"
              value={value}
              placeholder="Select option"
              options={livingWithParentsOptions}
              onSelect={onChange}
              icon={Home}
              editable={true}
            />
          )}
        />
      </View>
    </ScrollView>
  );
}
