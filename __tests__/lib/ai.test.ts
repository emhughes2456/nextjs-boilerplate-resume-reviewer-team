/**
 * @jest-environment node
 */

// jest.mock is hoisted above imports, so mocks are in place before lib/ai.ts loads
jest.mock("@anthropic-ai/sdk", () => {
  const mockFinalMessage = jest.fn();
  const mockStream = jest.fn(() => ({ finalMessage: mockFinalMessage }));
  return {
    default: jest.fn(() => ({ messages: { stream: mockStream } })),
    _mockFinalMessage: mockFinalMessage,
    _mockStream: mockStream,
  };
});

import { analyzeResume, ResumeAnalysis } from "@/lib/ai";

const validAnalysis: ResumeAnalysis = {
  overallScore: 85,
  recommendationLevel: "Accept",
  feedbackText: "Strong candidate with relevant experience.",
  skills: [{ name: "TypeScript", category: "Technical" }],
  strengths: ["Strong TypeScript skills", "Good communication"],
  improvements: ["Add more project examples"],
};

describe("analyzeResume", () => {
  let mockStream: jest.Mock;
  let mockFinalMessage: jest.Mock;

  beforeEach(() => {
    const sdk = jest.requireMock("@anthropic-ai/sdk");
    mockStream = sdk._mockStream;
    mockFinalMessage = sdk._mockFinalMessage;
    jest.clearAllMocks();
    // Re-attach mockFinalMessage after clearAllMocks resets the implementation
    mockStream.mockImplementation(() => ({ finalMessage: mockFinalMessage }));
    mockFinalMessage.mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify(validAnalysis) }],
    });
  });

  it("returns parsed analysis from a plain JSON response", async () => {
    const result = await analyzeResume("John Doe - Software Engineer");
    expect(result).toEqual(validAnalysis);
  });

  it("strips ```json code fences from response", async () => {
    mockFinalMessage.mockResolvedValue({
      content: [
        {
          type: "text",
          text: "```json\n" + JSON.stringify(validAnalysis) + "\n```",
        },
      ],
    });
    const result = await analyzeResume("resume text");
    expect(result).toEqual(validAnalysis);
  });

  it("strips plain ``` code fences from response", async () => {
    mockFinalMessage.mockResolvedValue({
      content: [
        {
          type: "text",
          text: "```\n" + JSON.stringify(validAnalysis) + "\n```",
        },
      ],
    });
    const result = await analyzeResume("resume text");
    expect(result).toEqual(validAnalysis);
  });

  it("passes resume text to the API message", async () => {
    await analyzeResume("My unique resume content");
    const callArg = mockStream.mock.calls[0][0];
    expect(callArg.messages[0].content).toContain("My unique resume content");
  });

  it("includes job description in message when provided", async () => {
    await analyzeResume("resume text", "Senior Engineer - must know React");
    const callArg = mockStream.mock.calls[0][0];
    expect(callArg.messages[0].content).toContain("JOB DESCRIPTION");
    expect(callArg.messages[0].content).toContain(
      "Senior Engineer - must know React"
    );
  });

  it("does not include JOB DESCRIPTION when no job is provided", async () => {
    await analyzeResume("resume text");
    const callArg = mockStream.mock.calls[0][0];
    expect(callArg.messages[0].content).not.toContain("JOB DESCRIPTION");
  });

  it("uses claude-opus-4-6 model", async () => {
    await analyzeResume("resume");
    expect(mockStream).toHaveBeenCalledWith(
      expect.objectContaining({ model: "claude-opus-4-6" })
    );
  });

  it("ignores non-text content blocks and uses the first text block", async () => {
    mockFinalMessage.mockResolvedValue({
      content: [
        { type: "thinking", thinking: "Let me think..." },
        { type: "text", text: JSON.stringify(validAnalysis) },
      ],
    });
    const result = await analyzeResume("resume text");
    expect(result).toEqual(validAnalysis);
  });

  it("throws when the response is not valid JSON", async () => {
    mockFinalMessage.mockResolvedValue({
      content: [{ type: "text", text: "This is not JSON at all." }],
    });
    await expect(analyzeResume("resume text")).rejects.toThrow();
  });
});
