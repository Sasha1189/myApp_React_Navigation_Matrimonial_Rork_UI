import { Profile } from "@/features/profile/types/profile";

export function parseProfileRow(
  row: { profileData: string } & Record<string, any>,
): Profile {
  try {
    // 1. Unpack the full 50-field JSON payload (photos, bio, family details, etc.)
    const fullProfile = JSON.parse(row.profileData);

    // 2. Merge JSON payload with top-level SQL columns
    return {
      ...fullProfile,
      ...row,
    };
  } catch (err) {
    console.error(
      "❌ Failed to parse profileData JSON for UID:",
      row?.uid,
      err,
    );
    // Return row object cast as Profile to prevent app crashing on invalid JSON
    return row as unknown as Profile;
  }
}
