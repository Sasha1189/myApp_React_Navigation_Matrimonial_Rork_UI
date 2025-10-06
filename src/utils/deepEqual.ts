export function isDeepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  // handle null/undefined
  if (a == null || b == null) return a === b;

  // handle Date
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // handle Array
  if (Array.isArray(a) && Array.isArray(b)) {
    return (
      a.length === b.length && a.every((val, i) => isDeepEqual(val, b[i]))
    );
  }

  // handle Object
  if (typeof a === "object" && typeof b === "object") {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;

    return aKeys.every((key) => isDeepEqual(a[key], b[key]));
  }

  return false;
}