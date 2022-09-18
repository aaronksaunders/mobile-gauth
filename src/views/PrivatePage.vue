<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Private Page</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <template v-if="currentUser?.uid">
        <div>
          <ion-button @click="signOut">SIGN OUT</ion-button>
          <pre>{{ currentUser }}</pre>
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
} from "@ionic/vue";
import { onMounted } from "vue";
import { currentUser, fb_signOut } from "@/firebase-service";
import { useRouter } from "vue-router";
const router = useRouter();


// const { testQuery } = useFirebaseService();

onIonViewWillEnter(async () => {
  console.log("onIonViewWillEnter", currentUser);
});

onMounted(() => {
  console.log("onMounted", currentUser);
});

/**
 * @description sign out of firebase
 */
const signOut = async () => {
  await fb_signOut()

  // clear authResult
  router.replace("/home")
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
