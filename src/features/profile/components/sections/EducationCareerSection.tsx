import React, { useLayoutEffect } from "react";
import { ScrollView, View } from "react-native";
import { Controller } from "react-hook-form";
import {
  GraduationCap,
  Briefcase,
  Building2,
  MapPin,
} from "lucide-react-native";

import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/theme/ThemeContext";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import { SECTION_CONFIG, isFieldLocked } from "../form/profileValidation";
import { Profile } from "../../../../types/profile";
import { useTranslation } from "react-i18next";

import InputField from "../form/InputField";
import PickerField from "../form/PickerField";

// Your Options
import {
  annualIncomeOptions,
  highestQualification,
  industryOptions,
  occupationOptions,
  studyFieldOptions,
} from "../form/profileOptions";

export default function EditEducationCareerScreen({ navigation }: any) {
  const { profile, updateProfile } = useAuth();
  const { theme } = useAppTheme();
  const { t } = useTranslation();

  // Find config for "education" section
  const config = SECTION_CONFIG.find((s) => s.id === "education")!;
  useLayoutEffect(() => {
    navigation.setOptions({
      title: t("details.sections.education"),
    });
  }, [navigation, t]);

  const { control } = useSectionEditor<Profile>(
    profile as Profile,
    config.fields,
    updateProfile,
    navigation,
    theme,
    config.title,
  );

  const getLockState = (name: keyof Profile) =>
    isFieldLocked(profile as Profile, name);

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
        {/* Highest Qualification */}
        <Controller
          control={control}
          name="highestQualification"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.qualification")}
              value={value}
              placeholder={t("details.placeholders.qualification")}
              options={highestQualification}
              onSelect={onChange}
              icon={GraduationCap}
              locked={getLockState("highestQualification")}
              editable={!getLockState("highestQualification")}
            />
          )}
        />

        {/* Field of Study */}
        <Controller
          control={control}
          name="fieldOfStudy"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.studyField")}
              value={value}
              placeholder={t("details.placeholders.studyField")}
              options={studyFieldOptions}
              onSelect={onChange}
              icon={GraduationCap}
              editable={true}
            />
          )}
        />

        {/* Occupation */}
        <Controller
          control={control}
          name="occupation"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.occupation")}
              value={value}
              placeholder={t("details.placeholders.occupation")}
              options={occupationOptions}
              onSelect={onChange}
              icon={Briefcase}
              editable={true}
            />
          )}
        />

        {/* Industry */}
        <Controller
          control={control}
          name="industry"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.industry")}
              value={value}
              placeholder={t("details.placeholders.industry")}
              options={industryOptions}
              onSelect={onChange}
              icon={Briefcase}
              editable={true}
            />
          )}
        />

        {/* Job Title */}
        <Controller
          control={control}
          name="jobTitle"
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.jobTitle")}
              value={value ?? ""}
              onChangeText={onChange}
              placeholder={t("details.placeholders.jobTitle")}
              icon={Briefcase}
              editable={true}
            />
          )}
        />

        {/* Company Name */}
        <Controller
          control={control}
          name="companyName"
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.company")}
              value={value ?? ""}
              onChangeText={onChange}
              placeholder={t("details.placeholders.company")}
              icon={Building2}
              editable={true}
            />
          )}
        />

        {/* Work Location */}
        <Controller
          control={control}
          name="workLocation"
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.workCity")}
              value={value ?? ""}
              onChangeText={onChange}
              placeholder={t("details.placeholders.workLocation")}
              icon={MapPin}
              editable={true}
            />
          )}
        />

        {/* Annual Income */}
        <Controller
          control={control}
          name="annualIncome"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.income")}
              value={value}
              placeholder={t("details.placeholders.income")}
              options={annualIncomeOptions}
              onSelect={onChange}
              icon={Briefcase}
              editable={true}
            />
          )}
        />
      </View>
    </ScrollView>
  );
}
