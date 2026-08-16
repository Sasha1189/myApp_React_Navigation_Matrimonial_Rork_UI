const R2_DOMAIN = process.env.EXPO_PUBLIC_R2_DOMAIN || "";

/**
 * Replaces a short filename stored in downloadURL with the full R2 CDN URL.
 */
export const resolvePhotoUri = (
  downloadURL: string | undefined,
  uid: string,
): string => {
  if (!downloadURL) return "";

  // If downloadURL is already a full URL, leave it untouched
  if (downloadURL.startsWith("http://") || downloadURL.startsWith("https://")) {
    return downloadURL;
  }

  // Construct full CDN URL from filename
  return `${R2_DOMAIN}/u/${uid}/${downloadURL}`;
};
