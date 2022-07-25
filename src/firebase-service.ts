import { Capacitor } from "@capacitor/core";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, indexedDBLocalPersistence, initializeAuth } from "firebase/auth";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

console.log(process.env);
const firebaseConfig = {
    apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
    authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VUE_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let auth: any = null;

if (Capacitor.isNativePlatform()) {
    auth = initializeAuth(app, {
        persistence: indexedDBLocalPersistence,
    });
} else {
    auth = getAuth(app);
}


export { app, db, auth };