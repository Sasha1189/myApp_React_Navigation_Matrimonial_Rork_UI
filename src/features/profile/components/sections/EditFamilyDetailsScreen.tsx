import React from "react";
import { ScrollView, View } from "react-native";
import { Controller } from "react-hook-form";
import { Users, User, Info, Heart, Home } from "lucide-react-native";

import { useAppTheme } from "@/theme/ThemeContext";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import { SECTION_CONFIG } from "../form/profileValidation";
import { Profile } from "../../types/profile";
import { useTranslation } from "react-i18next";

import InputField from "../form/InputField";
import PickerField from "../form/PickerField";
import { transformLookupToOptions } from "@/features/utils/profileLookups";
import { useMyProfile } from "../../context/ProfileContext";

export default function EditFamilyDetailsScreen({ navigation }: any) {
  const { myProfile, updateMyProfile } = useMyProfile();
  const { theme } = useAppTheme();
  const { t } = useTranslation();

  const config = SECTION_CONFIG.find((s) => s.id === "family")!;

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
        {/* Father's Occupation */}
        <Controller
          control={control}
          name="fo" // fatherOccupation -> fo
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.fatherOcc")}
              value={value ?? ""}
              onChangeText={onChange}
              placeholder={t("details.placeholders.fatherOcc")}
              maxLength={50}
              icon={User}
              editable={true}
            />
          )}
        />

        {/* Mother's Occupation */}
        <Controller
          control={control}
          name="mo" // motherOccupation -> mo
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.motherOcc")}
              value={value ?? ""}
              onChangeText={onChange}
              placeholder={t("details.placeholders.motherOcc")}
              maxLength={50}
              icon={User}
              editable={true}
            />
          )}
        />

        {/* ROW 1: Number of Brothers & Number of Sisters */}
        <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="nb" // numberOfBrothers -> nb
              render={({ field: { onChange, value } }) => (
                <InputField
                  label={t("details.labels.brothers")}
                  value={
                    value !== undefined && value !== null ? String(value) : ""
                  }
                  onChangeText={onChange}
                  placeholder="e.g 1"
                  maxLength={10}
                  icon={Users}
                  editable={true}
                />
              )}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="ns" // numberOfSisters -> ns
              render={({ field: { onChange, value } }) => (
                <InputField
                  label={t("details.labels.sisters")}
                  value={
                    value !== undefined && value !== null ? String(value) : ""
                  }
                  onChangeText={onChange}
                  placeholder="e.g 2"
                  maxLength={10}
                  icon={Users}
                  editable={true}
                />
              )}
            />
          </View>
        </View>

        {/* Siblings' Details */}
        <Controller
          control={control}
          name="sd" // siblingsDetails -> sd
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.siblingsInfo")}
              value={value ?? ""}
              onChangeText={onChange}
              placeholder={t("details.placeholders.siblingsInfo")}
              multiline
              maxLength={150}
              icon={Info}
              editable={true}
            />
          )}
        />
      </View>
    </ScrollView>
  );
}
