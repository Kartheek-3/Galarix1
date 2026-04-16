// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDJtJ_KIOo7EYIDRrL7kNF8Gx2D-5Sqqh0",
  authDomain: "galarix2-245d7.firebaseapp.com",
  projectId: "galarix2-245d7",
  storageBucket: "galarix2-245d7.firebasestorage.app",
  messagingSenderId: "921764460443",
  appId: "1:921764460443:web:2a155bf93d12f76955133e",
  measurementId: "G-5K2G42C44E"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

// 🔥 AI INIT
const ai = getAI(app, {
  backend: new GoogleAIBackend()
});

// 🔥 MODEL (UNIFIED)
const model = getGenerativeModel(ai, {
  model: "gemini-3-flash-preview"
});

export { auth, db, model };