# mobile-gauth

you will need to add to root of project a .env file to project 
```
  VUE_APP_FIREBASE_API_KEY= 
  VUE_APP_FIREBASE_AUTH_DOMAIN= 
  VUE_APP_FIREBASE_PROJECT_ID= 
  VUE_APP_FIREBASE_APP_ID= 
```


you will need to follow directions for adding google auth to project
- https://github.com/capawesome-team/capacitor-firebase/blob/main/packages/authentication/docs/setup-google.md


### Workaround

I figured out a workaround to the problem for my vuejs application, I set `skipNativeAuth` to false


and then I just use the JS SDK authListener since it does fire.
```
    const initialized = ref(false);

    const app = initializeApp(firebaseConfig);
    if (Capacitor.isNativePlatform()) {
        auth = initializeAuth(app, {
            persistence: indexedDBLocalPersistence,
        });
    } else {
        auth = getAuth(app);
    }

    auth.onAuthStateChanged(async (user: any) => {
        console.log("user - onAuthStateChanged", user);
        initialized.value = true;
    })
```
I don't start the app completely until I know `authStateChanged` has been called

```
const { initialized } = useFirebaseService();

const app = createApp(App)
  .use(IonicVue)
  .use(router);

watch(initialized, (value) => {
  console.log("initialized", value);
  // mount the app
  console.log('mounting the app...');
  router.isReady().then(() => {
    app.mount('#app');
  });
})
```



See video
https://www.loom.com/share/b6b33bd9838a4af3a26d6b29595c8e0b