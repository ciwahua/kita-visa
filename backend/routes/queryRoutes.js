const express = require("express");
const { classifyIntent } = require("../services/intentClassifier");
const { analyzeGaps } = require("../services/glmService");
const { confirmRecommendation } = require("../services/conversationService");
const router = express.Router();

// POST /api/query
router.post("/query", async (req, res) => {
  try {
    const input = req.body.input || req.body.text;

    console.log("INPUT:", input);

    if (!input || input.trim() === "") {
      return res.status(400).json({
        error: "Input is required"
      });
    }

    const intent = classifyIntent(input);
    console.log("INTENT RESULT:", intent);

    if (intent.confidence === "high") {
      return res.json({
        message: `It looks like you're applying for a ${intent.primary}. Is this correct?`,
        needsConfirmation: true,
        recommendation: intent.visaTypes
      });
    }

    return res.json({
      message: "Could you clarify your purpose in Malaysia? (Study, Work, Family)",
      needsConfirmation: false
    });

  } catch (error) {
    console.error("Query Route Error:", error.message);

    return res.status(500).json({
      error: "Failed to process query",
      details: error.message
    });
  }
});

// POST /api/confirm
router.post("/confirm", async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        error: "Session ID is required"
      });
    }

    const result = confirmRecommendation(sessionId);

    return res.json(result);

  } catch (error) {
    console.error("Confirm Route Error:", error.message);

    return res.status(500).json({
      error: "Failed to confirm",
      details: error.message
    });
  }
});

// POST /api/analyze-gaps
router.post("/analyze-gaps", async (req, res) => {
  try {
    const { text, visaTypes } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        error: "Text input is required"
      });
    }

    const result = await analyzeGaps(text, visaTypes || ["Unknown"]);

    return res.json({
      visaTypes: visaTypes || ["Unknown"],
      explanation: `Gap analysis for ${Array.isArray(visaTypes) ? visaTypes.join(", ") : visaTypes}`,
      ...result
    });

  } catch (error) {
    console.error("Gap Analysis Route Error:", error.message);

    return res.status(500).json({
      error: "Failed to analyze gaps",
      details: error.message
    });
  }
});

module.exports = router;