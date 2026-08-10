import React from "react";
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
import { transformLookupToOptions } from "@/features/utils/profileLookups";

import InputField from "../form/InputField";
import PickerField from "../form/PickerField";

export default function EditEducationCareerScreen({ navigation }: any) {
  const { myProfile, updateMyProfile } = useAuth();
  const { theme } = useAppTheme();
  const { t } = useTranslation();

  // Find config for "education" section
  const config = SECTION_CONFIG.find((s) => s.id === "education")!;

  const { control } = useSectionEditor<Profile>(
    myProfile as Profile,
    config.fields,
    updateMyProfile,
    navigation,
    theme,
    config.title,
  );

  const getLockState = (name: keyof Profile) =>
    isFieldLocked(myProfile as Profile, name);

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
          name="hq" // highestQualification -> hq
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.qualification")}
              value={value}
              placeholder={t("details.placeholders.qualification")}
              options={transformLookupToOptions("hq")}
              onSelect={onChange}
              icon={GraduationCap}
              locked={getLockState("hq")}
              editable={!getLockState("hq")}
            />
          )}
        />

        {/* Field of Study */}
        <Controller
          control={control}
          name="fs" // fieldOfStudy -> fs
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.studyField")}
              value={value}
              placeholder={t("details.placeholders.studyField")}
              options={transformLookupToOptions("fs")}
              onSelect={onChange}
              icon={GraduationCap}
              editable={true}
            />
          )}
        />

        {/* Occupation */}
        <Controller
          control={control}
          name="oc" // occupation -> oc
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.occupation")}
              value={value}
              placeholder={t("details.placeholders.occupation")}
              options={transformLookupToOptions("oc")}
              onSelect={onChange}
              icon={Briefcase}
              editable={true}
            />
          )}
        />

        {/* Industry */}
        <Controller
          control={control}
          name="ind" // industry -> ind
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.industry")}
              value={value}
              placeholder={t("details.placeholders.industry")}
              options={transformLookupToOptions("ind")}
              onSelect={onChange}
              icon={Briefcase}
              editable={true}
            />
          )}
        />

        {/* Job Title */}
        <Controller
          control={control}
          name="jt" // jobTitle -> jt
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.jobTitle")}
              value={value ?? ""}
              onChangeText={onChange}
              placeholder={t("details.placeholders.jobTitle")}
              maxLength={50}
              icon={Briefcase}
              editable={true}
            />
          )}
        />

        {/* Company Name */}
        <Controller
          control={control}
          name="cn" // companyName -> cn
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.company")}
              value={value ?? ""}
              onChangeText={onChange}
              placeholder={t("details.placeholders.company")}
              maxLength={50}
              icon={Building2}
              editable={true}
            />
          )}
        />

        {/* Work Location */}
        <Controller
          control={control}
          name="wl" // workLocation -> wl
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.workCity")}
              value={value ?? ""}
              onChangeText={onChange}
              placeholder={t("details.placeholders.workLocation")}
              maxLength={30}
              icon={MapPin}
              editable={true}
            />
          )}
        />

        {/* Annual Income */}
        <Controller
          control={control}
          name="ai" // annualIncome -> ai
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.income")}
              value={value}
              placeholder={t("details.placeholders.income")}
              options={transformLookupToOptions("ai")}
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
