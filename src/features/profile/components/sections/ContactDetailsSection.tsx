import React, { useLayoutEffect } from "react";
import { ScrollView, View } from "react-native";
import { Controller } from "react-hook-form";
import { Phone, MapPin, UserPlus } from "lucide-react-native";

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
  districtOptions,
  preferredContactOptions,
  profileCreatedByOptions,
} from "../form/profileOptions";

export default function EditContactDetailsScreen({ navigation }: any) {
  const { myProfile, updateMyProfile } = useAuth();
  const { theme } = useAppTheme();
  const { t } = useTranslation();

  // Find config for "contact" section
  const config = SECTION_CONFIG.find((s) => s.id === "contact")!;

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
        {/* Mobile Number - Often Locked/Verified */}
        <Controller
          control={control}
          name="mobileNumber"
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.mobile")}
              value={value}
              onChangeText={onChange}
              placeholder={t("details.placeholders.mobile")}
              keyboardType="phone-pad"
              icon={Phone}
              required
              locked={getLockState("mobileNumber")}
              editable={!getLockState("mobileNumber")}
            />
          )}
        />

        {/* Current City (District List) */}
        <Controller
          control={control}
          name="currentCity"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.currentCity")}
              value={value}
              placeholder={t("details.placeholders.city")}
              options={districtOptions}
              onSelect={onChange}
              icon={MapPin}
              editable={true}
            />
          )}
        />

        {/* Hometown (District List) */}
        <Controller
          control={control}
          name="nativePlace"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.nativePlace")}
              value={value}
              placeholder={t("details.placeholders.hometown")}
              options={districtOptions}
              onSelect={onChange}
              icon={MapPin}
              editable={true}
            />
          )}
        />

        {/* Preferred Contact Method */}
        <Controller
          control={control}
          name="preferredContact"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.contactPref")}
              value={value}
              placeholder={t("details.placeholders.contactMethod")}
              options={preferredContactOptions}
              onSelect={onChange}
              icon={Phone}
              editable={true}
            />
          )}
        />

        {/* Profile Created By */}
        <Controller
          control={control}
          name="profileCreatedBy"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.createdBy")}
              value={value}
              placeholder={t("details.placeholders.managedBy")}
              options={profileCreatedByOptions}
              onSelect={onChange}
              icon={UserPlus}
              editable={true}
            />
          )}
        />
      </View>
    </ScrollView>
  );
}
