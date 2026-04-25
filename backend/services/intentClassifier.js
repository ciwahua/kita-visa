function classifyIntent(text) {
  const t = text.toLowerCase();

  const visaTypes = [];

  // STUDENT
  if (
    t.includes("universiti") ||
    t.includes("university") ||
    t.includes("college") ||
    t.includes("study") ||
    t.includes("admission") ||
    t.includes("accepted")
  ) {
    visaTypes.push("Student Pass");
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
    visaTypes.push("Employment Pass");
  }

  // TEMP EMPLOYMENT (low-skilled)
  if (
    t.includes("construction") ||
    t.includes("factory") ||
    t.includes("labor") ||
    t.includes("temporary job")
  ) {
    visaTypes.push("Temporary Employment Pass");
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
    visaTypes.push("Dependent Pass");
  }

  // SOCIAL VISIT (fallback)
  if (
    t.includes("visit") ||
    t.includes("tourism") ||
    t.includes("holiday") ||
    t.includes("travel")
  ) {
    visaTypes.push("Social Visit Pass");
  }

  // PRIORITY
  let primary = "Unknown";

  if (visaTypes.includes("Student Pass")) primary = "Student Pass";
  else if (visaTypes.includes("Employment Pass")) primary = "Employment Pass";
  else if (visaTypes.includes("Temporary Employment Pass")) primary = "Temporary Employment Pass";
  else if (visaTypes.includes("Social Visit Pass")) primary = "Social Visit Pass";

  return {
    visaTypes,
    primary,
    confidence: visaTypes.length ? "high" : "low"
  };
}

module.exports = { classifyIntent };