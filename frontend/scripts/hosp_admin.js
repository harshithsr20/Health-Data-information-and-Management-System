import { db, auth } from "../../firebaseConfig.js";
import { collection, query, where, getDocs, onSnapshot, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const adminUID = sessionStorage.getItem("adminUID");

if (!adminUID) {
    console.warn("No admin UID found in session. Redirecting to login.");
    window.location.href = "admin_log.html";
} else {
    fetchHospitalName(adminUID);
    listenToDoctors(adminUID);
}

async function fetchHospitalName(uid) {
    try {
        const q = query(collection(db, "Hospitals"), where("UID", "==", uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const hospitalData = querySnapshot.docs[0].data();
            const hospitalName = hospitalData.Name;
            document.getElementById("hospital-name").textContent = hospitalName;
            document.title = `${hospitalName} - Staff Management Dashboard`;
        } else {
            console.error("No hospital found for UID:", uid);
            document.getElementById("hospital-name").textContent = "Unknown Hospital";
        }
    } catch (error) {
        console.error("Error fetching hospital name:", error);
        document.getElementById("hospital-name").textContent = "Error Loading";
    }
}

function listenToDoctors(hospitalUID) {
    const q = query(
        collection(db, "Doctors"),
        where("UID", ">=", hospitalUID),
        where("UID", "<=", hospitalUID + "\uf8ff")
    );

    onSnapshot(q, (snapshot) => {
        const tbody = document.getElementById("doctor-list");
        if (!tbody) return;

        tbody.innerHTML = ""; // Clear existing rows
        let count = 0;

        snapshot.forEach((doctorDoc) => {
            const data = doctorDoc.data();
            const doctorName = data.Name || "Unknown Doctor";
            const doctorUID = data.UID || doctorDoc.id;

            const tr = document.createElement("tr");
            tr.className = "hover:bg-slate-50 transition-colors group";
            tr.innerHTML = `
                <td class="px-8 py-4 border-b border-slate-100">
                    <div class="flex flex-col">
                        <span class="font-bold text-slate-800 text-sm">${doctorName}</span>
                        <span class="text-[11px] text-slate-400 font-medium">${doctorUID}</span>
                    </div>
                </td>
                <td class="px-6 py-4 border-b border-slate-100 text-sm text-slate-600">General Practice</td>
                <td class="px-6 py-4 border-b border-slate-100 text-sm text-slate-600">General</td>
                <td class="px-6 py-4 border-b border-slate-100">
                    <span class="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium text-[11px] border border-emerald-100">
                        Active
                    </span>
                </td>
                <td class="px-8 py-4 border-b border-slate-100 text-right">
                    <button class="delete-btn text-slate-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50" data-uid="${doctorUID}">
                        <span class="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                </td>
            `;

            // Add delete functionality
            const deleteBtn = tr.querySelector(".delete-btn");
            deleteBtn.addEventListener("click", async (e) => {
                const uidToDelete = e.currentTarget.getAttribute("data-uid");
                if (confirm(`Are you sure you want to remove Dr. ${doctorName}?`)) {
                    // 1. Remove from the list visually immediately
                    tr.remove();
                    
                    // 2. Remove from Firebase
                    try {
                        await deleteDoc(doc(db, "Doctors", uidToDelete));
                        console.log(`Doctor document ${uidToDelete} deleted successfully`);
                        // 3. Save to localStorage for doc_reg.html to display
                        localStorage.setItem(`lastDeletedDoctorUID_${adminUID}`, uidToDelete);
                        localStorage.setItem(`lastDeletedDoctorName_${adminUID}`, doctorName);
                    } catch (error) {
                        console.error("Error deleting doctor document:", error);
                        alert("Error: Could not remove doctor profile.");
                    }
                }
            });

            tbody.appendChild(tr);
            count++;
        });

        const showingText = document.getElementById("showing-text");
        if (showingText) {
            showingText.textContent = `Showing ${count} medical professionals`;
        }

        const statsNumber = document.querySelector(".stats-number");
        if (statsNumber) {
            statsNumber.textContent = count;
        }
    }, (error) => {
        console.error("Error listening to doctors:", error);
    });
}

// Logout Functionality
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
            await signOut(auth);
            sessionStorage.removeItem("adminUID");
            window.location.href = "../index.html";
        } catch (error) {
            console.error("Error signing out:", error);
            alert("Failed to log out. Please try again.");
        }
    });
}
