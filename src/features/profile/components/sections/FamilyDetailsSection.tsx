import React from "react";
import { ScrollView, View } from "react-native";
import { Controller } from "react-hook-form";
import { Users, User, Info } from "lucide-react-native";

import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/theme/ThemeContext";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import { SECTION_CONFIG, isFieldLocked } from "../form/profileValidation";
import { Profile } from "../../../../types/profile";

import InputField from "../form/InputField";

export default function EditFamilyDetailsScreen({ navigation }: any) {
  const { profile, updateProfile } = useAuth();
  const { theme } = useAppTheme();

  // Find config for "family" section
  const config = SECTION_CONFIG.find((s) => s.id === "family")!;

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
        {/* Father's Occupation */}
        <Controller
          control={control}
          name="fatherOccupation"
          render={({ field: { onChange, value } }) => (
            <InputField
              label="Father's Occupation"
              value={value ?? ""}
              onChangeText={onChange}
              placeholder="e.g. Farmer, Retired Govt Officer"
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
              label="Mother's Occupation"
              value={value ?? ""}
              onChangeText={onChange}
              placeholder="e.g. Homemaker, Teacher"
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
              label="Number of Brothers"
              value={value?.toString() ?? ""}
              onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ""))} // Numbers only
              placeholder="0"
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
              label="Number of Sisters"
              value={value?.toString() ?? ""}
              onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ""))} // Numbers only
              placeholder="0"
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
              label="Siblings' Details"
              value={value ?? ""}
              onChangeText={onChange}
              placeholder="e.g. Elder brother married, living in Pune"
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
