import { useEffect, useRef, useState } from "react";
import { Alert, ScrollView } from "react-native";
import { Profile } from "../../../types/profile";
import { getConfirmedImmutable, immutableFields, validateProfileForm } from "../../../utils/profileValidation";

export function useProfileForm(profile: Profile | null, isEditing: boolean) {
  const [formData, setFormData] = useState<Partial<Profile>>(profile || {});
  const [confirmedImmutable, setConfirmedImmutable] = useState<(keyof Profile)[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof Profile, string>>>({});
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    if (profile && !isEditing) {
      setFormData(profile);
      setConfirmedImmutable(getConfirmedImmutable(profile));
    }
  }, [profile, isEditing]);

  const updateField = (field: keyof Profile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateForm = (): boolean => {
    const { valid, errors } = validateProfileForm(formData);
    if (!valid) {
      setFieldErrors(errors);
      const firstErrorField = Object.keys(errors)[0] as keyof Profile;
      Alert.alert("Incomplete Form", errors[firstErrorField] || "Please fix errors before saving.");
    }
    return valid;
  };

  return {
    formData,
    setFormData,
    confirmedImmutable,
    fieldErrors,
    setFieldErrors,
    updateField,
    validateForm,
    scrollRef,
  };
}
