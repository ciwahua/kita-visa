const axios = require("axios");

async function classifyVisa(input) {
  try {
    const response = await axios.post(
      `${process.env.AI_BASE_URL}/chat/completions`,
      {
        model: "ilmu-glm-5.1",
        messages: [
          {
            role: "user",
            content: `
You are a visa classification system.

User input: ${input}

Return ONLY JSON:
{
  "visaType": "",
  "confidence": 0,
  "reasoning": []
}
            `
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

    return response.data.message.content;
  } catch (err) {
    console.error("AI Error:", err.response?.data || err.message);

    return {
      visaType: "Unknown",
      confidence: 0,
      reasoning: ["API call failed"]
    };
  }
}

module.exports = { classifyVisa };