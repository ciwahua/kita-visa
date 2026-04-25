console.log("=== QUERY ROUTES LOADED ===");

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const { extractIntent, analyzeGaps, validateDocument, chatAssistant } = require("../services/glmService");
const router = express.Router();

// Setup multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const validMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    const validExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const hasValidMime = validMimes.includes(file.mimetype);
    const hasValidExt = validExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));
    
    if (hasValidMime || hasValidExt) {
      cb(null, true);
    } else {
      cb(null, true); // Allow anyway for testing
    }
  }
});

// Helper function to extract text from file buffer
// async function extractTextFromFile(fileBuffer, fileName) {
//   try {
//     // Simple extraction - for production, use pdfparse or similar
//     // For now, convert buffer to string
//     const text = fileBuffer.toString('utf8', 0, Math.min(fileBuffer.length, 10000));
//     return text.replace(/[^\x20-\x7E\n]/g, '').substring(0, 5000); // Clean text
//   } catch (err) {
//     console.error("Text extraction error:", err.message);
//     return "";
//   }
// }

async function extractTextFromFile(fileBuffer, fileName) {
  try {
    if (fileName.toLowerCase().endsWith(".pdf")) {
      const data = await pdfParse(fileBuffer); // ← just use it directly
      return data.text
        .replace(/\s+/g, " ")
        .replace(/[^\x20-\x7E]/g, "")
        .trim();
    }
    return fileBuffer.toString("utf8");
  } catch (err) {
    console.error("PDF extraction error:", err.message);
    return "";
  }
}

// Helper function to map AI purpose to visa type
function mapPurposeToVisaType(purpose) {
  const mapping = {
    student: "Student Pass",
    work: "Employment Pass",
    dependent: "Dependent Pass",
    social_visit: "Social Visit Pass",
    other: "Social Visit Pass" // fallback
  };
  return mapping[purpose] || "Social Visit Pass";
}

// POST /api/validate-documents
router.post("/validate-documents", upload.array("files", 10), async (req, res) => {
  try {
    const { input, sessionId } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: "No files uploaded",
        errors: ["Please upload at least one document"]
      });
    }

    // Extract visa type from input
    const intent = await extractIntent(input);
    const visaType = mapPurposeToVisaType(intent.purpose);

    // Validate each document
    const validatedFiles = [];
    const errors = [];

    for (const file of req.files) {
      try {
        const fileContent = await extractTextFromFile(file.buffer, file.originalname);
        
        if (!fileContent || fileContent.trim().length === 0) {
          errors.push(`${file.originalname}: Could not read file content`);
          continue;
        }

    //     const gapAnalysis = await analyzeGaps(fileContent, visaType);
        
    //     function extractFields(text) {
    //       return {
    //        institution: text.includes("Universiti Malaya") ? "Universiti Malaya" : "Unknown",
    //        program: text.includes("Master") ? "Master of Data Science" : "Unknown",
    //         applicantName: text.includes("Mr.") ? "Alex Johnson" : "Unknown"
    //      };
    // }

        const validation = await validateDocument(fileContent, file.originalname, visaType);

        if (validation.isValid && validation.confidence !== "low") {
          validatedFiles.push({
            fileName: file.originalname,
            documentType: validation.documentType,
            size: file.size,
            uploadedAt: new Date().toISOString()
          });
        } else {
          errors.push(`${file.originalname}: ${validation.summary || "Document validation failed"}`);
        }
      } catch (err) {
        console.error("File validation error:", err.message);
        errors.push(`${file.originalname}: Validation error - ${err.message}`);
      }
    }

    if (validatedFiles.length === 0) {
      return res.status(400).json({
        error: "No valid documents",
        errors: errors.length > 0 ? errors : ["Please upload valid documents"]
      });
    }

    return res.json({
      validatedFiles,
      errors: errors.length > 0 ? errors : [],
      message: `Successfully validated ${validatedFiles.length} document(s)`
    });

  } catch (error) {
    console.error("Document Validation Route Error:", error.message);

    return res.status(500).json({
      error: "Failed to validate documents",
      details: error.message
    });
  }
});

// POST /api/query
router.post("/query", async (req, res) => {
  try {
    const input = req.body.input || req.body.text;

    if (!input || input.trim() === "") {
      return res.status(400).json({
        error: "Input is required"
      });
    }

    // Use AI to extract intent
    const intent = await extractIntent(input);
    const visaType = mapPurposeToVisaType(intent.purpose);

    if (intent.confidence === "high" || intent.confidence === "medium") {
      return res.json({
        message: `Based on your situation, you likely need a ${visaType}. Is this correct?`,
        needsConfirmation: true,
        recommendation: [visaType]
      });
    }

    return res.json({
      message: "Could you clarify your purpose in Malaysia? (Study, Work, Family, Visit, or Dependent)",
      needsConfirmation: false,
      recommendation: []
    });

  } catch (error) {
    console.error("Query Route Error:", error.message);

    return res.status(500).json({
      error: "Failed to process query",
      details: error.message
    });
  }
});

// POST /api/analyze-gaps
router.post("/analyze-gaps", async (req, res) => {
  try {
    const { text, visaType } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        error: "Text input is required"
      });
    }

    const result = await analyzeGaps(text, visaType || "Unknown");

    return res.json(result);

  } catch (error) {
    console.error("Gap Analysis Route Error:", error.message);

    return res.status(500).json({
      error: "Failed to analyze gaps",
      details: error.message
    });
  }
});

router.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const reply = await chatAssistant(message, history);

    return res.json({
      answer: reply
    });

  } catch (error) {
    console.error("Chat Route Error:", error.message);

    return res.status(500).json({
      error: "Failed to process chat",
      details: error.message
    });
  }
});

module.exports = router;