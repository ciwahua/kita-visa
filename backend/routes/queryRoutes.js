const express = require("express");
const { processUserInput, confirmRecommendation } = require("../services/conversationService");
const { analyzeGaps } = require("../services/glmService");
const router = express.Router();

// POST /api/query
router.post("/query", async (req, res) => {
  try {
    const { input, sessionId } = req.body;

    if (!input || input.trim() === "") {
      return res.status(400).json({
        error: "Input is required"
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        error: "Session ID is required"
      });
    }

    const result = await processUserInput(sessionId, input);

    return res.json(result);

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
    const { text } = req.body;

    // Basic validation
    if (!text || text.trim() === "") {
      return res.status(400).json({
        error: "Text input is required"
      });
    }

    const result = await analyzeGaps(text);

    return res.json(result);

  } catch (error) {
    console.error("Gap Analysis Route Error:", error.message);

    return res.status(500).json({
      error: "Failed to analyze gaps",
      details: error.message
    });
  }
});

module.exports = router;