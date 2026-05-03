import { db, auth } from "../../firebaseConfig.js";
import { doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── DOM Elements ─────────────────────────────────────────────────────────────
const greetingName       = document.getElementById("greeting-name");
const lastUpdated        = document.getElementById("last-updated");
const aiOverviewContent  = document.getElementById("ai-overview-content");
const aiLoading          = document.getElementById("ai-loading");
const regenerateBtn      = document.getElementById("regenerate-ai-btn");
const medicationsList    = document.getElementById("medications-list");
const careTeamList       = document.getElementById("care-team-list");

// ── Authentication Guard ─────────────────────────────────────────────────────
const patientUID = sessionStorage.getItem("patientUID");

if (!patientUID) {
    // No UID in session → redirect back to login
    window.location.href = "pat_login.html";
} else {
    loadPatientDashboard(patientUID);
}

// ── Cached patient data for regeneration ─────────────────────────────────────
let cachedPatientData = null;

// ── Main Data Loader ─────────────────────────────────────────────────────────
async function loadPatientDashboard(uid) {
    try {
        // Fetch the patient document from the Patients collection
        const patientRef = doc(db, "Patients", uid);
        const patientSnap = await getDoc(patientRef);

        if (!patientSnap.exists()) {
            console.error("No patient document found for UID:", uid);
            greetingName.textContent = "Patient";
            showAIError("Patient record not found in the database.");
            return;
        }

        const data = patientSnap.data();
        cachedPatientData = data;

        // Set greeting name
        const fullName = data.fullName || data.name || "Patient";
        const firstName = fullName.split(" ")[0];
        greetingName.textContent = firstName;

        // Set last updated timestamp
        updateLastUpdated(data);

        // Send patient data to Groq AI for overview
        await fetchAIOverview(data);

        // Load sub-collections if they exist
        await Promise.allSettled([
            loadMedications(uid),
            loadCareTeam(uid)
        ]);

    } catch (error) {
        console.error("Error loading patient dashboard:", error);
        greetingName.textContent = "Patient";
        showAIError("Failed to load patient data. Please try again.");
    }
}

// ── Update Last Updated ─────────────────────────────────────────────────────
function updateLastUpdated(data) {
    if (data.createdAt) {
        const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
        lastUpdated.textContent = date.toLocaleDateString("en-US", options);
    } else {
        const now = new Date();
        const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
        lastUpdated.textContent = now.toLocaleDateString("en-US", options);
    }
}

// ── Fetch AI Overview from Groq ──────────────────────────────────────────────
async function fetchAIOverview(patientData) {
    showAILoading();

    try {
        const response = await fetch("http://localhost:3001/api/patient-overview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patientData }),
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || `Server returned ${response.status}`);
        }

        const result = await response.json();
        renderAIOverview(result.overview);

    } catch (error) {
        console.error("AI Overview error:", error);
        showAIError("Could not generate AI overview. Make sure the server is running on port 3001.");
    }
}

// ── Render AI Markdown Response ──────────────────────────────────────────────
function renderAIOverview(markdownText) {
    // Convert Markdown to HTML (simple converter)
    const html = markdownToHtml(markdownText);
    aiOverviewContent.innerHTML = html;
}

// ── Simple Markdown to HTML Converter ────────────────────────────────────────
function markdownToHtml(md) {
    let html = md
        // Escape HTML entities first
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        // Headings
        .replace(/^### (.+)$/gm, '<h3 class="text-base font-bold text-on-background mt-4 mb-2">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-[#0F52BA] mt-4 mb-2 flex items-center gap-2"><span class="material-symbols-outlined text-[20px]" style="font-variation-settings: \'FILL\' 1;">clinical_notes</span>$1</h2>')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-on-background">$1</strong>')
        // Italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Unordered list items
        .replace(/^- (.+)$/gm, '<li class="ml-4 text-sm text-on-surface-variant leading-relaxed">$1</li>')
        // Wrap consecutive <li> in <ul>
        .replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, '<ul class="space-y-1 my-2 list-disc list-inside">$1</ul>')
        // Line breaks
        .replace(/\n\n/g, '<div class="my-3"></div>')
        .replace(/\n/g, '<br>');

    return html;
}

// ── Show Loading State ───────────────────────────────────────────────────────
function showAILoading() {
    aiOverviewContent.innerHTML = `
        <div class="space-y-3 animate-pulse">
            <div class="h-4 bg-surface-container-low rounded w-3/4"></div>
            <div class="h-4 bg-surface-container-low rounded w-full"></div>
            <div class="h-4 bg-surface-container-low rounded w-5/6"></div>
            <div class="h-4 bg-surface-container-low rounded w-2/3"></div>
            <div class="h-4 bg-surface-container-low rounded w-full"></div>
            <div class="h-4 bg-surface-container-low rounded w-4/5"></div>
            <p class="text-xs text-slate-400 italic pt-2">Analyzing your medical records with AI…</p>
        </div>
    `;
}

// ── Show Error State ─────────────────────────────────────────────────────────
function showAIError(message) {
    aiOverviewContent.innerHTML = `
        <div class="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <span class="material-symbols-outlined text-red-500 text-xl mt-0.5">error</span>
            <div>
                <p class="text-sm font-bold text-red-700">Unable to generate overview</p>
                <p class="text-xs text-red-600 mt-1">${message}</p>
            </div>
        </div>
    `;
}

// ── Regenerate Button ────────────────────────────────────────────────────────
if (regenerateBtn) {
    regenerateBtn.addEventListener("click", async () => {
        if (cachedPatientData) {
            regenerateBtn.disabled = true;
            regenerateBtn.classList.add("opacity-50");
            await fetchAIOverview(cachedPatientData);
            regenerateBtn.disabled = false;
            regenerateBtn.classList.remove("opacity-50");
        }
    });
}

// ── Load Medications (sub-collection) ────────────────────────────────────────
async function loadMedications(uid) {
    try {
        const medsRef = collection(db, "Patients", uid, "medications");
        const medsSnap = await getDocs(medsRef);

        if (medsSnap.empty) {
            medicationsList.innerHTML = `
                <p class="text-sm text-slate-400 italic">No medications on record.</p>
            `;
            return;
        }

        medicationsList.innerHTML = "";
        medsSnap.forEach((medDoc) => {
            const med = medDoc.data();
            const card = document.createElement("div");
            card.className = "p-3 rounded-lg border-l-4 border-primary-container bg-surface-container-low";
            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <p class="text-sm font-normal text-on-background">${med.name || med.medication || "—"}</p>
                    <span class="text-[10px] text-slate-500 font-normal">${med.dosage || ""}</span>
                </div>
                <div class="mt-2 flex items-center justify-between">
                    <span class="text-[10px] text-slate-600 font-normal">${med.frequency || med.schedule || ""}</span>
                    <button class="w-6 h-6 rounded-full bg-white border border-outline-variant flex items-center justify-center text-slate-400 hover:text-emerald-500">
                        <span class="material-symbols-outlined text-[16px]">check</span>
                    </button>
                </div>
            `;
            medicationsList.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading medications:", error);
        medicationsList.innerHTML = `<p class="text-sm text-slate-400 italic">Could not load medications.</p>`;
    }
}

// ── Load Care Team (sub-collection) ──────────────────────────────────────────
async function loadCareTeam(uid) {
    try {
        const teamRef = collection(db, "Patients", uid, "careTeam");
        const teamSnap = await getDocs(teamRef);

        if (teamSnap.empty) {
            careTeamList.innerHTML = `
                <p class="text-sm text-slate-400 italic">No care team members on record.</p>
            `;
            return;
        }

        careTeamList.innerHTML = "";
        teamSnap.forEach((memberDoc) => {
            const member = memberDoc.data();
            const card = document.createElement("div");
            card.className = "flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-white transition-colors";
            card.innerHTML = `
                <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-primary/10 overflow-hidden">
                    <span class="text-2xl">${member.avatar || "👤"}</span>
                </div>
                <div>
                    <p class="text-sm font-normal text-on-background">${member.name || "—"}</p>
                    <p class="text-[11px] text-slate-500 font-normal">${member.role || member.specialty || ""}</p>
                </div>
            `;
            careTeamList.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading care team:", error);
        careTeamList.innerHTML = `<p class="text-sm text-slate-400 italic">Could not load care team.</p>`;
    }
}

// ── Logout Functionality ─────────────────────────────────────────────────────
const signOutLinks = document.querySelectorAll("a");
signOutLinks.forEach((link) => {
    if (link.textContent.includes("Sign Out")) {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            signOut(auth).then(() => {
                sessionStorage.removeItem("patientUID");
                window.location.href = "pat_login.html";
            }).catch((error) => {
                console.error("Sign out error:", error);
            });
        });
    }
});
