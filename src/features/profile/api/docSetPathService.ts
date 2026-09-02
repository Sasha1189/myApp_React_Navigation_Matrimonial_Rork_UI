import { rtdb } from "../../../config/firebase";
import { ref, set } from "@react-native-firebase/database";

export const setDocPath = async (myUid: string): Promise<boolean> => {
  try {
    const verRef = ref(rtdb, `docVer/${myUid}`);
    await set(verRef, false);
    return true;
  } catch (error) {
    console.error(
      "[checkUserVerification] Failed to fetch verification state:",
      error,
    );
    return false;
  }
};
