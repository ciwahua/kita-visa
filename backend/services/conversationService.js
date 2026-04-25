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

  // Extract intent from the full history (or just latest? For now, latest)
  const intent = await extractIntent(userInput);

  // Decide visas
  const recommendations = decideVisas(intent);

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
    const response = generateConfirmationMessage(recommendations);
    return {
      message: response,
      needsConfirmation: true,
      recommendation: recommendations
    };
  }
}

function generateConfirmationMessage(recommendations) {
  if (recommendations.length === 1) {
    return `It looks like you're applying for a ${recommendations[0]}. Is this correct?`;
  } else if (recommendations.length === 2) {
    return `It looks like you're applying for a ${recommendations[0]}, and your spouse/family may need a ${recommendations[1]}. Is this correct?`;
  } else {
    const visaList = recommendations.slice(0, -1).join(", ") + " and " + recommendations[recommendations.length - 1];
    return `It looks like you're applying for ${visaList}. Is this correct?`;
  }
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