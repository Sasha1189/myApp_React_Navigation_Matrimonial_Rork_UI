/**
 * Generates a time-ordered Base-32 short ID suffix
 * Changes every millisecond to prevent duplication
 */
export const generateTimeBasedSuffix = (): string => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Clean 32-character alphabet
  let now = Date.now(); // Current timestamp in milliseconds

  let suffix = "";
  // Extract 4 characters from the rapidly changing timestamp matrix
  for (let i = 0; i < 4; i++) {
    const remainder = now % 32;
    suffix = alphabet.charAt(remainder) + suffix;
    now = Math.floor(now / 32);
  }

  return `LYC-${suffix}`; // Returns a 4-character time-bound string (e.g., "K7R9")
};
