import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { GraduationCap, Briefcase, Building2 } from "lucide-react-native";

import FormSection from "../form/FormSection";
import InputField from "../form/InputField";
import PickerField from "../form/PickerField";
import { Profile } from "../../../../types/profile";

import {
  annualIncomeOptions,
  highestQualification,
  industryOptions,
  occupationOptions,
  studyFieldOptions,
} from "../form/profileOptions";

interface EducationCareerSectionProps {
  editable?: boolean;
  immutableFields?: (keyof Profile)[];
  confirmedImmutable?: (keyof Profile)[];
}

export const EducationCareerSection: React.FC<EducationCareerSectionProps> = ({
  editable = true,
  immutableFields,
  confirmedImmutable,
}) => {
  const { control } = useFormContext<Profile>();

  return (
    <FormSection
      title="Education & Career"
      icon={GraduationCap}
      editable={editable}
    >
      {/* Highest Qualification */}
      <Controller
        control={control}
        name="highestQualification"
        render={({ field: { onChange, value } }) => (
          <PickerField
            label="Highest Qualification"
            value={value}
            placeholder="Select your highest qualification"
            options={highestQualification}
            onSelect={onChange}
            editable={editable}
            icon={GraduationCap}
            locked={
              immutableFields?.includes("highestQualification") &&
              confirmedImmutable?.includes("highestQualification")
            }
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
            placeholder="Select your field of study"
            options={studyFieldOptions}
            onSelect={onChange}
            editable={editable}
            icon={GraduationCap}
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
            editable={editable}
            icon={Briefcase}
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
            placeholder="Select your industry"
            options={industryOptions}
            onSelect={onChange}
            editable={editable}
            icon={Briefcase}
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
            placeholder="Enter your job title"
            icon={Briefcase}
            editable={editable}
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
            placeholder="Enter your company name"
            icon={Building2}
            editable={editable}
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
            placeholder="Enter your work location"
            icon={Building2}
            editable={editable}
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
            placeholder="Select your annual income"
            options={annualIncomeOptions}
            onSelect={onChange}
            editable={editable}
            icon={Briefcase}
          />
        )}
      />
    </FormSection>
  );
};

export default EducationCareerSection;
