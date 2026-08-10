import React from "react";
import { ScrollView, View } from "react-native";
import { Controller } from "react-hook-form";
import {
  UserCheck,
  Calendar,
  Timer,
  MapPin,
  HeartHandshake,
  Ruler,
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
import { transformLookupToOptions } from "@/features/utils/profileLookups";

import InputField from "../form/InputField";
import PickerField from "../form/PickerField";
import { DateTimePickerField } from "../form/DateTimePickers";

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
        {/* ROW 0: First name & Last name */}
        <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
          <View style={{ flex: 1 }}>
            {/* 1a. Name */}
            <Controller
              control={control}
              name="fn" // firstName -> fn
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <InputField
                  label={t("details.labels.firstName")}
                  placeholder={t("details.placeholders.firstName")}
                  value={value}
                  onChangeText={onChange}
                  icon={UserCheck}
                  required
                  maxLength={15}
                  locked={getLockState("fn")}
                  editable={!getLockState("fn")}
                />
              )}
            />
          </View>
          <View style={{ flex: 1 }}>
            {/* 1b. Lastname */}
            <Controller
              control={control}
              name="ln" // lastName -> sn
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <InputField
                  label={t("details.labels.lastName")}
                  placeholder={t("details.placeholders.lastName")}
                  value={value}
                  onChangeText={onChange}
                  icon={UserCheck}
                  required
                  maxLength={15}
                  locked={getLockState("ln")}
                  editable={!getLockState("ln")}
                />
              )}
            />
          </View>
        </View>

        {/* ROW 1: DOB & Time of Birth */}
        <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="db" // dateOfBirth -> db
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <DateTimePickerField
                  mode="date"
                  label={t("details.labels.dateOfBirth")}
                  placeholder="YYYY-MM-DD"
                  value={value ?? undefined}
                  onChange={onChange}
                  icon={Calendar}
                  required
                  locked={getLockState("db")}
                  editable={!getLockState("db")}
                />
              )}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="tob" // timeOfBirth -> tob
              render={({ field: { onChange, value } }) => (
                <DateTimePickerField
                  mode="time"
                  label={t("details.labels.timeOfBirth")}
                  placeholder=" 05:20 AM"
                  value={value ?? undefined}
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
            <Controller
              control={control}
              name="pb" // placeOfBirth -> pb
              render={({ field: { onChange, value } }) => (
                <InputField
                  label={t("details.labels.birthPlace")}
                  placeholder={t("details.placeholders.birthPlace")}
                  value={value}
                  onChangeText={onChange}
                  maxLength={40}
                  icon={MapPin}
                />
              )}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="ht" // height -> ht
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
                    placeholder={t("details.placeholders.height")}
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
              name="bt" // bodyType -> bt
              render={({ field: { onChange, value } }) => (
                <PickerField
                  label={t("details.labels.bodyType")}
                  placeholder="Slim/Athletic..."
                  value={value}
                  options={transformLookupToOptions("bt")} // Dynamically binds LOOKUPS.bt numeric indexes
                  onSelect={onChange}
                  icon={Activity}
                />
              )}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="bg" // bloodGroup -> bg
              render={({ field: { onChange, value } }) => (
                <PickerField
                  label={t("details.labels.bloodGroup")}
                  placeholder={t("details.labels.bloodGroup")}
                  value={value}
                  options={transformLookupToOptions("bg")} // Dynamically binds LOOKUPS.bg numeric indexes
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
              name="mg" // manglikStatus -> mg
              render={({ field: { onChange, value } }) => (
                <PickerField
                  label={t("details.labels.manglik")}
                  placeholder="Yes/No/Partial"
                  value={value}
                  options={transformLookupToOptions("mg")} // Dynamically binds LOOKUPS.mg numeric indexes
                  onSelect={onChange}
                  icon={Sparkles}
                />
              )}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="rs" // rashi -> rs
              render={({ field: { onChange, value } }) => (
                <PickerField
                  label={t("details.labels.rashi")}
                  placeholder={t("details.labels.rashi")}
                  value={value}
                  options={transformLookupToOptions("rs")} // Dynamically binds LOOKUPS.rs numeric indexes
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
          name="hr" // horoscopeRequired -> hr
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.horoscopeRequired")}
              placeholder="Yes/No/Optional"
              value={value}
              options={transformLookupToOptions("hr")} // Maps to LOOKUPS.hr numeric indices
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
              name="ms" // maritalStatus -> ms
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <PickerField
                  label={t("details.labels.maritalStatus")}
                  placeholder={t("details.labels.maritalStatus")}
                  value={value}
                  options={transformLookupToOptions("ms")} // Maps to LOOKUPS.ms numeric indices
                  onSelect={onChange}
                  icon={HeartHandshake}
                  required
                  locked={getLockState("ms")}
                  editable={!getLockState("ms")}
                />
              )}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="ir" // isReady -> ir
              render={({ field: { onChange, value } }) => (
                <PickerField
                  label={t("details.labels.isReady")}
                  placeholder="Yes / No still studying"
                  value={value}
                  options={transformLookupToOptions("ir")} // Kept as standard string values to match schema definitions
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
