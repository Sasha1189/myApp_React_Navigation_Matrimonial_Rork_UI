import React from "react";
import FormSection from "../../../components/form/FormSection";
import InputField from "../../../components/form/InputField";
import { Phone, MapPin } from "lucide-react-native";
import { Profile } from "../../../types/profile";
import PickerField from "src/components/form/PickerField";
import {
  districtOptions,
  preferredContactOptions,
  profileCreatedByOptions,
} from "src/constants/profileOptions";

interface Props {
  formData: Partial<Profile>;
  updateField: (field: keyof Profile, value: any) => void;
  editable?: boolean;
}

const ContactDetailsSection: React.FC<Props> = ({
  formData,
  updateField,
  editable = true,
}) => (
  <FormSection title="Contact Details" icon={Phone} editable={editable}>
    <InputField
      label="Mobile Number"
      value={formData.mobileNumber || ""}
      onChangeText={(t) => updateField("mobileNumber", t)}
      placeholder="Enter your mobile number"
      keyboardType="phone-pad"
      icon={Phone}
      editable={editable}
    />
    <PickerField
      label="Current City"
      value={formData.currentCity || ""}
      options={districtOptions}
      onSelect={(v) => updateField("currentCity", v)}
      editable={editable}
      icon={MapPin}
    />
    <PickerField
      label="HomeTown"
      value={formData.nativePlace || ""}
      options={districtOptions}
      onSelect={(v) => updateField("nativePlace", v)}
      editable={editable}
      icon={MapPin}
    />
    <PickerField
      label="Preferred Contact"
      value={formData.preferredContact || ""}
      options={preferredContactOptions}
      onSelect={(v) => updateField("preferredContact", v)}
      editable={editable}
      icon={Phone}
    />

    <PickerField
      label="Profile Created By"
      value={formData.profileCreatedBy || ""}
      options={profileCreatedByOptions}
      onSelect={(v) => updateField("profileCreatedBy", v)}
      icon={Phone}
    />
  </FormSection>
);

export default ContactDetailsSection;
