import React from "react";
import FormSection from "../../../components/form/FormSection";
import InputField from "../../../components/form/InputField";
import { FileText } from "lucide-react-native";
import { Profile } from "../../../types/profile";

interface Props {
  formData: Partial<Profile>;
  updateField: (field: keyof Profile, value: any) => void;
}

const AboutMeSection: React.FC<Props> = ({ formData, updateField }) => (
  <FormSection title="About Me" icon={FileText}>
    <InputField
      label="About Me"
      value={formData.aboutMe || ""}
      onChangeText={(t) => updateField("aboutMe", t)}
      placeholder="Write a short description about yourself"
      multiline
    />
  </FormSection>
);

export default AboutMeSection;
