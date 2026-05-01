import { auth, db } from "../../firebaseConfig.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc, updateDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Element refs ──────────────────────────────────────────────────────────────
const registerBtn = document.getElementById("register-btn");
const nameInput = document.getElementById("doc-name");
const uidInput = document.getElementById("doc-uid");
const passwordInput = document.getElementById("doc-password");
const errorBox = document.getElementById("reg-error-box");
const errorMsg = document.getElementById("reg-error-msg");
const successOverlay = document.getElementById("success-overlay");
const successMsgEl = document.getElementById("success-msg");
const lastUidEl = document.getElementById("last-assigned-uid");
const lastNameEl = document.getElementById("last-assigned-name");
const lastRemovedUidEl = document.getElementById("last-removed-uid");
const lastRemovedNameEl = document.getElementById("last-removed-name");

// ── Update Name element refs ──────────────────────────────────────────────────
const updateBtn = document.getElementById("update-btn");
const updateUidInput = document.getElementById("update-uid");
const updateNameInput = document.getElementById("update-name");
const updateErrorBox = document.getElementById("update-error-box");
const updateErrorMsg = document.getElementById("update-error-msg");
const updateSuccessBox = document.getElementById("update-success-box");
const updateSuccessMsg = document.getElementById("update-success-msg");

// UID pattern: 000-0000-00000  (3 digits - 4 digits - 5 digits)
const UID_REGEX = /^\d{3}-\d{4}-\d{5}$/;

const adminUID = sessionStorage.getItem("adminUID");

// On load, fetch the last assigned doctor for this hospital
async function fetchLastAssignedDoctor() {
    if (!adminUID) return;

    try {
        const q = query(
            collection(db, "Doctors"),
            where("UID", ">=", adminUID),
            where("UID", "<=", adminUID + "\uf8ff")
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docsList = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    Name: data.Name || "Unknown Doctor",
                    UID: data.UID || doc.id
                };
            });

            docsList.sort((a, b) => String(b.UID).localeCompare(String(a.UID)));

            const lastDoc = docsList[0];
            lastUidEl.textContent = lastDoc.UID || "—";
            lastNameEl.textContent = lastDoc.Name || "Unknown Doctor";
        } else {
            lastUidEl.textContent = "—";
            lastNameEl.textContent = "No doctors yet";
        }
    } catch (error) {
        console.error("Error fetching last assigned doctor:", error);
    }
}

// Fetch the last deleted doctor for this hospital from localStorage
function displayLastRemovedDoctor() {
    if (!adminUID) return;

    const deletedUID = localStorage.getItem(`lastDeletedDoctorUID_${adminUID}`);
    const deletedName = localStorage.getItem(`lastDeletedDoctorName_${adminUID}`);

    if (deletedUID && deletedName) {
        lastRemovedUidEl.textContent = deletedUID;
        lastRemovedNameEl.textContent = deletedName;
    } else {
        lastRemovedUidEl.textContent = "—";
        lastRemovedNameEl.textContent = "No recent deletions";
    }
}

fetchLastAssignedDoctor();
displayLastRemovedDoctor();

// ── Helpers ───────────────────────────────────────────────────────────────────
function showError(message) {
    errorMsg.textContent = message;
    errorBox.style.display = "flex";
}

function hideError() {
    errorBox.style.display = "none";
    errorMsg.textContent = "";
}

function setLoading(loading) {
    registerBtn.disabled = loading;
    registerBtn.innerHTML = loading
        ? `<span class="material-symbols-outlined text-sm animate-spin" data-icon="progress_activity">progress_activity</span> Registering…`
        : `<span class="material-symbols-outlined text-sm" data-icon="person_add">person_add</span> Register Doctor`;
}

// ── Update Name helpers ───────────────────────────────────────────────────────
function showUpdateError(message) {
    updateErrorMsg.textContent = message;
    updateErrorBox.style.display = "flex";
    updateSuccessBox.style.display = "none";
}

function showUpdateSuccess(message) {
    updateSuccessMsg.textContent = message;
    updateSuccessBox.style.display = "flex";
    updateErrorBox.style.display = "none";
}

function hideUpdateMessages() {
    updateErrorBox.style.display = "none";
    updateSuccessBox.style.display = "none";
}

function setUpdateLoading(loading) {
    updateBtn.disabled = loading;
    updateBtn.innerHTML = loading
        ? `<span class="material-symbols-outlined text-sm">progress_activity</span> Updating…`
        : `<span class="material-symbols-outlined text-sm" data-icon="edit">edit</span> Update Name`;
}

// ── Update Name handler ───────────────────────────────────────────────────────
updateBtn.addEventListener("click", async () => {
    hideUpdateMessages();

    const uid = updateUidInput.value.trim();
    const newName = updateNameInput.value.trim();

    // Validation
    if (!uid) {
        showUpdateError("Please enter the Doctor UID.");
        return;
    }

    if (!UID_REGEX.test(uid)) {
        showUpdateError("Enter a valid UID in the format 000-0000-00000.");
        return;
    }

    if (!newName) {
        showUpdateError("Please enter the new name.");
        return;
    }

    setUpdateLoading(true);

    try {
        // Step 1: Check if the UID document exists in the Doctors collection
        const docRef = doc(db, "Doctors", uid);
        const q = query(collection(db, "Doctors"), where("UID", "==", uid));
        const querySnap = await getDocs(q);

        if (querySnap.empty) {
            showUpdateError(`No doctor found with UID "${uid}". Please check and try again.`);
            setUpdateLoading(false);
            return;
        }

        // Step 2: Update the Name field on the matched document
        // Document ID is the UID itself (matches your Firestore structure)
        await updateDoc(docRef, { Name: newName });

        showUpdateSuccess(`Name updated to "${newName}" for UID ${uid}.`);

        // Clear inputs after success
        updateUidInput.value = "";
        updateNameInput.value = "";

    } catch (error) {
        console.error("Name update failed:", error);
        showUpdateError("Update failed. Please try again.");
    } finally {
        setUpdateLoading(false);
    }
});

// ── Main handler ──────────────────────────────────────────────────────────────
registerBtn.addEventListener("click", async () => {
    hideError();

    const name = nameInput.value.trim();
    const uid = uidInput.value.trim();
    const password = passwordInput.value;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!name) {
        showError("Please enter the doctor's full name.");
        return;
    }

    if (!UID_REGEX.test(uid)) {
        showError("Enter a valid UID in the format 000-0000-00000.");
        return;
    }

    if (password.length < 6) {
        showError("Password must be at least 6 characters long.");
        return;
    }

    // ── Firebase operations ───────────────────────────────────────────────────
    setLoading(true);

    const email = uid + "@doctor.com";

    try {
        // 1. Create Firebase Auth user
        await createUserWithEmailAndPassword(auth, email, password);

        // 2. Save doctor document to Firestore under "Doctors" collection
        await setDoc(doc(db, "Doctors", uid), {
            Name: name,
            UID: uid,
        });

        // 3. Update Registry Status card
        lastUidEl.textContent = uid;
        lastNameEl.textContent = name;

        // 4. Show success overlay
        successMsgEl.textContent = `${name} (${uid}) has been successfully registered.`;
        successOverlay.style.display = "flex";

        // 5. Redirect to dashboard after 2.5 seconds
        setTimeout(() => {
            window.location.href = "hosp_admin.html";
        }, 2500);

    } catch (error) {
        console.error("Registration failed:", error);

        if (error.code === "auth/email-already-in-use") {
            showError("A doctor with this UID already exists.");
        } else if (error.code === "auth/weak-password") {
            showError("Password is too weak. Use at least 6 characters.");
        } else {
            showError("Registration failed. Please try again.");
        }

        setLoading(false);
    }
});