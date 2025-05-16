// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBbJ9oaVrA9v_4GWRCHyVA6fQvFtrhOh38",
  authDomain: "aiflashcards-4b475.firebaseapp.com",
  projectId: "aiflashcards-4b475",
  storageBucket: "aiflashcards-4b475.firebasestorage.app",
  messagingSenderId: "600674930801",
  appId: "1:600674930801:web:d6232ca1291f239066cbd0",
  measurementId: "G-Q8FPB13V0N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); 
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);



export { app, auth, analytics, db };