<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Blank</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-button @click="signInWithGoogle">GOOGLE AUTH</ion-button>
      <pre>{{ authResult }}</pre>
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
} from "@ionic/vue";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { ref } from "vue";
import { GoogleAuthProvider, getAuth, signInWithCredential } from "@firebase/auth";
const authResult = ref<any>();

const signInWithGoogle = async () => {
  const result = await FirebaseAuthentication.signInWithGoogle();

  const credential = GoogleAuthProvider.credential(result.credential?.idToken);
  const auth = getAuth();
  await signInWithCredential(auth, credential);

  authResult.value = result;
  return result.user;
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
