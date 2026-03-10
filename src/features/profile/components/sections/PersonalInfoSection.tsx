import React from "react";
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
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ gap: theme.spacing.xs }}>
        {/* 1. Full Name */}
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, value } }) => (
            <InputField
              label="Full Name"
              value={value}
              onChangeText={onChange}
              placeholder="Enter full name"
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
              label="Date of Birth"
              value={value ? String(value) : ""}
              onChange={onChange}
              placeholder="YYYY-MM-DD"
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
              label="Time of Birth"
              value={value ?? ""}
              onChange={onChange}
              placeholder="e.g. 06:30 AM"
              icon={Timer}
              editable={true}
            />
          )}
        />

        {/* 4. Place of Birth */}
        <Controller
          control={control}
          name="placeOfBirth"
          render={({ field: { onChange, value } }) => (
            <InputField
              label="Place of Birth"
              value={value}
              onChangeText={onChange}
              placeholder="City, State"
              icon={MapPin}
              editable={true}
            />
          )}
        />

        {/* 5. Gender */}
        <Controller
          control={control}
          name="gender"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label="Gender"
              value={value}
              options={genderOptions}
              onSelect={onChange}
              placeholder="Select Gender"
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
              label="Marital Status"
              value={value}
              options={maritalStatusOptions}
              onSelect={onChange}
              placeholder="Select Status"
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
          render={({ field: { onChange, value } }) => (
            <InputField
              label="Height"
              value={value}
              onChangeText={onChange}
              placeholder="e.g. 5'8\"
              icon={Ruler}
              editable={true}
            />
          )}
        />

        {/* 8. Weight */}
        <Controller
          control={control}
          name="weight"
          render={({ field: { onChange, value } }) => (
            <InputField
              label="Weight"
              value={value}
              onChangeText={onChange}
              placeholder="e.g. 70kg"
              icon={Scale}
              editable={true}
            />
          )}
        />

        {/* 9. Body Type */}
        <Controller
          control={control}
          name="bodyType"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label="Body Type"
              value={value}
              options={bodyTypeOptions}
              onSelect={onChange}
              placeholder="Slim/Athletic/Average"
              icon={Activity}
              editable={true}
            />
          )}
        />

        {/* 10. Blood Group */}
        <Controller
          control={control}
          name="bloodGroup"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label="Blood Group"
              value={value}
              options={bloodGroupOptions}
              onSelect={onChange}
              placeholder="Select Blood Group"
              icon={Droplets}
              editable={true}
            />
          )}
        />

        {/* 11. Manglik Status */}
        <Controller
          control={control}
          name="manglikStatus"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label="Manglik Status"
              value={value}
              options={manglikOptions}
              onSelect={onChange}
              placeholder="Yes/No/Partial"
              icon={Sparkles}
              editable={true}
            />
          )}
        />

        {/* 12. Rashi */}
        <Controller
          control={control}
          name="rashi"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label="Rashi (Zodiac)"
              value={value}
              options={rashiOptions}
              onSelect={onChange}
              placeholder="Select Rashi"
              icon={Star}
              editable={true}
            />
          )}
        />

        {/* 13. Horoscope Required */}
        <Controller
          control={control}
          name="horoscopeRequired"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label="Horoscope Required?"
              value={value}
              options={horoscopeOptions}
              onSelect={onChange}
              placeholder="Yes/No/Optional"
              icon={Zap}
              editable={true}
            />
          )}
        />

        {/* 14. Marriage Ready */}
        <Controller
          control={control}
          name="isReady"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label="Ready to marry soon?"
              value={value}
              options={isReadyOptions}
              onSelect={onChange}
              placeholder="Yes / No still studying"
              icon={HeartIcon}
              editable={true}
            />
          )}
        />
      </View>
    </ScrollView>
  );
}
