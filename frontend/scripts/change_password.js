import { auth } from "../../firebaseConfig.js";
import {
    signInWithEmailAndPassword,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── DOM refs ──────────────────────────────────────────────────────────────────
const btn = document.getElementById("submit-btn");
const errorBox = document.getElementById("error-box");
const successBox = document.getElementById("success-box");
const newPassInput = document.getElementById("new-password");
const strengthFill = document.getElementById("strength-fill");
const strengthLabel = document.getElementById("strength-label");

// ── ID format patterns ────────────────────────────────────────────────────────
// Admin:  000-0000          (2 segments: 3-4 digits)   → @hospital.com
// Doctor: 000-0000-00000    (3 segments: 3-4-5 digits) → @doctor.com
const ADMIN_PATTERN = /^\d{3}-\d{4}$/;
const DOCTOR_PATTERN = /^\d{3}-\d{4}-\d{5}$/;

function resolveEmail(idValue) {
    if (ADMIN_PATTERN.test(idValue)) return idValue + "@hospital.com";
    if (DOCTOR_PATTERN.test(idValue)) return idValue + "@doctor.com";
    return null; // unrecognised format
}

// ── Password strength meter ───────────────────────────────────────────────────
newPassInput.addEventListener("input", () => {
    const score = getStrengthScore(newPassInput.value);

    const levels = [
        { pct: "0%", color: "transparent", text: "" },
        { pct: "25%", color: "#e63950", text: "Weak" },
        { pct: "50%", color: "#f59e0b", text: "Fair" },
        { pct: "75%", color: "#3b82f6", text: "Good" },
        { pct: "100%", color: "#15803d", text: "Strong" },
    ];

    const level = levels[score];
    strengthFill.style.width = level.pct;
    strengthFill.style.background = level.color;
    strengthLabel.textContent = level.text;
    strengthLabel.style.color = level.color;
});

function getStrengthScore(pwd) {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return Math.min(score, 4);
}

// ── Main handler ──────────────────────────────────────────────────────────────
btn.addEventListener("click", changePassword);

async function changePassword() {
    clearMessages();

    const idValue = document.getElementById("id-holder").value.trim();
    const currentPass = document.getElementById("current-password").value;
    const newPass = newPassInput.value;
    const confirmPass = document.getElementById("confirm-password").value;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!idValue) {
        showError("Please enter your ID.");
        return;
    }

    const email = resolveEmail(idValue);
    if (!email) {
        showError("Invalid ID format. Admin IDs look like 000-0000, Doctor IDs like 000-0000-00000.");
        return;
    }

    if (!currentPass) {
        showError("Please enter your current password.");
        return;
    }

    if (newPass.length < 6) {
        showError("New password must be at least 6 characters.");
        return;
    }

    if (newPass !== confirmPass) {
        showError("New passwords do not match.");
        return;
    }

    if (newPass === currentPass) {
        showError("New password must be different from the current one.");
        return;
    }

    btn.disabled = true;
    btn.textContent = "Updating…";

    try {
        // Step 1: Sign in with current credentials
        const userCredential = await signInWithEmailAndPassword(auth, email, currentPass);
        const user = userCredential.user;

        // Step 2: Re-authenticate (required by Firebase before sensitive operations)
        const credential = EmailAuthProvider.credential(email, currentPass);
        await reauthenticateWithCredential(user, credential);

        // Step 3: Update password
        await updatePassword(user, newPass);

        showSuccess("Password updated successfully! Redirecting to login…");

        setTimeout(() => {
            window.location.href = "admin_log.html";
        }, 2000);

    } catch (error) {
        console.error("Password change failed:", error);

        switch (error.code) {
            case "auth/wrong-password":
            case "auth/invalid-credential":
                showError("Current password is incorrect.");
                break;
            case "auth/user-not-found":
            case "auth/invalid-email":
                showError("ID not found. Please check and try again.");
                break;
            case "auth/too-many-requests":
                showError("Too many attempts. Please wait and try again.");
                break;
            case "auth/weak-password":
                showError("New password is too weak. Use at least 6 characters.");
                break;
            case "auth/requires-recent-login":
                showError("Session expired. Please log in again first.");
                break;
            default:
                showError("Something went wrong. Please try again.");
        }
    } finally {
        btn.disabled = false;
        btn.textContent = "Update Password";
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function showError(message) {
    errorBox.textContent = message;
    errorBox.style.display = "block";
    successBox.style.display = "none";
}

function showSuccess(message) {
    successBox.textContent = message;
    successBox.style.display = "block";
    errorBox.style.display = "none";
}

function clearMessages() {
    errorBox.style.display = "none";
    successBox.style.display = "none";
    errorBox.textContent = "";
    successBox.textContent = "";
}
