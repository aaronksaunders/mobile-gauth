import { Capacitor } from "@capacitor/core";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, indexedDBLocalPersistence, initializeAuth } from "firebase/auth";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { ref } from "vue";

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




export function useFirebaseService() {

    const initialized = ref(false);


    // this never fires on native devices... so we'll just use the JS version
    !Capacitor.isNativePlatform() && FirebaseAuthentication.addListener("authStateChange", async (result) => {
        if (result.user) {
            console.log("js user", await getAuth().currentUser);
        } else {
            console.log("no user found");
        }
        initialized.value = true;
    });

    // initialize the Firebase JS SDK
    const app = initializeApp(firebaseConfig);
    console.log("firebase initialized", app);

    const db = getFirestore(app);
    let auth: any = null;

    if (Capacitor.isNativePlatform()) {
        auth = initializeAuth(app, {
            persistence: indexedDBLocalPersistence,
        });

        // this is a hack that works on native devices since the plugin 
        // doesn't fire the authStateChange event
        auth.onAuthStateChanged(async (user: any) => {
            let _user = user;
            if (!user) {
                _user = await FirebaseAuthentication.getCurrentUser();
                console.log("no user found... calling API to get user", _user);
                initialized.value = true;
                return;
            }
            console.log("user - onAuthStateChanged", user);
            initialized.value = true;
        })
    } else {
        auth = getAuth(app);
    }




    return { app, db, auth, initialized };
}