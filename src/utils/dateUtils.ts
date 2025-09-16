type DOBDisplayMode = "age" | "dob" | "both";
type DOBInput = string | Date | null | undefined;

export const formatDOB = (
  dobStr: DOBInput,
  mode: DOBDisplayMode = "both"
): string => {
  if (!dobStr) return "Not available";

  const dob = new Date(dobStr);
  if (isNaN(dob.getTime())) return "Not available";

  // Calculate age
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();

  const hasBirthdayPassedThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

  if (!hasBirthdayPassedThisYear) age--;

  const formattedDOB = dob.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  switch (mode) {
    case "age":
      return age >= 0 ? `${age}` : "Not available";
          // return age >= 0 ? `${age} years` : "Not available";
    case "dob":
      return formattedDOB;
    case "both":
    default:
      return age >= 0 ? `${age} years (${formattedDOB})` : formattedDOB;
  }
};

export const serializeDOB = (dob: Date | null): string | null => {
  if (!dob) return null;
  return dob.toISOString().split("T")[0]; // "2025-08-28"
};