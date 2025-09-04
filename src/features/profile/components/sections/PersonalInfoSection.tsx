import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import FormSection from "../form/FormSection";
import InputField from "../form/InputField";
import PickerField from "../form/PickerField";
import RadioField from "../form/RadioField";
import {
  User,
  Calendar,
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
import { Profile } from "../../../../types/profile";
import { theme } from "../../../../constants/theme";
import {
  genderOptions,
  maritalStatusOptions,
  bodyTypeOptions,
  bloodGroupOptions,
  manglikOptions,
  rashiOptions,
  horoscopeOptions,
} from "../../../../constants/profileOptions";
import DateTimePicker from "@react-native-community/datetimepicker";
import DatePickerField, { TimePickerField } from "../form/DateTimePickers";

interface Props {
  formData: Partial<Profile>;
  updateField: (k: keyof Profile, v: any) => void;
  editable?: boolean;
  requiredFields?: (keyof Profile)[];
  immutableFields?: (keyof Profile)[];
  confirmedImmutable?: (keyof Profile)[];
  fieldErrors?: Partial<Record<keyof Profile, string>>;
}

// Date/time pickers moved to shared component DatePickerField and TimePickerField

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginBottom: 4,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: "500",
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    backgroundColor: "white",
    marginTop: 6,
  },
});

const PersonalInfoSection: React.FC<Props> = ({
  formData,
  updateField,
  editable = true,
  requiredFields = [],
  immutableFields = [],
  confirmedImmutable,
  fieldErrors,
}) => {
  const isRequired = (k: keyof Profile) => requiredFields.includes(k);
  const isLocked = (k: keyof Profile) => {
    if (!immutableFields.includes(k)) return false;
    // If caller provided confirmedImmutable (even if empty), rely on it solely.
    if (confirmedImmutable !== undefined) {
      return confirmedImmutable.includes(k);
    }
    // Backwards-compatible fallback when parent does not provide confirmedImmutable:
    const val = formData[k];
    return val != null && !(typeof val === "string" && val.trim() === "");
  };
  const getError = (k: keyof Profile) => fieldErrors?.[k] ?? null;

  return (
    <FormSection
      title="Personal & Birth Information"
      icon={User}
      editable={editable}
    >
      <InputField
        label="Full Name"
        value={formData.fullName || ""}
        onChangeText={(t) => updateField("fullName", t)}
        placeholder="Enter your full name"
        icon={UserCheck}
        editable={editable}
        required={isRequired("fullName")}
        locked={isLocked("fullName")}
      />

      <DatePickerField
        label="Date of Birth"
        value={formData.dateOfBirth ?? undefined}
        onChange={(d) => updateField("dateOfBirth", d)}
        editable={editable}
        icon={Calendar}
        locked={isLocked("dateOfBirth")}
      />

      <TimePickerField
        label="Time of Birth"
        value={formData.timeOfBirth ?? undefined}
        onChange={(t) => updateField("timeOfBirth", t)}
        editable={editable}
        icon={Timer}
      />

      <InputField
        label="Place of Birth"
        value={formData.placeOfBirth || ""}
        onChangeText={(t) => updateField("placeOfBirth", t)}
        placeholder="Enter place of birth"
        icon={MapPin}
        editable={editable}
      />

      {/* For small fixed option sets (gender) we use radio buttons so user must explicitly select. */}
      <RadioField
        label="Gender"
        value={String(formData.gender || "")}
        options={genderOptions}
        onSelect={(v) => updateField("gender", v)}
        editable={editable}
        icon={User}
        required={isRequired("gender")}
        locked={isLocked("gender")}
        error={getError("gender")}
      />

      <PickerField
        label="Marital Status"
        value={formData.maritalStatus || ""}
        options={maritalStatusOptions}
        onSelect={(v) => updateField("maritalStatus", v)}
        editable={editable}
        icon={HeartHandshake}
        required={isRequired("maritalStatus")}
        locked={isLocked("maritalStatus")}
      />

      <InputField
        label="Height"
        value={formData.height || ""}
        onChangeText={(t) => updateField("height", t)}
        placeholder="e.g., 5'6''"
        icon={Ruler}
        editable={editable}
      />

      <InputField
        label="Weight"
        value={formData.weight || ""}
        onChangeText={(t) => updateField("weight", t)}
        placeholder="e.g., 65 kg"
        icon={Scale}
        editable={editable}
      />

      <PickerField
        label="Body Type"
        value={formData.bodyType || ""}
        options={bodyTypeOptions}
        onSelect={(v) => updateField("bodyType", v)}
        editable={editable}
        icon={Activity}
      />

      <PickerField
        label="Blood Group"
        value={formData.bloodGroup || ""}
        options={bloodGroupOptions}
        onSelect={(v) => updateField("bloodGroup", v)}
        editable={editable}
        icon={Droplets}
        required={isRequired("bloodGroup")}
        locked={isLocked("bloodGroup")}
      />

      <PickerField
        label="Manglik Status"
        value={formData.manglikStatus || ""}
        options={manglikOptions}
        onSelect={(v) => updateField("manglikStatus", v)}
        editable={editable}
        icon={Sparkles}
      />

      <PickerField
        label="Rashi (Zodiac)"
        value={formData.rashi || ""}
        options={rashiOptions}
        onSelect={(v) => updateField("rashi", v)}
        editable={editable}
        icon={Star}
      />

      <PickerField
        label="Horoscope Required?"
        value={formData.horoscopeRequired || ""}
        options={horoscopeOptions}
        onSelect={(v) => updateField("horoscopeRequired", v)}
        editable={editable}
        icon={Zap}
      />
    </FormSection>
  );
};

export default PersonalInfoSection;
