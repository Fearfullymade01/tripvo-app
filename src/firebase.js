// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
    projectId: "YOUR_FIREBASE_PROJECT_ID",
    messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
