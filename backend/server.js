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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});