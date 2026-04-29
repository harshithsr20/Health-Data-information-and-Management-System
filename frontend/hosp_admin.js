import { db } from "../firebaseConfig.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const adminUID = sessionStorage.getItem("adminUID");

if (!adminUID) {
    console.warn("No admin UID found in session. Redirecting to login.");
    window.location.href = "admin_log.html";
} else {
    fetchHospitalName(adminUID);
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
