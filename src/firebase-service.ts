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
    // set user using js sdk auth state change user, we need to ensure
    // this user is logged in since we plan on using the database
    getAuth().onAuthStateChanged(async (user) => {
      USER.value = getAuth().currentUser;
      console.log("JS USER", getAuth().currentUser);

      if (!(await FirebaseAuthentication.getCurrentUser())) {
        console.log("Error - we have js user, but no native user logged in");
      }
    });

    // check to see if there is a native user alread...
    const { user } = await FirebaseAuthentication.getCurrentUser();
    if (user) {
      // if there is a native user then we have to try and load js-sdk user
      console.log("already have a user, no need to listen");
      console.log("NATIVE USER", user);

      if (!getAuth().currentUser) {
        console.log("Error - we have native user, but no js user logged in");
        USER.value = null;
        return resolve(null);
      }

      // set user using js sdk user
      USER.value = getAuth().currentUser;

      // return reactive user from computed
      resolve(currentUser);
      return;
    }

    // This listener will not fire on logout when on native device. you will need
    // to clear out the user object you are tracking yourself
    //
    // also this listener will not reload the js sdk user when running on native
    // device, you need to do that yourself
    await FirebaseAuthentication.addListener("authStateChange", (_) => {
      // set user using js sdk user
      USER.value = getAuth().currentUser;
      console.log("listenerResponse", getAuth().currentUser);

      // return reactive user from computed
      resolve(currentUser);
    });
  });
};
