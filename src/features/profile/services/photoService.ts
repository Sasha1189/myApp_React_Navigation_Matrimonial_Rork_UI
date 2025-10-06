import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

export async function processImage(uri: string) {
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (!fileInfo.exists) throw new Error("File does not exist");

  // Compress if > 1MB
  if (fileInfo.size > 1024 * 1024) {
    const processed = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 0.75,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    return processed.uri;
  }

  return uri;
}

export async function uriToBlob(uri: string): Promise<Blob> {
  const res = await fetch(uri);
  return await res.blob();
}

export async function uploadPhoto(userId: string, localUri: string) {
  const storage = getStorage();
  const uniqueFilename = `IMG_${new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")}_${Math.floor(Math.random() * 10000)}.jpg`;

  const storageRef = ref(storage, `users/${userId}/profileImages/${uniqueFilename}`);
  const blob = await uriToBlob(localUri);

  return new Promise<string>((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, blob as any);

    uploadTask.on(
      "state_changed",
      null,
      reject,
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}

export async function deletePhotoFromStorage(downloadURL: string) {
  try {
    const decoded = decodeURIComponent(downloadURL);
    const path = decoded.substring(decoded.indexOf("/o/") + 3, decoded.indexOf("?"));
    const storagePath = path.replace(/%2F/g, "/");
    const imageRef = ref(getStorage(), storagePath);
    await deleteObject(imageRef);
  } catch (err) {
    console.error("Failed to delete from Firebase Storage:", err);
    throw err;
  }
}
