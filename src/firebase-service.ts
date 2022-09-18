import { Capacitor } from "@capacitor/core";
import { initializeApp, getApps } from "firebase/app";
import { getDocs, getFirestore, query } from "firebase/firestore";
import {
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  PhoneAuthProvider,
  TwitterAuthProvider,
  signInWithPhoneNumber as signInWithPhoneNumberWeb,
} from "firebase/auth";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { ref, computed } from "vue";
import { RecaptchaVerifier } from "@firebase/auth";
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

/******************************************************************************
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

/******************************************************************************
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

/******************************************************************************
 *
 */
export const newGetUser = () => {
  return new Promise(function (resolve) {
    // set user using js sdk auth state change user, we need to ensure
    // this user is logged in since we plan on using the database
    getAuth().onAuthStateChanged(async (user) => {
      USER.value = getAuth().currentUser;
      console.log("JS USER", getAuth().currentUser);
      resolve(currentUser);
    });
  });
};

/******************************************************************************
 *
 */
export const fb_signOut = async () => {
  const auth = getAuth();

  // sign out web
  await auth.signOut();

  // sign out capacitor
  await FirebaseAuthentication.signOut();

  USER.value = null;
};

/******************************************************************************
 *
 * @returns
 */
export const fb_signInWithGoogle = async () => {
  const result = await FirebaseAuthentication.signInWithGoogle();

  const credential = GoogleAuthProvider.credential(result.credential?.idToken);
  await signInWithCredential(getAuth(), credential);
  USER.value = getAuth().currentUser;
  return currentUser;
};

/******************************************************************************
 *
 * @returns
 */
export const fb_signInWithPhoneNumber = async (phoneNumber: string) => {
  if (!Capacitor.isNativePlatform()) {
    return fb_signInWithPhoneNumber_web(phoneNumber);
  }

  // 1. Start phone number verification
  const { verificationId } = await FirebaseAuthentication.signInWithPhoneNumber(
    {
      phoneNumber,
    }
  );

  // 2. Let the user enter the SMS code
  const verificationCode = window.prompt(
    "Please enter the verification code that was sent to your mobile device."
  );

  // 3. Sign in on the web layer using the verification ID and verification code.
  const credential = PhoneAuthProvider.credential(
    verificationId || "",
    verificationCode || ""
  );

  await signInWithCredential(getAuth(), credential as any);
  USER.value = getAuth().currentUser;
  return currentUser;
};

/******************************************************************************
 *
 * @returns
 */
export const fb_signInWithPhoneNumber_web = async (phoneNumber: string) => {
  debugger;
  // used for signing up using phone number on WEB
  (window as any).recaptchaVerifier = new RecaptchaVerifier(
    "sign-in-button",
    {
      size: "invisible",
      callback: (response: any) => {
        console.log(response);
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        // onSignInSubmit();
        // need to account for issue with this, ie and error
      },
    },
    getAuth()
  );

  const appVerifier = (window as any)?.recaptchaVerifier;

  const auth = getAuth();
  const confirmationResult = await signInWithPhoneNumberWeb(
    auth,
    phoneNumber,
    appVerifier
  );
  // SMS sent. Prompt user to type the code from the message, then sign the
  // user in with confirmationResult.confirm(code).
  const verificationCode = window.prompt(
    "Please enter the verification code that was sent to your mobile device."
  );

  const result = await confirmationResult.confirm(verificationCode as string);
  // User signed in successfully.
  const user = result.user;
  console.log(user);

  const credential = PhoneAuthProvider.credential(
    confirmationResult.verificationId,
    verificationCode as string
  );
  await signInWithCredential(auth, credential);
  USER.value = getAuth().currentUser;
  return currentUser;
};

/******************************************************************************
 *
 * @param email
 * @param password
 * @returns
 */
export const fb_signInWithEmailAndPassword = async (
  email: string,
  password: string
) => {
  await signInWithEmailAndPassword(getAuth(), email, password);
  USER.value = getAuth().currentUser;
  return currentUser;
};

/******************************************************************************
 *
 * @returns
 */
export const fb_signInWithTwitter = async () => {
  const result = await FirebaseAuthentication.signInWithTwitter();

  const credential = TwitterAuthProvider.credential(
    result.credential?.idToken as string,
    result.credential?.secret as string
  );
  await signInWithCredential(getAuth(), credential);

  USER.value = getAuth().currentUser;
  return currentUser;
};
