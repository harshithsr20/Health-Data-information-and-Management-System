import { auth, db } from "../../firebaseConfig.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const button = document.getElementById("submit-but");
const errorBox = document.getElementById("error-box");

button.addEventListener("click", login_doctor);

async function login_doctor() {
    const idValue = document.getElementById("id-holder").value.trim();
    const password = document.getElementById("doc-password").value;

    clearError();

    // ── Basic validation ──────────────────────────────────────────────────────
    if (!idValue) {
        showError("Please enter your Doctor ID.");
        return;
    }

    if (password.length < 3) {
        showError("Password must be at least 3 characters long.");
        return;
    }

    const email = idValue + "@doctor.com";

    button.disabled = true;
    button.textContent = "Verifying…";

    try {
        // ── Step 1: Firebase Authentication ──────────────────────────────────
        await signInWithEmailAndPassword(auth, email, password);

        // ── Step 2: Check Firestore — Doctors collection for matching UID ─────
        // Query for any document in "Doctors" where the UID field === idValue
        const doctorsRef = collection(db, "Doctors");
        const q = query(doctorsRef, where("UID", "==", idValue));
        const querySnap = await getDocs(q);

        if (!querySnap.empty) {
            // UID found → doctor is active and has access
            sessionStorage.setItem("doctorUID", idValue);
            window.location.href = "doc_homepage.html";
        } else {
            // Authenticated but not in Doctors collection → no access
            showError("You no longer have access to this system. Please contact your administrator.");
        }

    } catch (error) {
        console.error("Doctor login failed:", error);

        switch (error.code) {
            case "auth/wrong-password":
            case "auth/invalid-credential":
                showError("Invalid ID or password.");
                break;
            case "auth/user-not-found":
            case "auth/invalid-email":
                showError("Doctor ID not found. Please check and try again.");
                break;
            case "auth/too-many-requests":
                showError("Too many failed attempts. Please wait and try again.");
                break;
            default:
                showError("Something went wrong. Please try again.");
        }
    } finally {
        button.disabled = false;
        button.textContent = "Submit";
    }
}

function showError(message) {
    errorBox.textContent = message;
    errorBox.style.display = "block";
}

function clearError() {
    errorBox.textContent = "";
    errorBox.style.display = "none";
}