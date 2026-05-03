import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "2mb" }));

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

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅  AI proxy server running at http://localhost:${PORT}`);
    console.log(`   POST /api/analyze  →  Groq patient history analysis endpoint`);
    console.log(`   POST /api/analyze-pdf-text  →  Groq PDF report analysis endpoint`);
});
