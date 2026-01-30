import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { getStorage } from '@react-native-firebase/storage';

// Initialize with modular syntax
const authInstance = getAuth();
const db = getFirestore();
const storage = getStorage();

export { authInstance as auth, db, storage };