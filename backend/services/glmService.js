const axios = require("axios");

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
// ANALYZE GAPS (your version)
// ======================
async function analyzeGaps(text) {
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
        }
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
module.exports = { classifyVisa, analyzeGaps };