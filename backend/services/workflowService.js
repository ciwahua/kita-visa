const { classifyVisa } = require("./glmService");

async function generateWorkflow(input) {
  const aiResult = await classifyVisa(input);

  return {
    visaType: aiResult.visaType,
    confidence: aiResult.confidence,
    reasoning: aiResult.reasoning,

    steps: [
      "Prepare passport copy",
      "Obtain university offer letter",
      "Complete medical screening",
      "Submit application via EMGS"
    ],

    nextAction: "Upload your offer letter"
  };
}

module.exports = { generateWorkflow };