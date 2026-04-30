import { db } from "../../firebaseConfig.js";
import { collection, query, where, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

        snapshot.forEach((doc) => {
            const data = doc.data();
            const doctorName = data.Name || "Unknown Doctor";
            const doctorUID = data.UID || doc.id;

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
                    <button class="text-slate-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-slate-100">
                        <span class="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>
                </td>
            `;
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
