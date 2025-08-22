import React from "react";
import FormSection from "../../../components/form/FormSection";
import InputField from "../../../components/form/InputField";
import { Users, User } from "lucide-react-native";
import { Profile } from "../../../types/profile";

interface Props {
  formData: Partial<Profile>;
  updateField: (field: keyof Profile, value: any) => void;
  editable?: boolean;
}

const FamilyDetailsSection: React.FC<Props> = ({
  formData,
  updateField,
  editable = true,
}) => (
  <FormSection title="Family Details" icon={Users} editable={editable}>
    <InputField
      label="Father's Occupation"
      value={formData.fatherOccupation || ""}
      onChangeText={(t) => updateField("fatherOccupation", t)}
      placeholder="e.g., Farmer"
      icon={User}
      editable={editable}
    />

    <InputField
      label="Mother's Occupation"
      value={formData.motherOccupation || ""}
      onChangeText={(t) => updateField("motherOccupation", t)}
      placeholder="e.g., Homemaker"
      icon={User}
      editable={editable}
    />

    <InputField
      label="Number of Brothers"
      value={formData.numberOfBrothers?.toString() || "0"}
      onChangeText={(t) => updateField("numberOfBrothers", parseInt(t) || 0)}
      placeholder="e.g., 2"
      icon={Users}
      editable={editable}
    />

    <InputField
      label="Number of Sisters"
      value={formData.numberOfSisters?.toString() || "0"}
      onChangeText={(t) => updateField("numberOfSisters", parseInt(t) || 0)}
      placeholder="e.g., 1"
      icon={Users}
      editable={editable}
    />

    <InputField
      label="Siblings' Details"
      value={formData.siblingsDetails || ""}
      onChangeText={(t) => updateField("siblingsDetails", t)}
      placeholder="e.g., Elder brother married, working in TCS"
      multiline
      icon={Users}
      editable={editable}
    />
  </FormSection>
);

export default FamilyDetailsSection;
