<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Blank</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-button @click="signInWithGoogle">GOOGLE AUTH</ion-button>
      <ion-button @click="signInWithTwitter">TWITTER AUTH</ion-button>
        <div>
          {{ JSON.stringify(error) }}
        </div>
        <div style="margin-top: 12px">
          <ion-card>
            <ion-card-content>
              <ion-item>
                <ion-label>EMAIL</ion-label>
                <ion-input v-model="email" type="text" required></ion-input>
              </ion-item>
              <ion-item>
                <ion-label>PASSWORD</ion-label>
                <ion-input v-model="password" type="password"></ion-input>
              </ion-item>
              <ion-button @click="signIn">SIGN IN WITH EMAIL</ion-button>
            </ion-card-content>
          </ion-card>
        </div>
        <div style="margin-top: 12px">
          <div name="sign-in-button" id="sign-in-button"></div>
          <ion-card>
            <ion-card-content>
              <ion-item>
                <ion-label>PHONE NUMBER</ion-label>
                <ion-input v-model="phoneNumberRef" type="text" required></ion-input>
              </ion-item>
              <ion-button @click="signInWithPhoneNumber"
                >SIGN IN WITH PHONE NUMBER</ion-button
              >
            </ion-card-content>
          </ion-card>
        </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  onIonViewWillEnter,
  IonItem,
  IonLabel,
  IonInput,
  IonCard,
  IonCardContent,
} from "@ionic/vue";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { computed, onMounted, ref, watch } from "vue";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithCredential,
  signInWithEmailAndPassword,
  TwitterAuthProvider,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber as signInWithPhoneNumberWeb,
} from "@firebase/auth";
import { Capacitor } from "@capacitor/core";
import { currentUser, getUser, setCurrentUser } from "@/firebase-service";
import { useRouter } from "vue-router";
const authResult = ref<any>();
const email = ref("");
const password = ref("");
const phoneNumberRef = ref("");
const error = ref<any>();
const router = useRouter();

const displayUser = computed(() => authResult?.value);

onIonViewWillEnter(async () => {
  console.log("onIonViewWillEnter", currentUser);
});


onMounted(() => {
  if (!Capacitor.isNativePlatform()) {
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
  }

  console.log("onMounted", currentUser);
});

watch(currentUser, () => {
  if (currentUser?.value?.email) {
    router.replace("/private");
  }
});

/**
 * @description sign out of firebase
 */
const signOut = async () => {
  const auth = getAuth();

  // sign out web
  await auth.signOut();

  // sign out capacitor
  await FirebaseAuthentication.signOut();

  // clear authResult
  authResult.value = null;
};

/**
 * gets the current user from the javascript api to ensure
 * we can make database calls as an authenticated user
 */
const getCurrentUser = async () => {
  authResult.value = currentUser;

  // test query, to validate we are authenticated
  // testQuery().then((res) => {
  //   console.log(res);
  // });
  return authResult.value;
};

/**
 *
 *  WORKING !!
 *
 *  @description sign in with email and password
 */
const signIn = async () => {
  try {
    await FirebaseAuthentication.signInWithEmailAndPassword({
      email: email.value,
      password: password.value,
    });

    const userCredential = await signInWithEmailAndPassword(getAuth(), email.value, password.value);

    return setCurrentUser(userCredential?.user);
  } catch (_error) {
    console.log(_error);
    error.value = _error;
  }
};
/**
 *
 *  WORKING !!
 *
 *  @description Sign in with Google.
 */
const signInWithGoogle = async () => {
  const result = await FirebaseAuthentication.signInWithGoogle();

  const credential = GoogleAuthProvider.credential(result.credential?.idToken);
  const userCredential = await signInWithCredential(getAuth(), credential);

  return setCurrentUser(userCredential?.user);
};

/**
 *
 * @description Sign in with Twitter.
 */
const signInWithTwitter = async () => {
  try {
    const result = await FirebaseAuthentication.signInWithTwitter();

    const credential = TwitterAuthProvider.credential(
      result.credential?.idToken as string,
      result.credential?.secret as string
    );
    const userCredential = await signInWithCredential(getAuth(), credential);

    return setCurrentUser(userCredential?.user);
  } catch (_error: any) {
    console.log(_error);
    error.value = _error?.message;
  }
};

/**
 *
 *  WORKING !!
 *
 * @description Sign in with phone number, first check and if on the web, then
 *  sign in with web version of this call. @see signInWithPhoneNumber_web
 */
const signInWithPhoneNumber = async () => {
  if (!Capacitor.isNativePlatform()) {
    signInWithPhoneNumber_web();
    return;
  }

  try {
    // 1. Start phone number verification
    const { verificationId } = await FirebaseAuthentication.signInWithPhoneNumber({
      phoneNumber: phoneNumberRef.value,
    });

    // 2. Let the user enter the SMS code
    const verificationCode = window.prompt(
      "Please enter the verification code that was sent to your mobile device."
    );

    // 3. Sign in on the web layer using the verification ID and verification code.
    const credential = PhoneAuthProvider.credential(
      verificationId || "",
      verificationCode || ""
    );

    const userCredential = await signInWithCredential(getAuth(), credential as any);
    return setCurrentUser(userCredential?.user);

  } catch (_error: any) {
    console.log(_error);
    error.value = _error.message;
  }
};

/**
 *
 *  WORKING !!
 *
 * @description sign in with phone number on the Web
 */
const signInWithPhoneNumber_web = async () => {
  try {
    const appVerifier = (window as any)?.recaptchaVerifier;

    const auth = getAuth();
    const confirmationResult = await signInWithPhoneNumberWeb(
      auth,
      phoneNumberRef.value,
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

    var credential = PhoneAuthProvider.credential(
      confirmationResult.verificationId,
      verificationCode as string
    );
    const userCredentials = await signInWithCredential(auth, credential);
    console.log(userCredentials);

    return getCurrentUser();
  } catch (_error: any) {
    console.log(_error);
    error.value = _error.message;
  }
};
</script>

<style scoped>
#container {
  text-align: center;

  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;

  color: #8c8c8c;

  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>
