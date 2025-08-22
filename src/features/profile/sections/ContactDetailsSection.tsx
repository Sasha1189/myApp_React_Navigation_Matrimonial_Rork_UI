import React from "react";
import FormSection from "../../../components/form/FormSection";
import InputField from "../../../components/form/InputField";
import { Phone, Mail, MapPin } from "lucide-react-native";
import { Profile } from "../../../types/profile";

interface Props {
  formData: Partial<Profile>;
  updateField: (field: keyof Profile, value: any) => void;
}

const ContactDetailsSection: React.FC<Props> = ({ formData, updateField }) => (
  <FormSection title="Contact Details" icon={Phone}>
    <InputField
      label="Mobile Number"
      value={formData.mobileNumber || ""}
      onChangeText={(t) => updateField("mobileNumber", t)}
      placeholder="Enter your mobile number"
      keyboardType="phone-pad"
      icon={Phone}
    />
    <InputField
      label="Email Address"
      value={formData.emailAddress || ""}
      onChangeText={(t) => updateField("emailAddress", t)}
      placeholder="Enter your email"
      keyboardType="email-address"
      icon={Mail}
    />
    <InputField
      label="Address"
      value={formData.address || ""}
      onChangeText={(t) => updateField("address", t)}
      placeholder="Enter your address"
      multiline
      icon={MapPin}
    />
  </FormSection>
);

export default ContactDetailsSection;
