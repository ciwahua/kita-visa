console.log("SIMPLE ROUTES LOADED");

const express = require("express");
const router = express.Router();

// Simple test route
router.post("/test", (req, res) => {
  console.log("TEST ROUTE HIT");
  res.json({ message: "test route works" });
});

module.exports = router;