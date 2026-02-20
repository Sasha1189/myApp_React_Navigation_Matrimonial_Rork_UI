type DOBDisplayMode = "age" | "dob" | "both";
type DOBInput = string | Date | null | undefined;

export const formatDOB = (
  dobStr: DOBInput,
  mode: DOBDisplayMode = "both",
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

export const formatTime = (
  timestamp: number | string | Date | undefined,
): string => {
  if (!timestamp) return "";

  // 1. Convert any input (ISO, Number, Firestore Timestamp) to a Date object
  const date = new Date(
    typeof timestamp === "object" && "toMillis" in timestamp
      ? (timestamp as any).toMillis()
      : timestamp,
  );

  const now = new Date();

  // 🔹 Check if it's "Today"
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  // 🔹 Check if it's "Yesterday"
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  if (isYesterday) {
    return "Yesterday";
  }

  // 🔹 Otherwise, show the Date
  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};
