/**
 * @jest-environment node
 */

jest.mock("@/lib/db", () => ({
  prisma: {
    resume: { findMany: jest.fn(), create: jest.fn() },
    review: { create: jest.fn() },
    jobPosting: { findUnique: jest.fn() },
    skill: { findFirst: jest.fn(), create: jest.fn() },
    resumeSkill: { create: jest.fn() },
    applicant: { upsert: jest.fn() },
  },
}));

jest.mock("@/lib/ai", () => ({
  analyzeResume: jest.fn(),
}));

jest.mock("pdf-parse", () => jest.fn());

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status ?? 200 })),
  },
  NextRequest: jest.fn(),
}));

import { GET, POST } from "@/app/api/resumes/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { analyzeResume } from "@/lib/ai";

const mockedJson = NextResponse.json as jest.Mock;
const mockedResumeFindMany = prisma.resume.findMany as jest.Mock;
const mockedResumeCreate = prisma.resume.create as jest.Mock;
const mockedReviewCreate = prisma.review.create as jest.Mock;
const mockedJobPostingFindUnique = prisma.jobPosting.findUnique as jest.Mock;
const mockedSkillFindFirst = prisma.skill.findFirst as jest.Mock;
const mockedSkillCreate = prisma.skill.create as jest.Mock;
const mockedResumeSkillCreate = prisma.resumeSkill.create as jest.Mock;
const mockedApplicantUpsert = prisma.applicant.upsert as jest.Mock;
const mockedAnalyzeResume = analyzeResume as jest.Mock;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockPdfParse = require("pdf-parse") as jest.Mock;

const sampleAnalysis = {
  overallScore: 80,
  recommendationLevel: "Accept",
  feedbackText: "Great resume.",
  skills: [{ name: "JavaScript", category: "Technical" }],
  strengths: ["Strong JS skills"],
  improvements: ["Add tests"],
};

/** Build a minimal mock NextRequest with a FormData body. */
function makePostRequest(entries: Record<string, unknown>) {
  const formData = { get: jest.fn((key: string) => entries[key] ?? null) };
  return { formData: jest.fn().mockResolvedValue(formData) };
}

/** Build a minimal mock File object. */
function makeFile(name: string, type: string, content: string) {
  return {
    name,
    type,
    arrayBuffer: jest.fn().mockResolvedValue(Buffer.from(content)),
  };
}

// ---------------------------------------------------------------------------
// GET /api/resumes
// ---------------------------------------------------------------------------
describe("GET /api/resumes", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns resumes for the mock applicant", async () => {
    const mockResumes = [{ resumeId: 1, fileName: "cv.pdf", reviews: [] }];
    mockedResumeFindMany.mockResolvedValue(mockResumes);

    await GET();

    expect(mockedJson).toHaveBeenCalledWith(mockResumes);
  });

  it("queries with applicantId = 1 (mock auth)", async () => {
    mockedResumeFindMany.mockResolvedValue([]);

    await GET();

    expect(mockedResumeFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { applicantId: 1 } })
    );
  });

  it("returns 500 on database error", async () => {
    mockedResumeFindMany.mockRejectedValue(new Error("DB error"));

    await GET();

    expect(mockedJson).toHaveBeenCalledWith(
      { error: "Failed to fetch resumes" },
      { status: 500 }
    );
  });
});

// ---------------------------------------------------------------------------
// POST /api/resumes
// ---------------------------------------------------------------------------
describe("POST /api/resumes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedApplicantUpsert.mockResolvedValue({});
    mockedResumeCreate.mockResolvedValue({
      resumeId: 42,
      fileName: "resume.txt",
    });
    mockedReviewCreate.mockResolvedValue({ reviewId: 1 });
    mockedSkillFindFirst.mockResolvedValue(null);
    mockedSkillCreate.mockResolvedValue({ skillId: 1, skillName: "JavaScript" });
    mockedResumeSkillCreate.mockResolvedValue({});
    mockedAnalyzeResume.mockResolvedValue(sampleAnalysis);
  });

  it("returns 400 when no file is provided", async () => {
    const request = makePostRequest({ file: null });

    await POST(request as any);

    expect(mockedJson).toHaveBeenCalledWith(
      { error: "No file provided" },
      { status: 400 }
    );
  });

  it("returns 400 for an unsupported file type", async () => {
    const file = makeFile("resume.exe", "application/octet-stream", "content");
    const request = makePostRequest({ file });

    await POST(request as any);

    expect(mockedJson).toHaveBeenCalledWith(
      { error: "Only PDF, TXT, DOC, and DOCX files are supported" },
      { status: 400 }
    );
  });

  it("returns 400 when extracted text is empty", async () => {
    const file = makeFile("resume.txt", "text/plain", "   ");
    const request = makePostRequest({ file });

    await POST(request as any);

    expect(mockedJson).toHaveBeenCalledWith(
      { error: "Could not extract text from the file" },
      { status: 400 }
    );
  });

  it("processes a plain text file and returns 201 with result", async () => {
    const file = makeFile("resume.txt", "text/plain", "John Doe\nSoftware Engineer");
    const request = makePostRequest({ file });

    await POST(request as any);

    expect(mockedAnalyzeResume).toHaveBeenCalledWith(
      "John Doe\nSoftware Engineer",
      undefined
    );
    expect(mockedJson).toHaveBeenCalledWith(
      expect.objectContaining({
        resume: expect.objectContaining({ resumeId: 42 }),
        review: expect.objectContaining({ reviewId: 1 }),
        analysis: expect.objectContaining({
          strengths: sampleAnalysis.strengths,
          improvements: sampleAnalysis.improvements,
          skills: sampleAnalysis.skills,
        }),
      }),
      { status: 201 }
    );
  });

  it("extracts text from PDF using pdf-parse", async () => {
    mockPdfParse.mockResolvedValue({ text: "Extracted PDF text" });
    const file = makeFile("resume.pdf", "application/pdf", "%PDF-content");
    const request = makePostRequest({ file });

    await POST(request as any);

    expect(mockPdfParse).toHaveBeenCalled();
    expect(mockedAnalyzeResume).toHaveBeenCalledWith(
      "Extracted PDF text",
      undefined
    );
  });

  it("accepts DOC files by MIME type", async () => {
    const file = makeFile("resume.doc", "application/msword", "DOC content here");
    const request = makePostRequest({ file });

    await POST(request as any);

    expect(mockedAnalyzeResume).toHaveBeenCalledWith("DOC content here", undefined);
  });

  it("accepts DOCX files by MIME type", async () => {
    const file = makeFile(
      "resume.docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "DOCX content here"
    );
    const request = makePostRequest({ file });

    await POST(request as any);

    expect(mockedAnalyzeResume).toHaveBeenCalledWith("DOCX content here", undefined);
  });

  it("fetches job description when jobPostingId is provided", async () => {
    mockedJobPostingFindUnique.mockResolvedValue({
      jobId: 5,
      jobTitle: "Senior Dev",
      jobDescription: "Write great code",
    });
    const file = makeFile("resume.txt", "text/plain", "John Doe resume");
    const request = makePostRequest({ file, jobPostingId: "5" });

    await POST(request as any);

    expect(mockedJobPostingFindUnique).toHaveBeenCalledWith({
      where: { jobId: 5 },
    });
    expect(mockedAnalyzeResume).toHaveBeenCalledWith(
      "John Doe resume",
      "Senior Dev\n\nWrite great code"
    );
  });

  it("skips job description when job posting is not found", async () => {
    mockedJobPostingFindUnique.mockResolvedValue(null);
    const file = makeFile("resume.txt", "text/plain", "resume content");
    const request = makePostRequest({ file, jobPostingId: "999" });

    await POST(request as any);

    expect(mockedAnalyzeResume).toHaveBeenCalledWith("resume content", undefined);
  });

  it("creates a skill from AI analysis when skill does not exist", async () => {
    mockedSkillFindFirst.mockResolvedValue(null);
    const file = makeFile("resume.txt", "text/plain", "resume content");
    const request = makePostRequest({ file });

    await POST(request as any);

    expect(mockedSkillCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { skillName: "JavaScript", skillCategory: "Technical" },
      })
    );
  });

  it("reuses an existing skill when it already exists", async () => {
    mockedSkillFindFirst.mockResolvedValue({ skillId: 7, skillName: "JavaScript" });
    const file = makeFile("resume.txt", "text/plain", "resume content");
    const request = makePostRequest({ file });

    await POST(request as any);

    expect(mockedSkillCreate).not.toHaveBeenCalled();
    expect(mockedResumeSkillCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { resumeId: 42, skillId: 7 } })
    );
  });

  it("returns 500 on unexpected error", async () => {
    mockedApplicantUpsert.mockRejectedValue(new Error("DB crash"));
    const file = makeFile("resume.txt", "text/plain", "resume content");
    const request = makePostRequest({ file });

    await POST(request as any);

    expect(mockedJson).toHaveBeenCalledWith(
      { error: "Failed to process resume" },
      { status: 500 }
    );
  });
});
