/**
 * AI Service - Calls backend AI API for document analysis
 * Uses ilmu-glm-5.1 via backend proxy
 */

const API_BASE_URL = "http://localhost:3001/api";

/**
 * Analyze text gaps with AI
 * Returns gaps with severity and AI analysis metadata
 */
export async function analyzeTextGapsWithAI(text) {
  try {
    if (!text) {
      throw new Error("Text is required");
    }

    const response = await fetch(`${API_BASE_URL}/analyze-gaps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.warning || "Failed to analyze text");
    }

    return {
      gaps: data.gaps || [],
      aiUnavailable: data.aiUnavailable || false,
      retryable: data.retryable || false,
      retryAfter: data.retryAfter,
      warning: data.warning || null
    };
  } catch (error) {
    console.error("AI Gap Analysis Error:", error);
    throw error;
  }
}
