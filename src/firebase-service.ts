import { Capacitor } from "@capacitor/core";
import { initializeApp, getApps } from "firebase/app";
import { getDocs, getFirestore, query } from "firebase/firestore";
import {
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
} from "firebase/auth";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { ref, computed } from "vue";

import { collection } from "firebase/firestore";

// Initialize Firebase - information is stored in .env file in the root directory
const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
};

const USER = ref<any>(null);
const APP =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
if (Capacitor.isNativePlatform()) {
  // require to work appropriately on native devices
  initializeAuth(APP, {
    persistence: indexedDBLocalPersistence,
  });
}
export const firestoreDB = getFirestore(APP);
export const currentUser = computed(() => (USER.value ? USER.value : null));

/**
 *
 * @returns verify I can actually query the database
 */
export const testQuery = async () => {
  const q = query(collection(firestoreDB, "links"));

  const querySnapshot = await getDocs(q);
  const response: any[] = [];
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data());
    response.push({ ...doc.data(), id: doc.id });
  });

  return response;
};

/**
 * 
 * user by social media auth functions to set user after credential login
 * 
 * @param user 
 * @returns 
 */
export const setCurrentUser = (user: any) => {
  console.log("set current user", user);
  USER.value = user?.auth ? user?.auth.currentUser : user;
  return currentUser;
};

/**
 * 
 * called in main.ts to initialize firebase auth and check for a user.
 * 
 * @returns 
 */
export const initializeFBAuth = () => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async function (resolve) {
    const { user } = await FirebaseAuthentication.getCurrentUser();
    if (user) {
      USER.value = user;

      // return reactive user from computed
      resolve(currentUser);
      return;
    }

    await FirebaseAuthentication.addListener(
      "authStateChange",
      (listenerResponse) => {

        USER.value = listenerResponse?.user;

        console.log("listenerResponse", currentUser);

        // return reactive user from computed
        resolve(currentUser);
      }
    );
  });
};
