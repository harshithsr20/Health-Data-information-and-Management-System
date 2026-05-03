import { auth } from "../../firebaseConfig.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const idInput = document.getElementById('id-holder');
const passwordInput = document.getElementById('doc-password');
const submitButton = document.getElementById('submit-but');

function normalizeUid(uid) {
    return uid.trim().toUpperCase();
}

function normalizeEmail(input) {
    const value = input.trim();
    if (!value) return '';
    if (value.includes('@')) {
        const [local, domain] = value.split('@');
        return `${local.toUpperCase()}@${domain.toLowerCase()}`;
    }
    return `${normalizeUid(value)}@patient.com`;
}

submitButton.addEventListener('click', async () => {
    const rawId = idInput.value;
    const email = normalizeEmail(rawId);
    const password = passwordInput.value;

    if (!email) {
        alert('Please enter your Patient ID or patient email.');
        return;
    }
    if (!password) {
        alert('Please enter your password.');
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'pat_homepage.html';
    } catch (error) {
        console.error('Login error:', error);
        if (error.code === 'auth/user-not-found') {
            alert('No patient account found for this Patient ID.');
        } else if (error.code === 'auth/wrong-password') {
            alert('Incorrect password.');
        } else if (error.code === 'auth/invalid-email') {
            alert('The Patient ID is invalid.');
        } else {
            alert('Login failed. Please check your Patient ID and password.');
        }
    }
});
