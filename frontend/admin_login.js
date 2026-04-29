import { auth } from "../firebaseConfig.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const button = document.getElementById("submit-but");
const errorBox = document.getElementById("error-box");

button.addEventListener("click", login_admin);

async function login_admin() {
    // ✅ Read the raw ID first, THEN validate, THEN append domain
    const idValue = document.getElementById("id-holder").value.trim();
    const password = document.getElementById("admin-password").value;

    errorBox.style.display = "none";
    errorBox.textContent = "";

    // ✅ Check idValue, not email
    if (!idValue) {
        showError("Please enter your Admin ID");
        return;
    }

    if (password.length < 3) {
        showError("Password must be at least 3 characters long");
        return;
    }

    // ✅ Construct email only after validation passes
    const email = idValue + "@hospital.com";

    try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Admin logged in successfully");
        window.location.href = "hosp_admin.html";
    } catch (error) {
        console.error("Authentication failed:", error);
        showError("Invalid ID or password");
    }
}

function showError(message) {
    errorBox.textContent = message;
    errorBox.style.display = "block";
}