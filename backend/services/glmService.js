const axios = require("axios");

// ======================
// EXTRACT INTENT
// ======================
async function extractIntent(text) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post(
        `${process.env.AI_BASE_URL}/chat/completions`,
        {
          model: "ilmu-glm-5.1",
          messages: [
            {
              role: "system",
              content: `
                You are a visa intent understanding system for Malaysia.

                Your job is to understand the meaning of the user's message.

                Do NOT rely on keywords only.
                Do NOT assume strict rule matching.

                You must infer intent from context.

                VALID PURPOSES:
                - student
                - work
                - dependent
                - social_visit
                - other

                RULES:
                - Always choose ONE primary purpose (most dominant intent)
                - If multiple are mentioned, choose the main goal of the user
                - If unclear, choose "other"
                - Prefer understanding over literal keyword matching

                OUTPUT STRICT JSON ONLY:
                {
                  "purpose": "student | work | dependent | social_visit | other",
                  "confidence": "high | medium | low"
                }
              `
            },
            {
              role: "user",
              content: text
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GLM_API_KEY}`,
            "Content-Type": "application/json"
          },
          timeout: 20000 // 20 second timeout
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty AI response");

      const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      return {
        purpose: ["student", "work", "dependent", "social_visit", "other"].includes(parsed.purpose)
          ? parsed.purpose
          : "other",
        confidence: ["high", "medium", "low"].includes(parsed.confidence)
          ? parsed.confidence
          : "low"
      };

    } catch (err) {
      lastError = err;
      console.error(`Extract Intent attempt ${attempt} failed:`, err.message);
    }
  }

  console.error("All extractIntent attempts failed:", lastError?.message);

  return {
    purpose: "other",
    confidence: "low"
  };
}

// ======================
// CLASSIFY VISA
// ======================
async function classifyVisa(text) {
  try {
    const response = await axios.post(
      `${process.env.AI_BASE_URL}/chat/completions`,
      {
        model: "ilmu-glm-5.1",
        messages: [
          {
            role: "system",
            content: `
You are a strict JSON generator.

Return ONLY valid JSON.
NO explanation.
NO markdown.
NO text before or after.



Format:
{
  "visaType": "string",
  "summary": "string"
}
            `
          },
          {
            role: "user",
            content: text
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GLM_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;

    if (!content) {
      console.error("Empty classifyVisa response:", response.data);
      return { visaType: "Unknown", summary: "" };
    }

    try {
      return JSON.parse(content);
    } catch (err) {
      console.error("Failed to parse classifyVisa:", content);
      return { visaType: "Unknown", summary: "" };
    }

  } catch (err) {
    console.error("Classify Visa Error:", err.response?.data || err.message);
    return { visaType: "Unknown", summary: "" };
  }
}

// ======================
// ANALYZE GAPS
// ======================
async function analyzeGaps(text, visaType = "Unknown") {
  try {
    const response = await axios.post(
      `${process.env.AI_BASE_URL}/chat/completions`,
      {
        model: "ilmu-glm-5.1",
        messages: [
          {
            role: "system",
            content: `
You are a strict visa application gap analysis engine.

The user is applying for: ${visaType}.

You MUST analyze requirements for the pass.

Requirements:

Student Pass:
- passportNumber
- admissionLetter
- financialProof
- accommodationProof

Employment Pass:
- passportNumber
- employmentOffer
- workContract
- companyDetails

Temporary Employment Pass:
- passportNumber
- employerDetails
- workPermit

Dependent Pass:
- passportNumber
- proofOfRelationship
- sponsorVisa

Social Visit Pass:
- passportNumber
- returnTicket
- accommodationProof

RULES:
- If a requirement is NOT mentioned → create a gap
- DO NOT skip gaps
- ALWAYS return at least 2–3 gaps unless fully complete

IMPORTANT:
You MUST use ONLY these exact field names:

- passportNumber
- financialProof
- offerType
- admissionLetter
- accommodationProof
- healthInsurance
- otherDocuments

Return ONLY valid JSON:
{
  "gaps": [
    {
      "field": "passportNumber",
      "message": "string",
      "status": "pending",
      "severity": "low | medium | high",
      "reason": "string",
      "aiGenerated": true
    }
  ]
}
`
          },
          {
            role: "user",
            content: text
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GLM_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 15000 // 15 second timeout for gap analysis
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;

    if (!content) {
      console.error("Empty AI response:", response.data);
      return { gaps: [] };
    }

    const cleaned = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      const parsed = JSON.parse(cleaned);

      const allowedFields = [
        "passportNumber",
        "financialProof",
        "offerType",
        "admissionLetter",
        "accommodationProof",
        "healthInsurance",
        "otherDocuments"
      ];

      parsed.gaps = (parsed.gaps || []).map((gap) => ({
        ...gap,
        field: allowedFields.includes(gap.field)
          ? gap.field
          : "otherDocuments"
      }));

      return parsed;

    } catch (err) {
      console.error("Failed to parse AI response:", content);
      return { gaps: [] };
    }

  } catch (err) {
    console.error("AI Gap Analysis Error:", err.response?.data || err.message);
    return { gaps: [] };
  }
}

// ✅ IMPORTANT
module.exports = { extractIntent, classifyVisa, analyzeGaps };