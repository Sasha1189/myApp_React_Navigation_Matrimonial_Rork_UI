export function isDeepEqual(a: any, b: any): boolean {
  // Normalize empty strings, null, and undefined to match your sanitization rules
  const valA = a === "" ? null : a;
  const valB = b === "" ? null : b;

  if (valA === valB) return true;

  // Handle null/undefined after normalization
  if (valA == null || valB == null) return valA === valB;

  // Handle Date instances
  if (valA instanceof Date && valB instanceof Date) {
    return valA.getTime() === valB.getTime();
  }

  // Handle Arrays
  if (Array.isArray(valA) && Array.isArray(valB)) {
    return (
      valA.length === valB.length &&
      valA.every((val, i) => isDeepEqual(val, valB[i]))
    );
  }

  // Handle Objects
  if (typeof valA === "object" && typeof valB === "object") {
    const aKeys = Object.keys(valA);
    const bKeys = Object.keys(valB);
    if (aKeys.length !== bKeys.length) return false;

    return aKeys.every((key) => isDeepEqual(valA[key], valB[key]));
  }

  return false;
}
