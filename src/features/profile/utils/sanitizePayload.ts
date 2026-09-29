import { LOOKUPS } from "@/features/utils/profileLookups";

/**
 * Recursively cleans an object by removing null, undefined,
 * empty strings, whitespace-only values, empty arrays, and 0-index lookup options.
 */
export const sanitizePayload = <T extends Record<string, any>>(
  obj: T,
): Partial<T> => {
  const sanitized: Record<string, any> = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    // 1. Skip completely missing variables
    if (value === null || value === undefined) return;

    // 2. Skip empty input fields or spacebar-only garbage entries
    if (typeof value === "string" && value.trim() === "") return;

    // 3. Skip lookup enum index 0 (unselected "")
    if (key in LOOKUPS && (value === 0 || value === "0")) return;

    // 4. Handle Arrays correctly (preserve array structure)
    if (Array.isArray(value)) {
      if (value.length === 0) return;

      const cleanedArray = value
        .map((item) =>
          typeof item === "object" && item !== null
            ? sanitizePayload(item)
            : item,
        )
        .filter((item) => item !== null && item !== undefined);

      if (cleanedArray.length > 0) {
        sanitized[key] = cleanedArray;
      }
      return;
    }

    // 5. Deeply clean nested tracking sub-objects (EXCLUDING arrays)
    if (typeof value === "object") {
      const nested = sanitizePayload(value);
      if (Object.keys(nested).length > 0) {
        sanitized[key] = nested;
      }
      return;
    }

    // 6. Capture valid properties
    sanitized[key] = value;
  });

  return sanitized as Partial<T>;
};
