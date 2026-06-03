/**
 * Recursively cleans an object by removing null, undefined,
 * empty strings, and whitespace-only values.
 */
export const sanitizePayload = (
  obj: Record<string, any>,
): Record<string, any> => {
  const sanitized: Record<string, any> = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    // 1. Skip completely missing variables
    if (value === null || value === undefined) return;

    // 2. Skip empty input fields or spacebar-only garbage entries
    if (typeof value === "string" && value.trim() === "") return;

    // 3. Optional: Deeply clean nested tracking sub-objects if any exist
    if (typeof value === "object" && !Array.isArray(value)) {
      const nested = sanitizePayload(value);
      if (Object.keys(nested).length > 0) {
        sanitized[key] = nested;
      }
      return;
    }

    // 4. Capture valid, active profile data properties
    sanitized[key] = value;
  });

  return sanitized;
};
