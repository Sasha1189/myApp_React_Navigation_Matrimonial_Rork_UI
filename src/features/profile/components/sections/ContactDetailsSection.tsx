import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Phone, MapPin, UserPlus } from "lucide-react-native";

import FormSection from "../form/FormSection";
import InputField from "../form/InputField";
import PickerField from "../form/PickerField";
import { Profile } from "../../../../types/profile";

import {
  districtOptions,
  preferredContactOptions,
  profileCreatedByOptions,
} from "../form/profileOptions";

interface ContactDetailsSectionProps {
  editable?: boolean;
  immutableFields?: (keyof Profile)[];
  confirmedImmutable?: (keyof Profile)[];
}

export const ContactDetailsSection: React.FC<ContactDetailsSectionProps> = ({
  editable = true,
  immutableFields,
  confirmedImmutable,
}) => {
  const { control } = useFormContext<Profile>();

  return (
    <FormSection title="Contact Details" icon={Phone} editable={editable}>
      {/* Mobile Number */}
      <Controller
        control={control}
        name="mobileNumber"
        render={({ field: { onChange, value } }) => (
          <InputField
            label="Mobile Number"
            value={value}
            onChangeText={onChange}
            placeholder="Enter your mobile number"
            keyboardType="phone-pad"
            icon={Phone}
            editable={editable}
            locked={
              immutableFields?.includes("mobileNumber") &&
              confirmedImmutable?.includes("mobileNumber")
            }
          />
        )}
      />

      {/* Current City */}
      <Controller
        control={control}
        name="currentCity"
        render={({ field: { onChange, value } }) => (
          <PickerField
            label="Current City"
            value={value}
            placeholder="Select your current city"
            options={districtOptions}
            onSelect={onChange}
            editable={editable}
            icon={MapPin}
          />
        )}
      />

      {/* Hometown */}
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
            editable={editable}
            icon={MapPin}
          />
        )}
      />

      {/* Preferred Contact */}
      <Controller
        control={control}
        name="preferredContact"
        render={({ field: { onChange, value } }) => (
          <PickerField
            label="Preferred Contact"
            value={value}
            placeholder="Select preferred contact method"
            options={preferredContactOptions}
            onSelect={onChange}
            editable={editable}
            icon={Phone}
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
            placeholder="Select who created the profile"
            options={profileCreatedByOptions}
            onSelect={onChange}
            editable={editable}
            icon={UserPlus}
          />
        )}
      />
    </FormSection>
  );
};

export default ContactDetailsSection;
