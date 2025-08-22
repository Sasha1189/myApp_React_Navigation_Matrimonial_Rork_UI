import React from "react";
import FormSection from "../../../components/form/FormSection";
import InputField from "../../../components/form/InputField";
import { GraduationCap, Briefcase, Building2 } from "lucide-react-native";
import { Profile } from "../../../types/profile";

interface Props {
  formData: Partial<Profile>;
  updateField: (field: keyof Profile, value: any) => void;
}

const EducationCareerSection: React.FC<Props> = ({ formData, updateField }) => (
  <FormSection title="Education & Career" icon={GraduationCap}>
    <InputField
      label="Education"
      value={formData.education || ""}
      onChangeText={(t) => updateField("education", t)}
      placeholder="Enter your highest education"
      icon={GraduationCap}
    />
    <InputField
      label="Occupation"
      value={formData.occupation || ""}
      onChangeText={(t) => updateField("occupation", t)}
      placeholder="Enter your occupation"
      icon={Briefcase}
    />
    <InputField
      label="Company"
      value={formData.company || ""}
      onChangeText={(t) => updateField("company", t)}
      placeholder="Enter your company name"
      icon={Building2}
    />
  </FormSection>
);

export default EducationCareerSection;
