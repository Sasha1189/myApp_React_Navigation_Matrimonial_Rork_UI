import React, { useLayoutEffect } from "react";
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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const config = SECTION_CONFIG.find((s) => s.id === "preferences")!;

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
              label={t("details.labels.maritalStatus")}
              value={value}
              placeholder={t("details.placeholders.prefMarital")}
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
              label={t("details.labels.qualification")}
              value={value}
              placeholder={t("details.placeholders.prefEdu")}
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
              label={t("details.labels.occupation")}
              value={value}
              placeholder={t("details.placeholders.prefProf")}
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
              label={t("details.labels.income")}
              value={value}
              placeholder={t("details.placeholders.prefIncome")}
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
              label={t("details.labels.locationPreference")}
              value={value || ""}
              onChangeText={onChange}
              placeholder={t("details.placeholders.prefLocation")}
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
              label={t("details.labels.livingWithParents")}
              value={value}
              placeholder={t("details.placeholders.parents")}
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
