import { db, auth } from "../../firebaseConfig.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── DOM Elements ─────────────────────────────────────────────────────────────
const nameDisplay = document.getElementById("doc-name-display");
const dateDisplay = document.getElementById("current-date-display");
const logoutLink = document.getElementById("logout-link");

// ── Authentication Check ─────────────────────────────────────────────────────
const doctorUID = sessionStorage.getItem("doctorUID");

if (!doctorUID) {
    // If no UID is found in session, redirect to login
    window.location.href = "doc_login.html";
} else {
    fetchDoctorData(doctorUID);
}

// ── Fetch Doctor Data ────────────────────────────────────────────────────────
async function fetchDoctorData(uid) {
    try {
        const docRef = doc(db, "Doctors", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            nameDisplay.textContent = data.Name ? `Dr. ${data.Name}` : "Doctor";
        } else {
            console.error("No such doctor document!");
            nameDisplay.textContent = "Doctor";
        }
    } catch (error) {
        console.error("Error fetching doctor data:", error);
        nameDisplay.textContent = "Doctor";
    }
}

// ── Dynamic Date ─────────────────────────────────────────────────────────────
function updateDate() {
    const options = { month: 'long', day: 'numeric' };
    const today = new Date();
    dateDisplay.textContent = today.toLocaleDateString('en-US', options);
}

updateDate();

// ── Logout Functionality ─────────────────────────────────────────────────────
logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    signOut(auth).then(() => {
        sessionStorage.removeItem("doctorUID");
        window.location.href = "doc_login.html";
    }).catch((error) => {
        console.error("Sign out error:", error);
    });
});
