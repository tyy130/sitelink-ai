
import { GoogleGenAI, Type } from "@google/genai";
import { RFIDraftResponse, SubmittalReviewResponse, JHAResponse, ToolboxTalkResponse, MaintenancePredictionResponse } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

/**
 * Drafts a professional Construction RFI based on raw notes.
 */
export const draftRFI = async (
  context: string,
  drawingRef: string,
  specRef: string
): Promise<RFIDraftResponse> => {
  try {
    const prompt = `
      You are a Senior Project Engineer. Draft a formal RFI based on these notes.
      Ref: ${drawingRef}, ${specRef}.
      Notes: "${context}"
      Return JSON with subject, formattedQuestion, suggestedSolution, impactAssessment.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            formattedQuestion: { type: Type.STRING },
            suggestedSolution: { type: Type.STRING },
            impactAssessment: { type: Type.STRING }
          },
          required: ["subject", "formattedQuestion", "suggestedSolution", "impactAssessment"]
        }
      }
    });

    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text) as RFIDraftResponse;

  } catch (error) {
    console.error("Error drafting RFI:", error);
    throw error;
  }
};

/**
 * Analyzes submittal data against specification text.
 */
export const reviewSubmittal = async (
  specText: string,
  productData: string
): Promise<SubmittalReviewResponse> => {
  try {
    const prompt = `
      Compare Product Data vs Spec.
      Spec: "${specText.substring(0, 5000)}" 
      Product: "${productData.substring(0, 5000)}"
      Return JSON analysis.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            complianceStatus: { type: Type.STRING, enum: ["Compliant", "Deviations Noted", "Rejected"] },
            missingInformation: { type: Type.ARRAY, items: { type: Type.STRING } },
            discrepancies: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendation: { type: Type.STRING }
          },
          required: ["summary", "complianceStatus", "missingInformation", "discrepancies", "recommendation"]
        }
      }
    });

    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text) as SubmittalReviewResponse;

  } catch (error) {
    console.error("Error reviewing submittal:", error);
    throw error;
  }
};

/**
 * Generates a Job Hazard Analysis (JHA) based on a task description.
 */
export const generateJHA = async (taskDescription: string): Promise<JHAResponse> => {
  try {
    const prompt = `
      Create a Job Hazard Analysis (JHA) for the construction task: "${taskDescription}".
      Identify at least 3 specific hazards, their consequences, and specific control measures (engineering or administrative).
      List required Personal Protective Equipment (PPE).
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hazards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  hazard: { type: Type.STRING },
                  consequence: { type: Type.STRING },
                  control: { type: Type.STRING }
                }
              }
            },
            requiredPPE: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["hazards", "requiredPPE"]
        }
      }
    });

    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text) as JHAResponse;

  } catch (error) {
    console.error("Error generating JHA:", error);
    throw error;
  }
};

/**
 * Polishes rough daily log notes into a professional summary.
 */
export const polishDailyLog = async (notes: string): Promise<string> => {
  try {
    const prompt = `
      Rewrite the following rough construction daily log notes into a professional, clear, and grammatically correct report paragraph.
      Keep it factual and concise.
      
      Rough Notes: "${notes}"
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "text/plain",
      }
    });

    return response.text || notes;
  } catch (error) {
    console.error("Error polishing log:", error);
    return notes;
  }
};

/**
 * Generates a Safety Toolbox Talk based on a topic.
 */
export const generateToolboxTalk = async (topic: string): Promise<ToolboxTalkResponse> => {
  try {
    const prompt = `
      Create a construction safety toolbox talk for the topic: "${topic}".
      Provide 3-5 key safety points to cover.
      Provide 2-3 discussion questions to ask the crew.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            discussionQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["topic", "keyPoints", "discussionQuestions"]
        }
      }
    });

    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text) as ToolboxTalkResponse;

  } catch (error) {
    console.error("Error generating Toolbox Talk:", error);
    throw error;
  }
};

/**
 * Predicts maintenance needs for construction equipment based on usage.
 */
export const predictMaintenance = async (
  equipmentName: string,
  type: string,
  hours: number
): Promise<MaintenancePredictionResponse> => {
  try {
    const prompt = `
      Analyze maintenance needs for a piece of construction equipment.
      Equipment: ${equipmentName} (${type})
      Current Hours: ${hours}
      
      Based on typical industry standards for this equipment type, is maintenance likely needed or recommended soon?
      Return a JSON object with boolean 'maintenanceNeeded', a short 'reason' (e.g., "Oil change typically required at 500 hrs"), and 'recommendedAction'.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            maintenanceNeeded: { type: Type.BOOLEAN },
            reason: { type: Type.STRING },
            recommendedAction: { type: Type.STRING }
          },
          required: ["maintenanceNeeded", "reason", "recommendedAction"]
        }
      }
    });

    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text) as MaintenancePredictionResponse;

  } catch (error) {
    console.error("Error predicting maintenance:", error);
    throw error;
  }
};
