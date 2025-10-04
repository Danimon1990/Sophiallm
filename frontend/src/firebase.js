import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZI4W782GP5F6KNY0WLvEfzee926BKLRI",
  authDomain: "sophiallm.firebaseapp.com",
  projectId: "sophiallm",
  storageBucket: "sophiallm.firebasestorage.app",
  messagingSenderId: "963774833131",
  appId: "1:963774833131:web:5a726dd184e209b1cb79ae",
  measurementId: "G-WV8XHBYSNY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
