import React, { useLayoutEffect } from "react";
import { ScrollView, View } from "react-native";
import { Controller } from "react-hook-form";
import {
  HeartHandshake,
  MapPin,
  Home,
  GraduationCap,
  Briefcase,
  Banknote,
} from "lucide-react-native";

import { useAppTheme } from "@/theme/ThemeContext";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import { SECTION_CONFIG } from "../form/profileValidation";
import { Profile } from "../../types/profile";
import { useTranslation } from "react-i18next";
import { transformLookupToOptions } from "@/features/utils/profileLookups";

import InputField from "../form/InputField";
import PickerField from "../form/PickerField";
import { useMyProfile } from "../../context/ProfileContext";

export default function EditPartnerPreferencesScreen({ navigation }: any) {
  const { myProfile, updateMyProfile } = useMyProfile();
  const { theme } = useAppTheme();
  const { t } = useTranslation();

  const config = SECTION_CONFIG.find((s) => s.id === "preferences")!;

  const { control } = useSectionEditor<Profile>(
    myProfile as Profile,
    config.fields,
    updateMyProfile,
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
          name="pms" // preferredMaritalStatus -> pms
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.maritalStatus")}
              value={value}
              placeholder={t("details.placeholders.prefMarital")}
              options={transformLookupToOptions("ms")} // Reuses core 'ms' lookups
              onSelect={onChange}
              icon={HeartHandshake}
              editable={true}
            />
          )}
        />

        {/* Preferred Education */}
        <Controller
          control={control}
          name="pe" // preferredEducation -> pe
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.qualification")}
              value={value}
              placeholder={t("details.placeholders.prefEdu")}
              options={transformLookupToOptions("hq")} // Enforces custom partner labels
              onSelect={onChange}
              icon={GraduationCap}
              editable={true}
            />
          )}
        />

        {/* Preferred Profession */}
        <Controller
          control={control}
          name="pp" // preferredProfession -> pp
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.occupation")}
              value={value}
              placeholder={t("details.placeholders.prefProf")}
              options={transformLookupToOptions("oc")} // Enforces custom partner label
              onSelect={onChange}
              icon={Briefcase}
              editable={true}
            />
          )}
        />

        {/* Preferred Income Range */}
        <Controller
          control={control}
          name="pir" // preferredIncomeRange -> pir
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.income")}
              value={value}
              placeholder={t("details.placeholders.prefIncome")}
              options={transformLookupToOptions("ai")} // Reuses core 'ai' lookups
              onSelect={onChange}
              icon={Banknote}
              editable={true}
            />
          )}
        />

        {/* Preferred Location */}
        <Controller
          control={control}
          name="lp" // locationPreference -> lp
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.locationPreference")}
              value={value || ""}
              onChangeText={onChange}
              placeholder={t("details.placeholders.prefLocation")}
              maxLength={30}
              icon={MapPin}
              editable={true}
            />
          )}
        />

        {/* Living with Parents */}
        <Controller
          control={control}
          name="lwp" // livingWithParents -> lwp
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.livingWithParents")}
              value={value}
              placeholder={t("details.placeholders.parents")}
              options={transformLookupToOptions("lwp")}
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
