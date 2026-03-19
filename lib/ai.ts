import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ResumeAnalysis {
  overallScore: number;
  recommendationLevel: "Accept" | "Improve" | "Reject";
  feedbackText: string;
  skills: Array<{ name: string; category: string }>;
  strengths: string[];
  improvements: string[];
}

export async function analyzeResume(
  resumeText: string,
  jobDescription?: string
): Promise<ResumeAnalysis> {
  const systemPrompt = `You are an expert HR professional and career coach who reviews resumes.
Analyze the provided resume and return a detailed JSON analysis. Be objective and constructive.

Always respond with valid JSON matching this exact structure:
{
  "overallScore": <number 0-100>,
  "recommendationLevel": <"Accept" | "Improve" | "Reject">,
  "feedbackText": <string: 2-3 sentence overall summary>,
  "skills": [{"name": <string>, "category": <string: "Technical" | "Soft" | "Domain" | "Tool">}],
  "strengths": [<string>, ...],
  "improvements": [<string>, ...]
}`;

  const userMessage = jobDescription
    ? `Please analyze this resume against the following job description:\n\nJOB DESCRIPTION:\n${jobDescription}\n\nRESUME:\n${resumeText}`
    : `Please analyze this resume:\n\nRESUME:\n${resumeText}`;

  const stream = client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    thinking: { type: "adaptive" },
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const message = await stream.finalMessage();

  let jsonText = "";
  for (const block of message.content) {
    if (block.type === "text") {
      jsonText = block.text;
      break;
    }
  }

  // Strip markdown code fences if present
  jsonText = jsonText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  const analysis = JSON.parse(jsonText) as ResumeAnalysis;
  return analysis;
}
