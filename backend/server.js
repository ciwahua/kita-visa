require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const queryRoutes = require("./routes/queryRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// health check
app.get("/", (req, res) => {
  res.send("KitaVisa API running");
});

// routes
app.use("/api", queryRoutes);

// AI test route
app.get("/api/test-ai", async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.ilmu.ai/v1/chat/completions",
      {
        model: "ilmu-glm-5.1",
        messages: [
          {
            role: "user",
            content: "Hello!"
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

    res.json(response.data);

  } catch (err) {
    console.error("FULL ERROR:", err.response?.data || err.message);

    res.status(500).json({
      error: "AI API call failed",
      details: err.response?.data || err.message
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});