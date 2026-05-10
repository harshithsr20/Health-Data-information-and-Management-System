import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "2mb" }));

function normalizeLanguage(code) {
    const c = String(code || "").toLowerCase().trim();
    const supported = new Set(["en", "hi", "kn", "te", "ur", "ta", "ml", "mr", "pa", "bn", "gu", "or"]);
    if (supported.has(c)) return c;
    return "en";
}

function languageDisplayName(code) {
    switch (normalizeLanguage(code)) {
        case "hi": return "Hindi";
        case "kn": return "Kannada";
        case "te": return "Telugu";
        case "ur": return "Urdu";
        case "ta": return "Tamil";
        case "ml": return "Malayalam";
        case "mr": return "Marathi";
        case "pa": return "Punjabi";
        case "bn": return "Bengali";
        case "gu": return "Gujarati";
        case "or": return "Odia";
        default: return "English";
    }
}

function languageInstruction(code) {
    const lang = normalizeLanguage(code);
    if (lang === "en") return "";
    const name = languageDisplayName(lang);
    return `\n\nLanguage requirement: Write the ENTIRE response in ${name} (use the normal script for ${name}). Keep numbers/units exactly as numbers (e.g., 120/80, 37.5°C, 5.4 mmol/L). Keep the Markdown structure (headings and bullet points).`;
}

// ── POST /api/analyze ────────────────────────────────────────────────────────
// Receives patient medical summary data from the frontend,
// sends it to Groq API for analysis, and returns the AI report.
app.post("/api/analyze", async (req, res) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
        return res.status(500).json({ error: "Groq API key is not configured. Please set GROQ_API_KEY in your .env file." });
    }

    const { patientData } = req.body;
    if (!patientData) {
        return res.status(400).json({ error: "Missing patientData in request body." });
    }

    // Build the prompt — focused exclusively on medical history
    const prompt = `You are a medical data analyst assistant. Based on the following patient medical data from a hospital database, generate a focused Medical History Report.

**Important:** You are only summarising and organising medical data that already exists. Do NOT diagnose, prescribe, or give medical advice. Simply present the medical information clearly and professionally.

Patient Medical Data:
${JSON.stringify(patientData, null, 2)}

Please produce a report covering ONLY these medical sections (skip any section where data is not available):
1. **Patient Overview** — Name, Age (calculate from DOB), Gender
2. **Physical Profile** — Height, weight, BMI (calculate if both height and weight are available)
3. **Blood Group**
4. **Medical Conditions & Habits** — Any recorded conditions, allergies, lifestyle habits (smoking, drinking, etc.). Highlight any clinically significant items.
5. **Current Medications** — Name, dose, frequency. Note any potential considerations if multiple medications are listed.
6. **Surgical / Hospitalization History** — Procedures, year, and any relevant notes.
7. **Summary** — A brief 2-3 sentence clinical overview of the patient's medical profile.

Do NOT include contact information, address, insurance details, ID proofs, or any non-medical data.
Format the report in clean Markdown with clear headings and bullet points.`;

    try {
        const groqUrl = "https://api.groq.com/openai/v1/chat/completions";

        const groqResponse = await fetch(groqUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are a medical data analyst assistant. You generate focused medical history reports in Markdown format. You ONLY cover medical information — blood type, conditions, habits, medications, surgeries, and physical profile. You never include contact details, insurance, or personal identifiers beyond name/age/gender. You never diagnose or prescribe."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 4096,
            }),
        });

        if (!groqResponse.ok) {
            const errorBody = await groqResponse.text();
            console.error("Groq API error:", groqResponse.status, errorBody);
            return res.status(502).json({ error: `Groq API returned ${groqResponse.status}. Check your API key.` });
        }

        const groqResult = await groqResponse.json();

        // Extract the text from Groq response (OpenAI-compatible format)
        const text =
            groqResult?.choices?.[0]?.message?.content ||
            "No analysis could be generated.";

        return res.json({ report: text });
    } catch (err) {
        console.error("Server error during Groq call:", err);
        return res.status(500).json({ error: "Internal server error: " + err.message });
    }
});

// ── POST /api/analyze-pdf-text ───────────────────────────────────────────────
// Receives extracted text from a patient's PDF report,
// sends it to Groq API to extract key medical details, and returns the AI summary.
app.post("/api/analyze-pdf-text", async (req, res) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
        return res.status(500).json({ error: "Groq API key is not configured." });
    }

    const { reportText } = req.body;
    if (!reportText) {
        return res.status(400).json({ error: "Missing reportText in request body." });
    }

    const prompt = `You are a medical data analyst. I am providing you with text extracted from a patient's diagnostic or lab report. Please extract the key clinical details and present them in a clear, easily readable Markdown format.

**Important:** Do NOT invent data, diagnose, or prescribe. Just extract the key findings.

Extracted Report Text:
${reportText}

Please provide:
1. **Report Overview** — Likely type of report (e.g., Blood test, MRI, Discharge summary) and any visible dates.
2. **Key Findings / Abnormalities** — Highlight any values that appear out of range, abnormal findings, or significant clinical observations.
3. **Conclusions / Impressions** — Any summary or conclusion explicitly stated in the report.

Format in clean Markdown using headings and bullet points.`;

    try {
        const groqUrl = "https://api.groq.com/openai/v1/chat/completions";

        const groqResponse = await fetch(groqUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are a clinical data extraction assistant. You summarize medical reports accurately without diagnosing."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 2048,
            }),
        });

        if (!groqResponse.ok) {
            const errorBody = await groqResponse.text();
            console.error("Groq API error:", groqResponse.status, errorBody);
            return res.status(502).json({ error: `Groq API returned ${groqResponse.status}.` });
        }

        const groqResult = await groqResponse.json();
        const text = groqResult?.choices?.[0]?.message?.content || "No details could be extracted.";

        return res.json({ summary: text });
    } catch (err) {
        console.error("Server error during Groq call:", err);
        return res.status(500).json({ error: "Internal server error: " + err.message });
    }
});
// ── POST /api/patient-overview ───────────────────────────────────────────────
// Receives patient data from Firestore, sends it to Groq API,
// and returns a concise AI-generated patient overview for the dashboard.
app.post("/api/patient-overview", async (req, res) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
        return res.status(500).json({ error: "Groq API key is not configured." });
    }

    const { patientData, language } = req.body;
    if (!patientData) {
        return res.status(400).json({ error: "Missing patientData in request body." });
    }

    const prompt = `You are a medical data assistant. Given the following patient record from a hospital database, generate a concise Patient Overview card.

Patient Data:
${JSON.stringify(patientData, null, 2)}

Generate a response in this EXACT format (use Markdown):

## Patient Profile
- **Name:** [full name]
- **Age:** [calculate from DOB if available, otherwise say "Not available"]
- **Gender:** [gender]
- **Blood Type:** [bloodType]
- **Height:** [height] cm
- **Weight:** [weight] kg
- **BMI:** [calculate BMI from height and weight if both available: weight(kg) / (height(m))². Round to 1 decimal]

## Quick Health Summary
Write 2-3 sentences summarising the patient's overall health profile based on the available data — mention any recorded conditions, medications, or hospitalizations. If data is limited, say so briefly.

**Important rules:**
- Only use data that actually exists in the record. Do NOT invent data.
- Do NOT include contact info, address, or ID numbers.
- Do NOT diagnose or prescribe. Just summarize what's on record.
- Keep it brief and professional.` + languageInstruction(language);

    try {
        const groqUrl = "https://api.groq.com/openai/v1/chat/completions";

        const groqResponse = await fetch(groqUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are a concise medical data assistant. You present patient information clearly in Markdown. You never diagnose or prescribe."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.2,
                max_tokens: 1024,
            }),
        });

        if (!groqResponse.ok) {
            const errorBody = await groqResponse.text();
            console.error("Groq API error:", groqResponse.status, errorBody);
            return res.status(502).json({ error: `Groq API returned ${groqResponse.status}.` });
        }

        const groqResult = await groqResponse.json();
        const text = groqResult?.choices?.[0]?.message?.content || "No overview could be generated.";

        return res.json({ overview: text });
    } catch (err) {
        console.error("Server error during Groq call:", err);
        return res.status(500).json({ error: "Internal server error: " + err.message });
    }
});

// ── POST /api/simplify-report ────────────────────────────────────────────────
// Patient-facing: receives extracted PDF text and returns a plain-language
// explanation that any non-medical person can understand.
app.post("/api/simplify-report", async (req, res) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
        return res.status(500).json({ error: "Groq API key is not configured." });
    }

    const { reportText, language } = req.body;
    if (!reportText) {
        return res.status(400).json({ error: "Missing reportText in request body." });
    }

    const prompt = `You are a warm, friendly family doctor explaining a medical report to a patient who has NO medical background. The patient is a normal everyday person — they don't know medical terms, abbreviations, or what lab values mean.

Your job is to read the following medical report text and explain it in PLAIN, SIMPLE language that anyone can understand.

**Rules you MUST follow:**
- Use everyday words. If a medical term appears (e.g., "hemoglobin", "creatinine", "WBC"), briefly explain what it is in simple words (e.g., "Hemoglobin — this is the part of your blood that carries oxygen to your body").
- Use relatable analogies where helpful (e.g., "Think of white blood cells as your body's soldiers that fight infections").
- Clearly state whether each result is **normal**, **slightly off**, or **needs attention**, using simple color-coded labels like ✅ Normal, ⚠️ Slightly Off, or 🔴 Needs Attention.
- If everything looks fine, reassure the patient warmly.
- If something needs attention, explain it gently without causing panic. Suggest they talk to their doctor for next steps.
- Do NOT diagnose or prescribe. You are only explaining what the report says.
- Keep your language warm, supportive, and encouraging — like a caring doctor talking to a patient face to face.
- Use short paragraphs, bullet points, and headings for easy reading.
- Add a brief "Bottom Line" section at the end summarizing the overall picture in 2-3 simple sentences.

**Extracted Report Text:**
${reportText}

Please provide the explanation in clean Markdown with clear headings and bullet points.` + languageInstruction(language);

    try {
        const groqUrl = "https://api.groq.com/openai/v1/chat/completions";

        const groqResponse = await fetch(groqUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are a kind, patient-friendly medical explainer. You translate complex medical reports into plain, everyday language that anyone can understand — even someone who has never seen a medical report before. You are warm, reassuring, and never use jargon without immediately explaining it. You never diagnose or prescribe."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.4,
                max_tokens: 3072,
            }),
        });

        if (!groqResponse.ok) {
            const errorBody = await groqResponse.text();
            console.error("Groq API error:", groqResponse.status, errorBody);
            return res.status(502).json({ error: `Groq API returned ${groqResponse.status}.` });
        }

        const groqResult = await groqResponse.json();
        const text = groqResult?.choices?.[0]?.message?.content || "Could not simplify the report.";

        return res.json({ summary: text });
    } catch (err) {
        console.error("Server error during Groq call:", err);
        return res.status(500).json({ error: "Internal server error: " + err.message });
    }
});

// ── Start ─────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production" && !process.env.NETLIFY) {
    app.listen(PORT, () => {
        console.log(`✅  AI proxy server running at http://localhost:${PORT}`);
        console.log(`   POST /api/analyze            →  Groq patient history analysis`);
        console.log(`   POST /api/analyze-pdf-text    →  Groq PDF report analysis`);
        console.log(`   POST /api/patient-overview    →  Groq patient overview for dashboard`);
        console.log(`   POST /api/simplify-report     →  Groq patient-friendly report explainer`);
    });
}

export default app;
