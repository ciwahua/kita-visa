// ======================
// CONVERSATION SERVICE
// ======================
const { extractIntent } = require("./glmService");
const { decideVisas } = require("./decisionEngine");

// In-memory session storage (for demo; use Redis in production)
const sessions = new Map();

function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      history: [],
      current_recommendation: [],
      confirmed: false
    });
  }
  return sessions.get(sessionId);
}

async function processUserInput(sessionId, userInput) {
  const session = getSession(sessionId);

  // Append new input to history
  session.history.push(userInput);

  const intent = await extractIntent(session.history.join(" "));

  // Decide visas
  const recommendations = decideVisas(intent, session.history);

  // Update session
  session.current_recommendation = recommendations;

  // Handle clarity trigger based on confidence
  if (intent.confidence === "low") {
    return {
      message: "I need more information to help you better. Can you tell me more about your situation?",
      needsClarification: true,
      recommendation: []
    };
  } else {
    // medium or high: show suggestion + ask confirm
    const message = generateConfirmationMessage(recommendations);

    return {
      message,
      needsConfirmation: true,
      recommendation: recommendations
    };
  }
}

function generateConfirmationMessage(recommendations) {
  const visa = recommendations[0];

  return `Based on what you shared, you likely need a ${visa}. I can guide you through the requirements step by step.`;
}

function confirmRecommendation(sessionId) {
  const session = getSession(sessionId);
  session.confirmed = true;

  return {
    message: "Great! Let us guide you through the requirements.",
    confirmed: true,
    nextStep: "requirements_check"
  };
}

module.exports = { processUserInput, confirmRecommendation };