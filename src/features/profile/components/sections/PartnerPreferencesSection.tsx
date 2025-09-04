import React from "react";
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
} from "../../../../constants/profileOptions";

interface Props {
  formData: Partial<Profile>;
  updateField: (field: keyof Profile, value: any) => void;
  editable?: boolean;
}

const PartnerPreferencesSection: React.FC<Props> = ({
  formData,
  updateField,
  editable = true,
}) => (
  <FormSection
    title="Partner Preferences"
    icon={HeartHandshake}
    editable={editable}
  >
    <PickerField
      label="Preferred Marital Status"
      value={formData.preferredMaritalStatus || ""}
      options={maritalStatusOptions}
      onSelect={(v) => updateField("preferredMaritalStatus", v)}
      editable={editable}
      icon={HeartHandshake}
    />
    <PickerField
      label="Preferred Education"
      value={formData.preferredEducation || ""}
      options={highestQualification}
      onSelect={(v) => updateField("preferredEducation", v)}
      editable={editable}
      icon={Ruler}
    />
    <PickerField
      label="Preferred Profession"
      value={formData.preferredProfession || ""}
      options={occupationOptions}
      onSelect={(v) => updateField("preferredProfession", v)}
      editable={editable}
      icon={Ruler}
    />
    <PickerField
      label="Preferred Income Range"
      value={formData.preferredIncomeRange || ""}
      options={incomeOptions}
      onSelect={(v) => updateField("preferredIncomeRange", v)}
      editable={editable}
      icon={Ruler}
    />
    <InputField
      label="Preferred Location"
      value={formData.locationPreference || ""}
      onChangeText={(t) => updateField("locationPreference", t)}
      placeholder="Enter preferred district"
      icon={MapPin}
      editable={editable}
    />

    <PickerField
      label="Living with Parents"
      value={formData.livingWithParents || ""}
      options={livingWithParentsOptions}
      onSelect={(v) => updateField("livingWithParents", v)}
      editable={editable}
      icon={Home}
    />
  </FormSection>
);

export default PartnerPreferencesSection;
