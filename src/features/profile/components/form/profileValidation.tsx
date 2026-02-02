import { Profile } from "../../../../types/profile";

export const requiredFields: (keyof Profile)[] = [
  "fullName",
  "dateOfBirth",
  "gender",
  "maritalStatus",
];
export const immutableFields: (keyof Profile)[] = [...requiredFields];

export const isFieldLocked = (
  profile: Profile | undefined,
  fieldName: keyof Profile,
) => {
  if (!profile || !immutableFields.includes(fieldName)) return false;
  const value = profile[fieldName];
  return value !== null && value !== undefined && String(value).trim() !== "";
};
