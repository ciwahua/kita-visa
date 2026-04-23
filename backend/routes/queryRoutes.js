const express = require("express");
const { generateWorkflow } = require("../services/workflowService");

const router = express.Router();

// POST /api/query
router.post("/query", async (req, res) => {
  try {
    const { input } = req.body;

    // Basic validation (important for demo stability)
    if (!input || input.trim() === "") {
      return res.status(400).json({
        error: "Input is required"
      });
    }

    const result = await generateWorkflow(input);

    return res.json(result);

  } catch (error) {
    console.error("Query Route Error:", error.message);

    return res.status(500).json({
      error: "Failed to generate workflow",
      details: error.message
    });
  }
});

module.exports = router;