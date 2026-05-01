import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDS9qlUtgeZhlotYVzunQ-4uZgLZcma950",
  authDomain: "hdims-project.firebaseapp.com",
  projectId: "hdims-project",
  storageBucket: "hdims-project.firebasestorage.app",
  messagingSenderId: "398206241535",
  appId: "1:398206241535:web:eb6f6a6f7e93db7b5fdaca",
  measurementId: "G-FYDLY60SM4"
};
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
