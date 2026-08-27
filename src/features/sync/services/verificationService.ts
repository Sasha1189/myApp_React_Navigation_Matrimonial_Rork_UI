import { rtdb } from "../../../config/firebase";
import { ref, get } from "@react-native-firebase/database";

export const checkUserVerification = async (
  myUid: string,
): Promise<boolean> => {
  try {
    const verRef = ref(rtdb, `userVerification/${myUid}`);
    const snap = await get(verRef);

    return snap.exists() && snap.val() === true;
  } catch (error) {
    console.error(
      "[checkUserVerification] Failed to fetch verification state:",
      error,
    );
    return false;
  }
};
