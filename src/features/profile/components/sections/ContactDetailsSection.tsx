import React from "react";
import { ScrollView, View, Text } from "react-native";
import { Controller } from "react-hook-form";
import { Phone, MapPin, UserPlus } from "lucide-react-native";

import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/theme/ThemeContext";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import { SECTION_CONFIG } from "../form/profileValidation";
import { Profile } from "../../../../types/profile";
import { useTranslation } from "react-i18next";

import InputField from "../form/InputField";
import PickerField from "../form/PickerField";
import { transformLookupToOptions } from "@/features/utils/profileLookups";

export default function EditContactDetailsScreen({ navigation }: any) {
  const { myProfile, updateMyProfile } = useAuth();
  const { theme } = useAppTheme();
  const { t } = useTranslation();

  // Find config for "contact" section
  const config = SECTION_CONFIG.find((s) => s.id === "contact")!;

  const { control, formState } = useSectionEditor<Profile>(
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
        {/* Parent Mobile Number */}
        <Controller
          control={control}
          name="mn"
          rules={{
            validate: (value) => {
              if (
                value === undefined ||
                value === null ||
                String(value).trim() === ""
              ) {
                return true;
              }
              const isValidIndianMobile = /^[6-9]\d{9}$/.test(String(value));
              return (
                isValidIndianMobile ||
                t("details.errMobileInvalid") ||
                "Invalid 10-digit number"
              );
            },
          }}
          render={({ field: { onChange, value } }) => (
            <View style={{ width: "100%" }}>
              <InputField
                label={t("details.labels.mobile")}
                value={value ?? ""}
                onChangeText={(text) => {
                  const digitsOnly = text.replace(/[^0-9]/g, "");
                  onChange(digitsOnly.slice(0, 10));
                }}
                placeholder={t("details.placeholders.mobile")}
                keyboardType="phone-pad"
                maxLength={10}
                icon={Phone}
              />

              {/* 🎯 FIX 2: Check formState.errors natively. This hooks into the re-render cycle! */}
              {formState.errors?.mn && (
                <Text
                  style={{
                    color: theme.colors.danger || "red",
                    fontSize: 12,
                    marginTop: 4,
                    marginLeft: 4,
                    fontWeight: "500",
                  }}
                >
                  {formState.errors.mn.message as string}
                </Text>
              )}
            </View>
          )}
        />

        {/* Current City (District List) */}
        <Controller
          control={control}
          name="cc" // currentCity -> cc
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.currentCity")}
              value={value}
              placeholder={t("details.placeholders.city")}
              options={transformLookupToOptions("ct")} // Kept flat strings as per schema rules
              onSelect={onChange}
              icon={MapPin}
              editable={true}
            />
          )}
        />

        {/* Hometown (District List) */}
        <Controller
          control={control}
          name="np" // nativePlace -> np
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.nativePlace")}
              value={value}
              placeholder={t("details.placeholders.hometown")}
              options={transformLookupToOptions("ct")} // Kept flat strings as per schema rules
              onSelect={onChange}
              icon={MapPin}
              editable={true}
            />
          )}
        />

        {/* Preferred Contact Method */}
        <Controller
          control={control}
          name="pc" // preferredContact -> pc
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.contactPref")}
              value={value}
              placeholder={t("details.placeholders.contactMethod")}
              options={transformLookupToOptions("pc")} // Maps to LOOKUPS.pc numeric indices
              onSelect={onChange}
              icon={Phone}
              editable={true}
            />
          )}
        />

        {/* Profile Created By */}
        <Controller
          control={control}
          name="cb" // profileCreatedBy -> cb
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.createdBy")}
              value={value}
              placeholder={t("details.placeholders.managedBy")}
              options={transformLookupToOptions("cb")} // Maps to LOOKUPS.cb numeric indices
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
