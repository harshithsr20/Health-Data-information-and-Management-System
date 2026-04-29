import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { db } from "./firebaseConfig.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            if (docSnap.data().role === "admin") {
                window.location.href = "";
            } else if (docSnap.data().role === "doctor") {
                window.location.href = "";
            } else if (docSnap.data().role === "patient") {
                window.location.href = "";
            } else if (docSnap.data().role === "policy-maker") {
                window.location.href = "";
            }
        } else {
            console.log("No such document!");
        }
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
    }
}

