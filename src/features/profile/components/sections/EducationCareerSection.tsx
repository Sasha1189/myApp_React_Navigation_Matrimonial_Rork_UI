import React from "react";
import FormSection from "../form/FormSection";
import InputField from "../form/InputField";
import { GraduationCap, Briefcase, Building2 } from "lucide-react-native";
import { Profile } from "../../../../types/profile";
import { Picker } from "@react-native-picker/picker";
import PickerField from "src/features/profile/components/form/PickerField";
import {
  annualIncomeOptions,
  highestQualification,
  industryOptions,
  occupationOptions,
  studyFieldOptions,
} from "src/constants/profileOptions";

interface Props {
  formData: Partial<Profile>;
  updateField: (field: keyof Profile, value: any) => void;
  editable?: boolean;
}

const EducationCareerSection: React.FC<Props> = ({
  formData,
  updateField,
  editable = true,
}) => (
  <FormSection
    title="Education & Career"
    icon={GraduationCap}
    editable={editable}
  >
    <PickerField
      label="Highest Education"
      value={formData.highestQualification || ""}
      options={highestQualification || []}
      onSelect={(v) => updateField("highestQualification", v)}
      editable={editable}
      icon={GraduationCap}
    />
    <PickerField
      label="Field of Study"
      value={formData.fieldOfStudy || ""}
      options={studyFieldOptions || []}
      onSelect={(v) => updateField("fieldOfStudy", v)}
      editable={editable}
      icon={GraduationCap}
    />
    {/* Occupation */}
    <PickerField
      label="Current Occupation"
      value={formData.occupation || ""}
      options={occupationOptions || []}
      onSelect={(v) => updateField("occupation", v)}
      editable={editable}
      icon={Briefcase}
    />
    {/* industry */}
    <PickerField
      label="Industry"
      value={formData.industry || ""}
      options={industryOptions || []}
      onSelect={(v) => updateField("industry", v)}
      editable={editable}
      icon={Briefcase}
    />
    {/* jobTitle */}
    <InputField
      label="Job Title"
      value={formData.jobTitle || ""}
      onChangeText={(t) => updateField("jobTitle", t)}
      placeholder="Enter your job title"
      icon={Briefcase}
      editable={editable}
    />
    <InputField
      label="Company Name"
      value={formData.companyName || ""}
      onChangeText={(t) => updateField("companyName", t)}
      placeholder="Enter your company name"
      icon={Building2}
      editable={editable}
    />
    {/* workLocation */}
    <InputField
      label="Work Location"
      value={formData.workLocation || ""}
      onChangeText={(t) => updateField("workLocation", t)}
      placeholder="Enter your work location"
      icon={Building2}
      editable={editable}
    />
    {/* annualIncome */}
    <PickerField
      label="Annual Income"
      value={formData.annualIncome || ""}
      options={annualIncomeOptions || []}
      onSelect={(v) => updateField("annualIncome", v)}
      editable={editable}
      icon={Briefcase}
    />
  </FormSection>
);

export default EducationCareerSection;
