import React, { useLayoutEffect } from "react";
import { ScrollView, View } from "react-native";
import { Controller } from "react-hook-form";
import {
  User,
  UserCheck,
  Calendar,
  Timer,
  MapPin,
  HeartHandshake,
  Ruler,
  Scale,
  Activity,
  Droplets,
  Sparkles,
  Star,
  Zap,
  HeartIcon,
} from "lucide-react-native";

import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/theme/ThemeContext";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import { SECTION_CONFIG, isFieldLocked } from "../form/profileValidation";
import { Profile } from "../../../../types/profile";
import { useTranslation } from "react-i18next";

import InputField from "../form/InputField";
import PickerField from "../form/PickerField";
import DatePickerField, { TimePickerField } from "../form/DateTimePickers";

import {
  genderOptions,
  maritalStatusOptions,
  bodyTypeOptions,
  bloodGroupOptions,
  manglikOptions,
  rashiOptions,
  horoscopeOptions,
  isReady as isReadyOptions,
} from "../form/profileOptions";

export default function EditPersonalInfoScreen({ navigation }: any) {
  const { profile, updateProfile } = useAuth();
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const config = SECTION_CONFIG.find((s) => s.id === "personal")!;

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
    >
      <View style={{ gap: theme.spacing.xs }}>
        {/* 1. Full Name */}
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.fullName")}
              placeholder={t("details.labels.fullName")}
              value={value}
              onChangeText={onChange}
              icon={UserCheck}
              required
              locked={getLockState("fullName")}
              editable={!getLockState("fullName")}
            />
          )}
        />

        {/* 2. Date of Birth */}
        <Controller
          control={control}
          name="dateOfBirth"
          render={({ field: { onChange, value } }) => (
            <DatePickerField
              label={t("details.labels.age")}
              placeholder="YYYY-MM-DD"
              value={value ? String(value) : ""}
              onChange={onChange}
              icon={Calendar}
              required
              locked={getLockState("dateOfBirth")}
              editable={!getLockState("dateOfBirth")}
            />
          )}
        />

        {/* 3. Time of Birth */}
        <Controller
          control={control}
          name="timeOfBirth"
          render={({ field: { onChange, value } }) => (
            <TimePickerField
              label={t("details.labels.timeOfBirth")}
              placeholder="e.g. 06:30 AM"
              value={value ?? ""}
              onChange={onChange}
              icon={Timer}
            />
          )}
        />

        {/* 4. Place of Birth */}
        <Controller
          control={control}
          name="placeOfBirth"
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.birthPlace")}
              placeholder="City, State"
              value={value}
              onChangeText={onChange}
              icon={MapPin}
            />
          )}
        />

        {/* 5. Gender */}
        <Controller
          control={control}
          name="gender"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.gender")}
              placeholder={t("details.labels.gender")}
              value={value}
              options={genderOptions}
              onSelect={onChange}
              icon={User}
              required
              locked={getLockState("gender")}
              editable={!getLockState("gender")}
            />
          )}
        />

        {/* 6. Marital Status */}
        <Controller
          control={control}
          name="maritalStatus"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.maritalStatus")}
              placeholder={t("details.labels.maritalStatus")}
              value={value}
              options={maritalStatusOptions}
              onSelect={onChange}
              icon={HeartHandshake}
              required
              locked={getLockState("maritalStatus")}
              editable={!getLockState("maritalStatus")}
            />
          )}
        />

        {/* 7. Height */}
        <Controller
          control={control}
          name="height"
          rules={{
            required: t("errors.required"),
            minLength: { value: 3, message: t("errors.invalidHeight") },
          }}
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.height")}
              placeholder="e.g. 170cm"
              value={value}
              keyboardType="numeric"
              maxLength={3} // 🔹 Strict 3 digits
              onChangeText={(text) => {
                // 🔹 Allow only numbers
                const cleaned = text.replace(/[^0-9]/g, "");
                onChange(cleaned);
              }}
              icon={Ruler}
            />
          )}
        />

        {/* 8. Weight */}
        <Controller
          control={control}
          name="weight"
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.weight")}
              placeholder="e.g. 70kg"
              value={value}
              onChangeText={onChange}
              icon={Scale}
            />
          )}
        />

        {/* 9. Body Type */}
        <Controller
          control={control}
          name="bodyType"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.bodyType")}
              placeholder="Slim/Athletic/Average"
              value={value}
              options={bodyTypeOptions}
              onSelect={onChange}
              icon={Activity}
            />
          )}
        />

        {/* 10. Blood Group */}
        <Controller
          control={control}
          name="bloodGroup"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.bloodGroup")}
              placeholder={t("details.labels.bloodGroup")}
              value={value}
              options={bloodGroupOptions}
              onSelect={onChange}
              icon={Droplets}
            />
          )}
        />

        {/* 11. Manglik Status */}
        <Controller
          control={control}
          name="manglikStatus"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.manglik")}
              placeholder="Yes/No/Partial"
              value={value}
              options={manglikOptions}
              onSelect={onChange}
              icon={Sparkles}
            />
          )}
        />

        {/* 12. Rashi */}
        <Controller
          control={control}
          name="rashi"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.rashi")}
              placeholder={t("details.labels.rashi")}
              value={value}
              options={rashiOptions}
              onSelect={onChange}
              icon={Star}
            />
          )}
        />

        {/* 13. Horoscope Required */}
        <Controller
          control={control}
          name="horoscopeRequired"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.horoscopeRequired")}
              placeholder="Yes/No/Optional"
              value={value}
              options={horoscopeOptions}
              onSelect={onChange}
              icon={Zap}
            />
          )}
        />

        {/* 14. Marriage Ready */}
        <Controller
          control={control}
          name="isReady"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.isReady")}
              placeholder="Yes / No still studying"
              value={value}
              options={isReadyOptions}
              onSelect={onChange}
              icon={HeartIcon}
            />
          )}
        />
      </View>
    </ScrollView>
  );
}
