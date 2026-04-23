const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("KitaVisa API running");
});

// Main endpoint
app.post("/api/query", (req, res) => {
  const { input } = req.body;

  const response = {
    visaType: "Student Pass",
    summary: `Detected intent from input: "${input}"`,
    steps: [
      "Prepare passport copy",
      "Obtain university offer letter",
      "Complete medical screening",
      "Submit application via EMGS"
    ],
    nextAction: "Upload your offer letter"
  };

  res.json(response);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});