import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Users, User } from "lucide-react-native";

import FormSection from "../form/FormSection";
import InputField from "../form/InputField";
import { Profile } from "../../../../types/profile";

interface FamilyDetailsSectionProps {
  editable?: boolean;
  immutableFields?: (keyof Profile)[];
  confirmedImmutable?: (keyof Profile)[];
}

export const FamilyDetailsSection: React.FC<FamilyDetailsSectionProps> = ({
  editable = true,
  immutableFields,
  confirmedImmutable,
}) => {
  const { control } = useFormContext<Profile>();

  return (
    <FormSection title="Family Details" icon={Users} editable={editable}>
      {/* Father's Occupation */}
      <Controller
        control={control}
        name="fatherOccupation"
        render={({ field: { onChange, value } }) => (
          <InputField
            label="Father's Occupation"
            value={value ?? ""}
            onChangeText={onChange}
            placeholder="e.g., Farmer"
            icon={User}
            editable={editable}
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
            placeholder="e.g., Homemaker"
            icon={User}
            editable={editable}
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
            value={value?.toString() ?? "0"}
            onChangeText={(t) => onChange(parseInt(t) || 0)}
            placeholder="e.g., 2"
            icon={Users}
            editable={editable}
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
            value={value?.toString() ?? "0"}
            onChangeText={(t) => onChange(parseInt(t) || 0)}
            placeholder="e.g., 1"
            icon={Users}
            editable={editable}
          />
        )}
      />

      {/* Siblings' Details */}
      <Controller
        control={control}
        name="siblingsDetails"
        render={({ field: { onChange, value } }) => (
          <InputField
            label="Siblings' Details"
            value={value ?? ""}
            onChangeText={onChange}
            placeholder="e.g., Elder brother married, working in TCS"
            multiline
            icon={Users}
            editable={editable}
          />
        )}
      />
    </FormSection>
  );
};

export default FamilyDetailsSection;
