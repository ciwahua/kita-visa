// ======================
// DECISION ENGINE
// ======================
function decideVisas(intent) {
  const { purpose, duration, job_type, bringing_family } = intent;
  const recommendations = [];

  switch (purpose) {
    case "tourism":
      recommendations.push("Social Visit Pass");
      break;
    case "study":
      recommendations.push("Student Pass");
      break;
    case "work":
      if (job_type === "professional") {
        recommendations.push("Employment Pass");
      } else if (job_type === "semi-skilled") {
        recommendations.push("Temporary Employment Pass");
      } else {
        // Default to Employment Pass if job_type not specified
        recommendations.push("Employment Pass");
      }
      break;
    case "family":
      // Family reunification might need Dependent Pass, but let's assume it's for dependents
      recommendations.push("Dependent Pass");
      break;
    default:
      // For other or unclear, suggest Social Visit Pass as fallback
      recommendations.push("Social Visit Pass");
      break;
  }

  if (bringing_family) {
    recommendations.push("Dependent Pass");
  }

  // Remove duplicates
  const uniqueRecommendations = [...new Set(recommendations)];

  return uniqueRecommendations;
}

module.exports = { decideVisas };