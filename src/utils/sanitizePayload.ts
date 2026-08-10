export const sanitizePayload = (
  obj: Record<string, any>,
): Record<string, any> => {
  const sanitized: Record<string, any> = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    // 1. Skip completely missing variables
    if (value === null || value === undefined) return;

    // 2. Skip empty input fields or whitespace entries
    // 🎯 UPDATED SAVING RULE: Because nb and ns now use "" for empty states,
    // this rule will automatically and safely strip them out when empty so they don't bloat the DB!
    if (typeof value === "string" && value.trim() === "") return;

    // 3. Skip unselected/blank numeric enum indexes (0)
    // 🎯 CLEANED UP: Removed the manual "nb" and "ns" exceptions since
    // they no longer use 0 as an empty default state! Valid '0' counts will now pass cleanly.
    if (typeof value === "number" && value === 0) return;

    // 4. Deeply clean nested tracking sub-objects or arrays if any exist
    if (typeof value === "object" && !Array.isArray(value)) {
      const nested = sanitizePayload(value);
      if (Object.keys(nested).length > 0) {
        sanitized[key] = nested;
      }
      return;
    }

    // 5. Capture valid, active profile data properties
    sanitized[key] = value;
  });

  return sanitized;
};

/**
 * Recursively cleans an object by removing null, undefined,
 * empty strings, and whitespace-only values.
 */
// export const sanitizePayload = (
//   obj: Record<string, any>,
// ): Record<string, any> => {
//   const sanitized: Record<string, any> = {};

//   Object.keys(obj).forEach((key) => {
//     const value = obj[key];

//     // 1. Skip completely missing variables
//     if (value === null || value === undefined) return;

//     // 2. Skip empty input fields or spacebar-only garbage entries
//     if (typeof value === "string" && value.trim() === "") return;

//     // 3. NEW: Skip unselected/blank numeric enum indexes (0)
//     // Avoid skipping numerical counters like numberOfBrothers (nb) or sisters (ns) if they are 0
//     if (
//       typeof value === "number" &&
//       value === 0 &&
//       key !== "nb" &&
//       key !== "ns"
//     )
//       return;

//     // 4. Deeply clean nested tracking sub-objects or arrays if any exist
//     if (typeof value === "object" && !Array.isArray(value)) {
//       const nested = sanitizePayload(value);
//       if (Object.keys(nested).length > 0) {
//         sanitized[key] = nested;
//       }
//       return;
//     }

//     // 5. Capture valid, active profile data properties
//     sanitized[key] = value;
//   });

//   return sanitized;
// };
