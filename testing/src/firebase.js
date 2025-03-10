import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage"; // Import Storage

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBeY4TGl9jUU8ybf2SJOAH2EzBiWI8j6no",
    authDomain: "testing-9e3ea.firebaseapp.com",
    projectId: "testing-9e3ea",
    storageBucket: "testing-9e3ea.appspot.com",
    messagingSenderId: "617734361837",
    appId: "1:617734361837:web:e31f1daa7c6b92d602b2e4"
  };

// Initialize Firebase and Authentication
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Initialize Firebase Storage

export { auth, db, storage }; // Export storage as well

