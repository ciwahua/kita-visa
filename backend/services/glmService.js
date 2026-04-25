const axios = require("axios");

// EXTRACT INTENT
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
          timeout: 30000 // 30 second timeout
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty AI response");

      const match = content.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON found in response");
      const parsed = JSON.parse(match[0]);

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
      console.error(`Extract Intent attempt ${attempt} failed:`, {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        headers: err.config?.headers
      });
    }
  }

  console.error("All extractIntent attempts failed:", {
    message: lastError?.message,
    status: lastError?.response?.status,
    data: lastError?.response?.data
  });

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
        timeout: 30000 // 30 second timeout for gap analysis
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
        "admissionLetter",
        "financialProof",
        "accommodationProof",
        "employmentOffer",
        "workContract",
        "companyDetails",
        "employerDetails",
        "workPermit",
        "proofOfRelationship",
        "sponsorVisa",
        "returnTicket",
        "healthInsurance",
        "offerType",
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

// VALIDATE DOCUMENTS
async function validateDocument(fileContent, fileName, visaPurpose = "Unknown") {
  try {
    // Ensure content is not too large
    const maxLength = 2000;
    const truncatedContent = fileContent.substring(0, maxLength);

    const response = await axios.post(
      `${process.env.AI_BASE_URL}/chat/completions`,
      {
        model: "ilmu-glm-5.1",
        messages: [
          {
            role: "system",
            content: `You are a document validation system for visa applications.

Your job is to verify if an uploaded document is legitimate and relevant for a ${visaPurpose} visa application.

IMPORTANT: Check if the document is REAL and contains actual meaningful content, not just a placeholder or blank file.

You MUST return ONLY valid JSON:
{
  "isValid": true/false,
  "documentType": "string (e.g., 'Offer Letter', 'Admission Letter', 'Passport', etc.)",
  "relevantToVisa": true/false,
  "confidence": "high/medium/low",
  "issues": ["array of issues if any"],
  "summary": "brief explanation"
}

VALIDATION RULES:
- Document must have substantial content (not blank or placeholder)
- Must be relevant to the visa type or general visa application
- Check for actual information (names, dates, organizations, etc.)
- Flag if it appears to be a template or dummy file
- Flag if content doesn't match the file name`
          },
          {
            role: "user",
            content: `File: ${fileName}\nContent:\n${truncatedContent}`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GLM_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000 // 30 second timeout for document validation
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty AI validation response");

    const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      fileName,
      isValid: parsed.isValid === true,
      documentType: parsed.documentType || "Unknown",
      relevantToVisa: parsed.relevantToVisa !== false,
      confidence: parsed.confidence || "low",
      issues: parsed.issues || [],
      summary: parsed.summary || ""
    };

  } catch (err) {
    console.error("Document Validation Error:", err.message);
    return {
      fileName,
      isValid: false,
      documentType: "Unknown",
      relevantToVisa: false,
      confidence: "low",
      issues: ["Failed to validate document: " + err.message],
      summary: "Validation error occurred"
    };
  }
}

async function chatAssistant(message, history = []) {
    const lower = message.toLowerCase();

  try {
    const response = await axios.post(
      `${process.env.AI_BASE_URL}/chat/completions`,
      {
        model: "ilmu-glm-5.1",
        messages: [
          {
            role: "system",
            content: `

            You are a friendly Malaysian visa assistant.

Context: You are assisting users with questions about Malaysian visa applications.
there are 5 types of visas covered:
-Student
-Long-term employment
-Short-term employment
-Dependent
-Social visit

Your job:
- Answer user questions conversationally
- Explain visa requirements clearly
- Help users understand their situation



DO NOT return JSON.
DO NOT return structured fields.
Respond like a helpful human assistant.
            `
          },
          ...history,
          {
            role: "user",
            content: message
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

    return response.data?.choices?.[0]?.message?.content || "I couldn't generate a response.";
  } catch (err) {
    console.error("Chat Assistant Error:", err.message);
    return "Sorry, I had trouble responding. Please try again.";
  }
}

module.exports = { 
  extractIntent, 
  classifyVisa, 
  analyzeGaps,
  chatAssistant,
  validateDocument 
};