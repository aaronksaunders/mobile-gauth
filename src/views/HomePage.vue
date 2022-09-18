<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Blank</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-button @click="signInWithGoogle">GOOGLE AUTH</ion-button>
      <ion-button @click="signInWithTwitter" disabled>TWITTER AUTH</ion-button>
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
import { onMounted, ref, watch } from "vue";
import {
  currentUser,
  fb_signInWithGoogle,
  fb_signInWithEmailAndPassword,
  fb_signInWithPhoneNumber,
  fb_signInWithTwitter,
} from "@/firebase-service";
import { useRouter } from "vue-router";
const email = ref("");
const password = ref("");
const phoneNumberRef = ref("");
const error = ref<any>();
const router = useRouter();

onIonViewWillEnter(async () => {
  console.log("onIonViewWillEnter", currentUser);
});

onMounted(() => {
  console.log("onMounted", currentUser);
});

watch(currentUser, () => {
  if (currentUser?.value?.uid) {
    router.replace("/private");
  }
});

/**
 *
 *  WORKING !!
 *
 *  @description sign in with email and password
 */
const signIn = async () => {
  try {
    await fb_signInWithEmailAndPassword(email.value, password.value);
  } catch (_error: any) {
    console.log(_error);
    error.value = _error.message;
  }
};
/**
 *
 *  WORKING !!
 *
 *  @description Sign in with Google.
 */
const signInWithGoogle = async () => {
  try {
    await fb_signInWithGoogle();
  } catch (_error: any) {
    console.log(_error);
    error.value = _error.message;
  }
};

/**
 *
 * @description Sign in with Twitter.
 */
const signInWithTwitter = async () => {
  try {
    await fb_signInWithTwitter();
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
  try {
    await fb_signInWithPhoneNumber(phoneNumberRef.value);
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
