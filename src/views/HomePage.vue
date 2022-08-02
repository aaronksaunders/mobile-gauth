<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Blank</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-button @click="signInWithGoogle">GOOGLE AUTH</ion-button>

      <template v-if="authResult">
        <div>
          <ion-button @click="signOut">SIGN OUT</ion-button>
          <pre>{{ authResult }}</pre>
        </div>
      </template>
      <template v-else>
        <div>
          <ion-item>
            <ion-label>EMAIL</ion-label>
            <ion-input v-model="email" type="text" required></ion-input>
          </ion-item>
          <ion-item>
            <ion-label>PASSWORD</ion-label>
            <ion-input v-model="password" type="password"></ion-input>
          </ion-item>
          <ion-button @click="signIn">SIGN IN WITH EMAIL</ion-button>
          <div>
            {{ JSON.stringify(error) }}
          </div>
        </div>
      </template>
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
} from "@ionic/vue";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { ref } from "vue";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithCredential,
  signInWithEmailAndPassword,
} from "@firebase/auth";
const authResult = ref<any>();
const email = ref("");
const password = ref("");
const error = ref<any>();

onIonViewWillEnter(async () => {
  console.log(getCurrentUser());
});

/**
 * @description sign out of firebase
 */
const signOut = async () => {
  const auth = getAuth();
  await auth.signOut();
  authResult.value = null;
};

const getCurrentUser = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  authResult.value = user;
  return user;
};

const signIn = async () => {
  try {
    const result = await FirebaseAuthentication.signInWithEmailAndPassword({
      email: email.value,
      password: password.value,
    });

    console.log(result);

    const auth = getAuth();
    await signInWithEmailAndPassword(auth, email.value, password.value);

    return getCurrentUser();
  } catch (_error) {
    console.log(_error);
    error.value = _error;
  }
};
/**
 *  @description Sign in with Google.
 */
const signInWithGoogle = async () => {
  const result = await FirebaseAuthentication.signInWithGoogle();

  const credential = GoogleAuthProvider.credential(result.credential?.idToken);
  const auth = getAuth();
  await signInWithCredential(auth, credential);

  return getCurrentUser();
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
