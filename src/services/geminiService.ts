import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface JobData {
  title: string;
  jd: string;
  traits: string;
}

export interface InterviewResponse {
  question: string;
  answer: string;
}

export async function generateInterviewQuestions(job: JobData) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on the following Job Description and core traits, generate 5-8 professional interview questions. 
    Use Google Search to find industry-specific trends and key competencies for this role.
    
    Job Title: ${job.title}
    Job Description: ${job.jd}
    Core Traits Needed: ${job.traits}
    
    Return the questions as a JSON array of strings.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  return JSON.parse(response.text || "[]");
}

export async function evaluateInterview(job: JobData, responses: InterviewResponse[]) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Evaluate the following candidate's interview responses for the role of ${job.title}.
    
    Job Description: ${job.jd}
    Core Traits: ${job.traits}
    
    Interview Responses:
    ${responses.map((r, i) => `Q${i+1}: ${r.question}\nA: ${r.answer}`).join('\n\n')}
    
    Provide a score (0-100) and a detailed assessment including strengths, weaknesses, and a final recommendation.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER },
          assessment: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendation: { type: Type.STRING }
        },
        required: ["score", "assessment", "strengths", "weaknesses", "recommendation"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
