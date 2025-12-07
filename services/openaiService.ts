import OpenAI from "openai";
import { RFIDraftResponse, SubmittalReviewResponse, JHAResponse, ToolboxTalkResponse, MaintenancePredictionResponse } from "../types";

// Initialize OpenAI Client
// dangerouslyAllowBrowser: true is needed because we are running in a client-side Vite app.
// In a production app, you should proxy requests through a backend to protect your API key.
import openai from "./openaiProxyClient";

const MODEL_NAME = "gpt-4o";

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
    `;

    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: "You are a helpful construction project engineer assistant." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "rfi_draft",
          schema: {
            type: "object",
            properties: {
              subject: { type: "string" },
              formattedQuestion: { type: "string" },
              suggestedSolution: { type: "string" },
              impactAssessment: { type: "string" }
            },
            required: ["subject", "formattedQuestion", "suggestedSolution", "impactAssessment"],
            additionalProperties: false
          },
          strict: true
        }
      }
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No response from AI");
    return JSON.parse(content) as RFIDraftResponse;

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
    `;

    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: "You are a helpful construction submittal reviewer." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "submittal_review",
          schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              complianceStatus: { type: "string", enum: ["Compliant", "Deviations Noted", "Rejected"] },
              missingInformation: { type: "array", items: { type: "string" } },
              discrepancies: { type: "array", items: { type: "string" } },
              recommendation: { type: "string" }
            },
            required: ["summary", "complianceStatus", "missingInformation", "discrepancies", "recommendation"],
            additionalProperties: false
          },
          strict: true
        }
      }
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No response from AI");
    return JSON.parse(content) as SubmittalReviewResponse;

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

    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: "You are a safety officer assistant." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "jha_generation",
          schema: {
            type: "object",
            properties: {
              hazards: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    hazard: { type: "string" },
                    consequence: { type: "string" },
                    control: { type: "string" }
                  },
                  required: ["hazard", "consequence", "control"],
                  additionalProperties: false
                }
              },
              requiredPPE: { type: "array", items: { type: "string" } }
            },
            required: ["hazards", "requiredPPE"],
            additionalProperties: false
          },
          strict: true
        }
      }
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No response from AI");
    return JSON.parse(content) as JHAResponse;

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

    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: "You are a helpful construction daily log assistant." },
        { role: "user", content: prompt }
      ]
    });

    return completion.choices[0].message.content || notes;
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

    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: "You are a safety officer assistant." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "toolbox_talk",
          schema: {
            type: "object",
            properties: {
              topic: { type: "string" },
              keyPoints: { type: "array", items: { type: "string" } },
              discussionQuestions: { type: "array", items: { type: "string" } }
            },
            required: ["topic", "keyPoints", "discussionQuestions"],
            additionalProperties: false
          },
          strict: true
        }
      }
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No response from AI");
    return JSON.parse(content) as ToolboxTalkResponse;

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
    `;

    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: "You are a construction equipment maintenance expert." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "maintenance_prediction",
          schema: {
            type: "object",
            properties: {
              maintenanceNeeded: { type: "boolean" },
              reason: { type: "string" },
              recommendedAction: { type: "string" }
            },
            required: ["maintenanceNeeded", "reason", "recommendedAction"],
            additionalProperties: false
          },
          strict: true
        }
      }
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No response from AI");
    return JSON.parse(content) as MaintenancePredictionResponse;

  } catch (error) {
    console.error("Error predicting maintenance:", error);
    throw error;
  }
};
