import React from "react";
import FormSection from "../../../components/form/FormSection";
import InputField from "../../../components/form/InputField";
import { Users, User } from "lucide-react-native";
import { Profile } from "../../../types/profile";

interface Props {
  formData: Partial<Profile>;
  updateField: (field: keyof Profile, value: any) => void;
}

const FamilyDetailsSection: React.FC<Props> = ({ formData, updateField }) => (
  <FormSection title="Family Details" icon={Users}>
    <InputField
      label="Father's Name"
      value={formData.fatherName || ""}
      onChangeText={(t) => updateField("fatherName", t)}
      placeholder="Enter father's name"
      icon={User}
    />
    <InputField
      label="Mother's Name"
      value={formData.motherName || ""}
      onChangeText={(t) => updateField("motherName", t)}
      placeholder="Enter mother's name"
      icon={User}
    />
    <InputField
      label="Siblings"
      value={formData.siblings || ""}
      onChangeText={(t) => updateField("siblings", t)}
      placeholder="e.g., 1 brother, 2 sisters"
      icon={Users}
    />
  </FormSection>
);

export default FamilyDetailsSection;
