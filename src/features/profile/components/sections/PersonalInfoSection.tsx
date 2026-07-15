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
import { formatDOB } from "@/utils/dateUtils";

import InputField from "../form/InputField";
import PickerField from "../form/PickerField";
import { DatePickerField, TimePickerField } from "../form/DateTimePickers";

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
  const { myProfile, updateMyProfile } = useAuth();
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const config = SECTION_CONFIG.find((s) => s.id === "personal")!;

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
    >
      <View style={{ gap: theme.spacing.xs }}>
        {/* 1. Full Name */}
        <Controller
          control={control}
          name="fullName"
          rules={{ required: true }}
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

        {/* ROW 1: DOB & Time of Birth */}
        <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="dateOfBirth"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <DatePickerField
                  label={t("details.labels.dateOfBirth")}
                  placeholder="YYYY-MM-DD"
                  value={formatDOB(value, "form")}
                  onChange={(selectedDate) => {
                    const dateString =
                      selectedDate instanceof Date
                        ? selectedDate.toISOString().split("T")[0]
                        : selectedDate;
                    onChange(dateString);
                  }}
                  icon={Calendar}
                  required
                  locked={getLockState("dateOfBirth")}
                  editable={!getLockState("dateOfBirth")}
                />
              )}
            />
          </View>

          <View style={{ flex: 1 }}>
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
          </View>
        </View>

        {/* ROW 2: Place of Birth & Height */}
        <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
          <View style={{ flex: 1 }}>
            {/*  Place of Birth */}
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
          </View>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="height"
              rules={{
                pattern: {
                  value: /^[0-9]{3}$/,
                  message: t("errors.invalidHeight"),
                },
              }}
              render={({ field: { onChange, value } }) => {
                const stringValue = value
                  ? String(value).replace(/[^0-9]/g, "")
                  : "";
                return (
                  <InputField
                    label={t("details.labels.height")}
                    placeholder="e.g. 170cm"
                    value={stringValue}
                    keyboardType="numeric"
                    maxLength={3}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^0-9]/g, "");
                      onChange(cleaned);
                    }}
                    icon={Ruler}
                  />
                );
              }}
            />
          </View>
        </View>

        {/* ROW 3: Body Type & Blood Group */}
        <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="bodyType"
              render={({ field: { onChange, value } }) => (
                <PickerField
                  label={t("details.labels.bodyType")}
                  placeholder="Slim/Athletic..."
                  value={value}
                  options={bodyTypeOptions}
                  onSelect={onChange}
                  icon={Activity}
                />
              )}
            />
          </View>

          <View style={{ flex: 1 }}>
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
          </View>
        </View>

        {/* ROW 4: Manglik Status & Rashi */}
        <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
          <View style={{ flex: 1 }}>
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
          </View>

          <View style={{ flex: 1 }}>
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
          </View>
        </View>

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

        {/* Marital Status & Marriage Ready */}
        <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="maritalStatus"
              rules={{ required: true }}
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
          </View>
          <View style={{ flex: 1 }}>
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
        </View>
      </View>
    </ScrollView>
  );
}
