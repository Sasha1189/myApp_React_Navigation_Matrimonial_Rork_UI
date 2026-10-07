const R2_DOMAIN = process.env.EXPO_PUBLIC_R2_DOMAIN || "";

/**
 * Replaces a short filename with the full R2 CDN URL.
 */

export const resolvePhotoUri = (photoUri: unknown, uid: string): string => {
  // Return empty string if missing, not a string, or an empty string
  if (!photoUri || typeof photoUri !== "string") {
    return "";
  }

  // 1. If it's a local file path or an already fully-qualified http(s) URL, return as-is
  if (
    photoUri.startsWith("file://") ||
    photoUri.startsWith("ph://") ||
    photoUri.startsWith("content://") ||
    photoUri.startsWith("http://") ||
    photoUri.startsWith("https://")
  ) {
    return photoUri;
  }

  // 2. Safeguard R2 Domain and User UID
  if (!R2_DOMAIN || !uid) return "";

  // 3. Otherwise, treat as R2 filename and construct full CDN URL
  return `${R2_DOMAIN}/u/${uid}/p/${photoUri}`;
};

export const resolveThumbUri = (
  tv: string | number | undefined,
  uid: string,
): string => {
  if (!uid) return "";

  // 1. If tv is a full HTTP(S) URL (e.g. legacy/fallback URL)
  if (
    typeof tv === "string" &&
    (tv.startsWith("http://") || tv.startsWith("https://"))
  ) {
    return tv;
  }

  // 2. Safeguard R2 Domain and User UID
  if (!R2_DOMAIN || !uid) return "";

  return `${R2_DOMAIN}/u/${uid}/t/thumb.jpg?v=${tv}`;
};

// 💡 Helper to check if item is a local URI
export const isLocalUrl = (path: string) =>
  path.startsWith("file://") ||
  path.startsWith("ph://") ||
  path.startsWith("content://") ||
  path.startsWith("http://") ||
  path.startsWith("https://");
