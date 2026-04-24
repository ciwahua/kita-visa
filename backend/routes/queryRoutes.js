const express = require("express");
const { classifyVisa, analyzeGaps } = require("../services/glmService");
const router = express.Router();

// POST /api/query
router.post("/query", async (req, res) => {
  try {
    const { input } = req.body;

    if (!input || input.trim() === "") {
      return res.status(400).json({
        error: "Input is required"
      });
    }

    // 🔥 YOUR NEW AI PIPELINE
    const visaResult = await classifyVisa(input);
    const gapResult = await analyzeGaps(input);

    return res.json({
      ...visaResult,
      gaps: gapResult.gaps || []
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