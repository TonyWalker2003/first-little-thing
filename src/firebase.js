
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBhtUSVLvC4_cAwQU-FaOkXO6_cS00tNtk",
    authDomain: "app-test-46943.firebaseapp.com",
    projectId: "app-test-46943",
    storageBucket: "app-test-46943.firebasestorage.app",
    messagingSenderId: "996558847701",
    appId: "1:996558847701:web:c260414e1735dd1425ec5c",
    measurementId: "G-RCF79KCV5E"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
