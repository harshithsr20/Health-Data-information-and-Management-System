import { auth, db } from "../../firebaseConfig.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

    // Extract the UID portion (the part before @)
    const uid = rawId.trim().toUpperCase().includes('@')
        ? rawId.trim().toUpperCase().split('@')[0]
        : rawId.trim().toUpperCase();

    if (!email) {
        alert('Please enter your Patient ID or patient email.');
        return;
    }
    if (!password) {
        alert('Please enter your password.');
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Verifying…';

    try {
        // Step 1: Firebase Authentication
        await signInWithEmailAndPassword(auth, email, password);

        // Step 2: Check Firestore — Patients collection for matching UID
        const patientsRef = collection(db, "Patients");
        const q = query(patientsRef, where("UID", "==", uid));
        const querySnap = await getDocs(q);

        if (!querySnap.empty) {
            // UID found → patient is active and has access
            sessionStorage.setItem("patientUID", uid);
            window.location.href = "pat_homepage.html";
        } else {
            // Authenticated but not in Patients collection → no access
            alert("Your account was not found in the patient records. Please contact your hospital administrator.");
        }

    } catch (error) {
        console.error('Login error:', error);
        switch (error.code) {
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                alert('Invalid ID or password.');
                break;
            case 'auth/user-not-found':
            case 'auth/invalid-email':
                alert('Patient ID not found. Please check and try again.');
                break;
            case 'auth/too-many-requests':
                alert('Too many failed attempts. Please wait and try again.');
                break;
            default:
                alert('Login failed. Please check your Patient ID and password.');
        }
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
    }
});
