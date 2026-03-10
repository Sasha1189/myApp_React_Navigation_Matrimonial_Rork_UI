import React from "react";
import { ScrollView, View } from "react-native";
import { Controller } from "react-hook-form";
import {
  GraduationCap,
  Briefcase,
  Building2,
  MapPin,
} from "lucide-react-native";

import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/theme/ThemeContext";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import { SECTION_CONFIG, isFieldLocked } from "../form/profileValidation";
import { Profile } from "../../../../types/profile";

import InputField from "../form/InputField";
import PickerField from "../form/PickerField";

// Your Options
import {
  annualIncomeOptions,
  highestQualification,
  industryOptions,
  occupationOptions,
  studyFieldOptions,
} from "../form/profileOptions";

export default function EditEducationCareerScreen({ navigation }: any) {
  const { profile, updateProfile } = useAuth();
  const { theme } = useAppTheme();

  // Find config for "education" section
  const config = SECTION_CONFIG.find((s) => s.id === "education")!;

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
        {/* Highest Qualification */}
        <Controller
          control={control}
          name="highestQualification"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label="Highest Qualification"
              value={value}
              placeholder="e.g. Master's, Bachelor's"
              options={highestQualification}
              onSelect={onChange}
              icon={GraduationCap}
              locked={getLockState("highestQualification")}
              editable={!getLockState("highestQualification")}
            />
          )}
        />

        {/* Field of Study */}
        <Controller
          control={control}
          name="fieldOfStudy"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label="Field of Study"
              value={value}
              placeholder="e.g. Engineering, Commerce"
              options={studyFieldOptions}
              onSelect={onChange}
              icon={GraduationCap}
              editable={true}
            />
          )}
        />

        {/* Occupation */}
        <Controller
          control={control}
          name="occupation"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label="Current Occupation"
              value={value}
              placeholder="Select your occupation"
              options={occupationOptions}
              onSelect={onChange}
              icon={Briefcase}
              editable={true}
            />
          )}
        />

        {/* Industry */}
        <Controller
          control={control}
          name="industry"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label="Industry"
              value={value}
              placeholder="e.g. IT, Healthcare"
              options={industryOptions}
              onSelect={onChange}
              icon={Briefcase}
              editable={true}
            />
          )}
        />

        {/* Job Title */}
        <Controller
          control={control}
          name="jobTitle"
          render={({ field: { onChange, value } }) => (
            <InputField
              label="Job Title"
              value={value ?? ""}
              onChangeText={onChange}
              placeholder="e.g. Senior Software Engineer"
              icon={Briefcase}
              editable={true}
            />
          )}
        />

        {/* Company Name */}
        <Controller
          control={control}
          name="companyName"
          render={({ field: { onChange, value } }) => (
            <InputField
              label="Company Name"
              value={value ?? ""}
              onChangeText={onChange}
              placeholder="Enter your current company"
              icon={Building2}
              editable={true}
            />
          )}
        />

        {/* Work Location */}
        <Controller
          control={control}
          name="workLocation"
          render={({ field: { onChange, value } }) => (
            <InputField
              label="Work Location"
              value={value ?? ""}
              onChangeText={onChange}
              placeholder="City, State"
              icon={MapPin}
              editable={true}
            />
          )}
        />

        {/* Annual Income */}
        <Controller
          control={control}
          name="annualIncome"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label="Annual Income"
              value={value}
              placeholder="Select income range"
              options={annualIncomeOptions}
              onSelect={onChange}
              icon={Briefcase}
              editable={true}
            />
          )}
        />
      </View>
    </ScrollView>
  );
}
