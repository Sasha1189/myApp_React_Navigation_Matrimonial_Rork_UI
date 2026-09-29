export type DOBDisplayMode = "age" | "dob" | "both" | "form" | "tob";
export type DOBInput = number | string | Date | null | undefined;

export const formatDOB = (
  dobInput: DOBInput,
  mode: DOBDisplayMode = "both",
): string => {
  if (dobInput === null || dobInput === undefined || dobInput === "") return "";

  let dob: Date;

  // 1. Convert input (number timestamp, string, or Date) to a JS Date instance
  if (dobInput instanceof Date) {
    dob = dobInput;
  } else if (typeof dobInput === "number") {
    dob = new Date(dobInput);
  } else if (typeof dobInput === "string") {
    const trimmed = dobInput.trim();
    if (!trimmed) return "";

    // Check if the string is a stringified timestamp (e.g. "1700000000000")
    const numericVal = Number(trimmed);
    dob = !isNaN(numericVal) ? new Date(numericVal) : new Date(trimmed);
  } else {
    return "";
  }

  // Validate Date instance
  if (isNaN(dob.getTime())) return "";

  // 2. Time Mode ("tob") -> "05:20 AM"
  if (mode === "tob") {
    const hours = dob.getHours();
    const minutes = dob.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const h = hours % 12 === 0 ? 12 : hours % 12;
    return `${h}:${String(minutes).padStart(2, "0")} ${ampm}`;
  }

  // 3. Calculate Age
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();

  const hasBirthdayPassedThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

  if (!hasBirthdayPassedThisYear) age--;

  // 4. Formats
  const yyyy = dob.getFullYear();
  const mm = String(dob.getMonth() + 1).padStart(2, "0");
  const dd = String(dob.getDate()).padStart(2, "0");
  const rawFormSafeDate = `${yyyy}-${mm}-${dd}`;

  const formattedDOB = dob.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  switch (mode) {
    case "form":
      return rawFormSafeDate;
    case "age":
      return age >= 0 ? `${age}` : "";
    case "dob":
      return formattedDOB;
    case "both":
    default:
      return age >= 0 ? `${formattedDOB},(${age}y)` : formattedDOB;
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

export const formatStatusTime = (timestamp: number | any): string => {
  if (!timestamp) return "";

  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const date = new Date(timestamp);
  const isToday = new Date().toDateString() === date.toDateString();

  if (isToday) {
    return `today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  // --- ADDED YESTERDAY LOGIC HERE ---
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = yesterday.toDateString() === date.toDateString();

  if (isYesterday) {
    return `yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  // ----------------------------------

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};
