import React, { useLayoutEffect } from "react";
import { ScrollView, View } from "react-native";
import { Controller } from "react-hook-form";
import { Users, User, Info } from "lucide-react-native";

import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/theme/ThemeContext";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import { SECTION_CONFIG, isFieldLocked } from "../form/profileValidation";
import { Profile } from "../../../../types/profile";
import { useTranslation } from "react-i18next";

import InputField from "../form/InputField";

export default function EditFamilyDetailsScreen({ navigation }: any) {
  const { myProfile, updateMyProfile } = useAuth();
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
        {/* Father's Occupation */}
        <Controller
          control={control}
          name="fatherOccupation"
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.fatherOcc")}
              value={value ?? ""}
              onChangeText={onChange}
              placeholder={t("details.placeholders.fatherOcc")}
              icon={User}
              editable={true}
            />
          )}
        />

        {/* Mother's Occupation */}
        <Controller
          control={control}
          name="motherOccupation"
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.motherOcc")}
              value={value ?? ""}
              onChangeText={onChange}
              placeholder={t("details.placeholders.motherOcc")}
              icon={User}
              editable={true}
            />
          )}
        />

        {/* Number of Brothers */}
        <Controller
          control={control}
          name="numberOfBrothers"
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.brothers")}
              value={value?.toString() ?? ""}
              onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ""))} // Numbers only
              placeholder={t("details.placeholders.brothers")}
              keyboardType="numeric"
              icon={Users}
              editable={true}
            />
          )}
        />

        {/* Number of Sisters */}
        <Controller
          control={control}
          name="numberOfSisters"
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.sisters")}
              value={value?.toString() ?? ""}
              onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ""))} // Numbers only
              placeholder={t("details.placeholders.sisters")}
              keyboardType="numeric"
              icon={Users}
              editable={true}
            />
          )}
        />

        {/* Siblings' Details - SMART AUTO-EXPANDING BOX */}
        <Controller
          control={control}
          name="siblingsDetails"
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.siblingsInfo")}
              value={value ?? ""}
              onChangeText={onChange}
              placeholder={t("details.placeholders.siblingsInfo")}
              multiline
              icon={Info}
              editable={true}
            />
          )}
        />
      </View>
    </ScrollView>
  );
}
