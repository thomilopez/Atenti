import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBW_o8jUCxtc8lhxRMtwFodsDNDYTcm0Qo",
  authDomain: "atenti-d6d03.firebaseapp.com",
  projectId: "atenti-d6d03",
  storageBucket: "atenti-d6d03.firebasestorage.app",
  messagingSenderId: "300172146926",
  appId: "1:300172146926:web:fcda342e8ba616e7385bff",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

export { app, auth, db };