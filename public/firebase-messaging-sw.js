// src/firebase-messaging-sw.js
importScripts(
    "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js",
);
importScripts(
    "https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js",
);

firebase.initializeApp({
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
    projectId: "YOUR_FIREBASE_PROJECT_ID",
    messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/logo192.png",
    });
});
