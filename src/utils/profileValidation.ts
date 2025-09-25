import { Profile } from "../types/profile";

// 🔹 Fields that must be present
export const requiredFields: (keyof Profile)[] = [
  "fullName",
  "dateOfBirth",
  "gender",
  "maritalStatus",
];

// 🔹 Fields that become immutable once set
export const immutableFields: (keyof Profile)[] = [...requiredFields];

export function getConfirmedImmutable(profile: Profile): (keyof Profile)[] {
  return requiredFields.filter((k) => {
    const v = (profile as any)[k];
    if (v === null || v === undefined) return false;
    if (typeof v === "string" && v.trim() === "") return false;
    return true;
  });
}

export function validateProfileForm(
  formData: Partial<Profile>
): { valid: boolean; errors: Partial<Record<keyof Profile, string>> } {
  const errors: Partial<Record<keyof Profile, string>> = {};

  // Required fields
  requiredFields.forEach((key) => {
    const val = formData[key];
    if (val === null || val === undefined || (typeof val === "string" && val.trim() === "")) {
      errors[key] = "This field is required.";
    }
  });

  // Special gender check
  if (!formData.gender || (typeof formData.gender === "string" && formData.gender.trim() === "")) {
    errors.gender = "Please select your gender.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}