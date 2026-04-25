function classifyIntent(text) {
  const t = text.toLowerCase();

  // STUDENT
  if (
    t.includes("universiti") ||
    t.includes("university") ||
    t.includes("college") ||
    t.includes("study") ||
    t.includes("admission") ||
    t.includes("accepted")
  ) {
    return {
      visaType: "Student Pass",
      confidence: "high",
      reason: "Detected study-related intent"
    };
  }

  // EMPLOYMENT (skilled)
  if (
    t.includes("engineer") ||
    t.includes("developer") ||
    t.includes("professional") ||
    t.includes("job") ||
    t.includes("job offer") ||
    t.includes("company") ||
    t.includes("salary")
  ) {
    return {
      visaType: "Employment Pass",
      confidence: "high",
      reason: "Detected work-related intent"
    };
  }

  // TEMP EMPLOYMENT (low-skilled)
  if (
    t.includes("construction") ||
    t.includes("factory") ||
    t.includes("labor") ||
    t.includes("temporary job")
  ) {
    return {
      visaType: "Temporary Employment Pass",
      confidence: "high",
      reason: "Detected temporary work-related intent"
    };
  }

  // DEPENDENT
  if (
    t.includes("spouse") ||
    t.includes("wife") ||
    t.includes("husband") ||
    t.includes("child") ||
    t.includes("family") ||
    t.includes("brother") ||
    t.includes("sister")
  ) {
    return {
      visaType: "Dependent Pass",
      confidence: "high",
      reason: "Detected family/dependent-related intent"
    };
  }

  // SOCIAL VISIT (fallback)
  if (
    t.includes("visit") ||
    t.includes("tourism") ||
    t.includes("holiday") ||
    t.includes("travel")
  ) {
    return {
      visaType: "Social Visit Pass",
      confidence: "high",
      reason: "Detected visit/tourism-related intent"
    };
  }

  return {
    visaType: "Unknown",
    confidence: "low",
    reason: "No clear intent detected"
  };
}

module.exports = { classifyIntent };