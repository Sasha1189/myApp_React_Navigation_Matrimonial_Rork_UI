import React from "react";
import FormSection from "../../../components/form/FormSection";
import InputField from "../../../components/form/InputField";
import PickerField from "../../../components/form/PickerField";
import { HeartHandshake, Ruler, MapPin, User } from "lucide-react-native";
import { Profile } from "../../../types/profile";
import {
  genderOptions,
  maritalStatusOptions,
  dietOptions,
} from "../../../constants/profileOptions";

interface Props {
  formData: Partial<Profile>;
  updateField: (field: keyof Profile, value: any) => void;
}

const PartnerPreferencesSection: React.FC<Props> = ({
  formData,
  updateField,
}) => (
  <FormSection title="Partner Preferences" icon={HeartHandshake}>
    <PickerField
      label="Preferred Gender"
      value={formData.partnerGender || ""}
      options={genderOptions}
      onSelect={(v) => updateField("partnerGender", v)}
      icon={User}
    />
    <InputField
      label="Preferred Age Range"
      value={formData.partnerAgeRange || ""}
      onChangeText={(t) => updateField("partnerAgeRange", t)}
      placeholder="e.g., 25 - 30"
      icon={Ruler}
    />
    <PickerField
      label="Preferred Marital Status"
      value={formData.partnerMaritalStatus || ""}
      options={maritalStatusOptions}
      onSelect={(v) => updateField("partnerMaritalStatus", v)}
      icon={HeartHandshake}
    />
    <PickerField
      label="Preferred Diet"
      value={formData.partnerDiet || ""}
      options={dietOptions}
      onSelect={(v) => updateField("partnerDiet", v)}
      icon={HeartHandshake}
    />
    <InputField
      label="Preferred Location"
      value={formData.partnerLocation || ""}
      onChangeText={(t) => updateField("partnerLocation", t)}
      placeholder="Enter preferred location"
      icon={MapPin}
    />
  </FormSection>
);

export default PartnerPreferencesSection;
