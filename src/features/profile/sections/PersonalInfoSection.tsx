import React from "react";
import FormSection from "../../../components/form/FormSection";
import InputField from "../../../components/form/InputField";
import PickerField from "../../../components/form/PickerField";
import {
  User,
  UserCheck,
  Timer,
  MapPin,
  HeartHandshake,
  Ruler,
  Scale,
  Activity,
  Droplets,
  Sparkles,
  Star,
  Zap,
} from "lucide-react-native";
import { Profile } from "../../../types/profile";
import {
  genderOptions,
  maritalStatusOptions,
  bodyTypeOptions,
  bloodGroupOptions,
  manglikOptions,
  rashiOptions,
  horoscopeOptions,
} from "../../../constants/profileOptions";

interface Props {
  formData: Partial<Profile>;
  updateField: (field: keyof Profile, value: any) => void;
}

const PersonalInfoSection: React.FC<Props> = ({ formData, updateField }) => (
  <FormSection title="Personal & Birth Information" icon={User}>
    <InputField
      label="Full Name"
      value={formData.fullName || ""}
      onChangeText={(t) => updateField("fullName", t)}
      placeholder="Enter your full name"
      icon={UserCheck}
    />
    <InputField
      label="Time of Birth"
      value={formData.timeOfBirth || ""}
      onChangeText={(t) => updateField("timeOfBirth", t)}
      placeholder="e.g., 10:30 AM"
      icon={Timer}
    />
    <InputField
      label="Place of Birth"
      value={formData.placeOfBirth || ""}
      onChangeText={(t) => updateField("placeOfBirth", t)}
      placeholder="Enter place of birth"
      icon={MapPin}
    />
    <PickerField
      label="Gender"
      value={formData.gender || ""}
      options={genderOptions}
      onSelect={(v) => updateField("gender", v)}
      icon={User}
    />
    <PickerField
      label="Marital Status"
      value={formData.maritalStatus || ""}
      options={maritalStatusOptions}
      onSelect={(v) => updateField("maritalStatus", v)}
      icon={HeartHandshake}
    />
    <InputField
      label="Height"
      value={formData.height || ""}
      onChangeText={(t) => updateField("height", t)}
      placeholder="e.g., 5'6''"
      icon={Ruler}
    />
    <InputField
      label="Weight"
      value={formData.weight || ""}
      onChangeText={(t) => updateField("weight", t)}
      placeholder="e.g., 65 kg"
      icon={Scale}
    />
    <PickerField
      label="Body Type"
      value={formData.bodyType || ""}
      options={bodyTypeOptions}
      onSelect={(v) => updateField("bodyType", v)}
      icon={Activity}
    />
    <PickerField
      label="Blood Group"
      value={formData.bloodGroup || ""}
      options={bloodGroupOptions}
      onSelect={(v) => updateField("bloodGroup", v)}
      icon={Droplets}
    />
    <PickerField
      label="Manglik Status"
      value={formData.manglikStatus || ""}
      options={manglikOptions}
      onSelect={(v) => updateField("manglikStatus", v)}
      icon={Sparkles}
    />
    <PickerField
      label="Rashi (Zodiac)"
      value={formData.rashi || ""}
      options={rashiOptions}
      onSelect={(v) => updateField("rashi", v)}
      icon={Star}
    />
    <PickerField
      label="Horoscope Required?"
      value={formData.horoscopeRequired || ""}
      options={horoscopeOptions}
      onSelect={(v) => updateField("horoscopeRequired", v)}
      icon={Zap}
    />
  </FormSection>
);

export default PersonalInfoSection;
