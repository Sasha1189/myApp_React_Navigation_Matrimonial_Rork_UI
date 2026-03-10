import React from "react";
import { ScrollView, View } from "react-native";
import { Controller } from "react-hook-form";
import { Phone, MapPin, UserPlus } from "lucide-react-native";

import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/theme/ThemeContext";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import { SECTION_CONFIG, isFieldLocked } from "../form/profileValidation";
import { Profile } from "../../../../types/profile";

import InputField from "../form/InputField";
import PickerField from "../form/PickerField";

// Your Options
import {
  districtOptions,
  preferredContactOptions,
  profileCreatedByOptions,
} from "../form/profileOptions";

export default function EditContactDetailsScreen({ navigation }: any) {
  const { profile, updateProfile } = useAuth();
  const { theme } = useAppTheme();

  // Find config for "contact" section
  const config = SECTION_CONFIG.find((s) => s.id === "contact")!;

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
        {/* Mobile Number - Often Locked/Verified */}
        <Controller
          control={control}
          name="mobileNumber"
          render={({ field: { onChange, value } }) => (
            <InputField
              label="Mobile Number"
              value={value}
              onChangeText={onChange}
              placeholder="Enter mobile number"
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
              label="Current City"
              value={value}
              placeholder="Select your city"
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
              label="Hometown"
              value={value}
              placeholder="Select your hometown"
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
              label="Preferred Contact"
              value={value}
              placeholder="How should we reach you?"
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
              label="Profile Created By"
              value={value}
              placeholder="Who is managing this profile?"
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
