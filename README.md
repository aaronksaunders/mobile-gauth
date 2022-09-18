# Capacitor Firebase Authentication Plugin from CapAwesome Team - Example Vue JS App

A sample app showing how to integrate the [ Capacitor Firebase Authentication Plugin from CapAwesome Team](https://github.com/capawesome-team/capacitor-firebase) in an Ionic VueJS Application

you will need to add to root of project a .env file to project 
```
  VUE_APP_FIREBASE_API_KEY= 
  VUE_APP_FIREBASE_AUTH_DOMAIN= 
  VUE_APP_FIREBASE_PROJECT_ID= 
  VUE_APP_FIREBASE_APP_ID= 
```


you will need to follow directions for adding google auth to project
- https://github.com/capawesome-team/capacitor-firebase/blob/main/packages/authentication/docs/setup-google.md


### Problem
I needed google and phone number auth for a mobile solution, mostly google and I wanted a plugin that could handle all of the oauth stuff form me with simple configuration and finally firebase was the database solution.

So basically I use the Plugin to get the auth credential and then I login using the javascript sdk. Once the user is logged in, I do not need the listener from the plugin to let me know if a user is logged in or not; i juts use the js sdk auth listener to fing my user and thats it.


