// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.1.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
  apiKey: "AIzaSyBk8-K2u-JZRwsw95TTykdac7RNAibHH-A",
  authDomain: "smartstay-hub.firebaseapp.com",
  projectId: "smartstay-hub",
  storageBucket: "smartstay-hub.firebasestorage.app",
  messagingSenderId: "883870043904",
  appId: "1:883870043904:web:41160bd4a05ce746f16de5",
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/placeholder.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
