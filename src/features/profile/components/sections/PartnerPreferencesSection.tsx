import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import FormSection from "../form/FormSection";
import InputField from "../form/InputField";
import PickerField from "../form/PickerField";
import { HeartHandshake, Ruler, MapPin, Home } from "lucide-react-native";
import { Profile } from "../../../../types/profile";
import {
  maritalStatusOptions,
  highestQualification,
  occupationOptions,
  incomeOptions,
  livingWithParentsOptions,
} from "../form/profileOptions";

interface PartnerPreferencesSectionProps {
  editable?: boolean;
}

export const PartnerPreferencesSection: React.FC<
  PartnerPreferencesSectionProps
> = ({ editable = true }) => {
  const { control } = useFormContext<Profile>();

  return (
    <FormSection
      title="Partner Preferences"
      icon={HeartHandshake}
      editable={editable}
    >
      {/* Preferred Marital Status */}
      <Controller
        control={control}
        name="preferredMaritalStatus"
        render={({ field: { onChange, value } }) => (
          <PickerField
            label="Preferred Marital Status"
            value={value}
            placeholder="Select Marital Status"
            options={maritalStatusOptions}
            onSelect={onChange}
            editable={editable}
            icon={HeartHandshake}
          />
        )}
      />

      {/* Preferred Education */}
      <Controller
        control={control}
        name="preferredEducation"
        render={({ field: { onChange, value } }) => (
          <PickerField
            label="Preferred Education"
            value={value}
            placeholder="Select Education Level"
            options={highestQualification}
            onSelect={onChange}
            editable={editable}
            icon={Ruler}
          />
        )}
      />

      {/* Preferred Profession */}
      <Controller
        control={control}
        name="preferredProfession"
        render={({ field: { onChange, value } }) => (
          <PickerField
            label="Preferred Profession"
            value={value}
            placeholder="Select Profession"
            options={occupationOptions}
            onSelect={onChange}
            editable={editable}
            icon={Ruler}
          />
        )}
      />

      {/* Preferred Income Range */}
      <Controller
        control={control}
        name="preferredIncomeRange"
        render={({ field: { onChange, value } }) => (
          <PickerField
            label="Preferred Income Range"
            value={value}
            placeholder="Select Income Range"
            options={incomeOptions}
            onSelect={onChange}
            editable={editable}
            icon={Ruler}
          />
        )}
      />

      {/* Preferred Location */}
      <Controller
        control={control}
        name="locationPreference"
        render={({ field: { onChange, value } }) => (
          <InputField
            label="Preferred Location"
            value={value || ""}
            onChangeText={onChange}
            placeholder="Enter preferred district"
            icon={MapPin}
            editable={editable}
          />
        )}
      />

      {/* Living with Parents */}
      <Controller
        control={control}
        name="livingWithParents"
        render={({ field: { onChange, value } }) => (
          <PickerField
            label="Living with Parents"
            value={value}
            placeholder="Select Option"
            options={livingWithParentsOptions}
            onSelect={onChange}
            editable={editable}
            icon={Home}
          />
        )}
      />
    </FormSection>
  );
};

export default PartnerPreferencesSection;
