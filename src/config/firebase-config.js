import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore"
const firebaseConfig = {
    apiKey: "AIzaSyD5mQTXKqFXIvVp90zyCgj7saU8qNFI_20",
    authDomain: "what-meeting-app.firebaseapp.com",
    projectId: "what-meeting-app",
    storageBucket: "what-meeting-app.appspot.com",
    messagingSenderId: "573568690236",
    appId: "1:573568690236:web:ed1a7e5f8ae3c5829d3b39",
    measurementId: "G-DZY2VMENDV"
};
const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});
export { db };