/**
 * @jest-environment node
 */

jest.mock("@/lib/db", () => ({
  prisma: {
    jobPosting: { findMany: jest.fn(), create: jest.fn() },
    hiringUser: { upsert: jest.fn() },
    skill: { upsert: jest.fn() },
    jobSkill: { create: jest.fn() },
  },
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status ?? 200 })),
  },
  NextRequest: jest.fn(),
}));

import { GET, POST } from "@/app/api/jobs/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const mockedJson = NextResponse.json as jest.Mock;
const mockedJobFindMany = prisma.jobPosting.findMany as jest.Mock;
const mockedJobCreate = prisma.jobPosting.create as jest.Mock;
const mockedHiringUserUpsert = prisma.hiringUser.upsert as jest.Mock;
const mockedSkillUpsert = prisma.skill.upsert as jest.Mock;
const mockedJobSkillCreate = prisma.jobSkill.create as jest.Mock;

function makeRequest(body: object) {
  return { json: jest.fn().mockResolvedValue(body) };
}

// ---------------------------------------------------------------------------
// GET /api/jobs
// ---------------------------------------------------------------------------
describe("GET /api/jobs", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns all job postings", async () => {
    const mockJobs = [
      {
        jobId: 1,
        jobTitle: "Engineer",
        hiringUser: {},
        skills: [],
        _count: { reviews: 2 },
      },
    ];
    mockedJobFindMany.mockResolvedValue(mockJobs);

    await GET();

    expect(mockedJson).toHaveBeenCalledWith(mockJobs);
  });

  it("includes hiringUser, skills, and review count", async () => {
    mockedJobFindMany.mockResolvedValue([]);

    await GET();

    expect(mockedJobFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          hiringUser: true,
          _count: { select: { reviews: true } },
        }),
      })
    );
  });

  it("orders postings by datePosted descending", async () => {
    mockedJobFindMany.mockResolvedValue([]);

    await GET();

    expect(mockedJobFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { datePosted: "desc" } })
    );
  });

  it("returns 500 on database error", async () => {
    mockedJobFindMany.mockRejectedValue(new Error("DB error"));

    await GET();

    expect(mockedJson).toHaveBeenCalledWith(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  });
});

// ---------------------------------------------------------------------------
// POST /api/jobs
// ---------------------------------------------------------------------------
describe("POST /api/jobs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedHiringUserUpsert.mockResolvedValue({});
    mockedJobCreate.mockResolvedValue({
      jobId: 10,
      jobTitle: "Software Engineer",
      companyName: "TechCorp",
    });
    mockedSkillUpsert.mockResolvedValue({ skillId: 1 });
    mockedJobSkillCreate.mockResolvedValue({});
  });

  it("returns 400 when jobTitle is missing", async () => {
    const request = makeRequest({
      jobDescription: "Build things",
      companyName: "Acme",
    });

    await POST(request as any);

    expect(mockedJson).toHaveBeenCalledWith(
      { error: "jobTitle, jobDescription, and companyName are required" },
      { status: 400 }
    );
  });

  it("returns 400 when jobDescription is missing", async () => {
    const request = makeRequest({ jobTitle: "Dev", companyName: "Acme" });

    await POST(request as any);

    expect(mockedJson).toHaveBeenCalledWith(
      { error: "jobTitle, jobDescription, and companyName are required" },
      { status: 400 }
    );
  });

  it("returns 400 when companyName is missing", async () => {
    const request = makeRequest({
      jobTitle: "Dev",
      jobDescription: "Build things",
    });

    await POST(request as any);

    expect(mockedJson).toHaveBeenCalledWith(
      { error: "jobTitle, jobDescription, and companyName are required" },
      { status: 400 }
    );
  });

  it("creates a job posting with correct fields", async () => {
    const request = makeRequest({
      jobTitle: "Software Engineer",
      jobDescription: "Build great apps",
      companyName: "TechCorp",
    });

    await POST(request as any);

    expect(mockedJobCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          jobTitle: "Software Engineer",
          jobDescription: "Build great apps",
          companyName: "TechCorp",
          hiringUserId: 1,
        }),
      })
    );
  });

  it("returns the created job with status 201", async () => {
    const request = makeRequest({
      jobTitle: "Software Engineer",
      jobDescription: "Build great apps",
      companyName: "TechCorp",
    });

    await POST(request as any);

    expect(mockedJson).toHaveBeenCalledWith(
      expect.objectContaining({ jobId: 10 }),
      { status: 201 }
    );
  });

  it("upserts skills and creates JobSkill links when skills are provided", async () => {
    const request = makeRequest({
      jobTitle: "Dev",
      jobDescription: "Code stuff",
      companyName: "Acme",
      skills: [
        { name: "Python", category: "Technical" },
        { name: "Communication", category: "Soft" },
      ],
    });

    await POST(request as any);

    expect(mockedSkillUpsert).toHaveBeenCalledTimes(2);
    expect(mockedSkillUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: { skillName: "Python", skillCategory: "Technical" },
      })
    );
    expect(mockedSkillUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: { skillName: "Communication", skillCategory: "Soft" },
      })
    );
    expect(mockedJobSkillCreate).toHaveBeenCalledTimes(2);
  });

  it("does not create any skills when none are provided", async () => {
    const request = makeRequest({
      jobTitle: "Dev",
      jobDescription: "Code",
      companyName: "Acme",
    });

    await POST(request as any);

    expect(mockedSkillUpsert).not.toHaveBeenCalled();
    expect(mockedJobSkillCreate).not.toHaveBeenCalled();
  });

  it("does not create skills when skills array is empty", async () => {
    const request = makeRequest({
      jobTitle: "Dev",
      jobDescription: "Code",
      companyName: "Acme",
      skills: [],
    });

    await POST(request as any);

    expect(mockedSkillUpsert).not.toHaveBeenCalled();
  });

  it("returns 500 on unexpected error", async () => {
    mockedHiringUserUpsert.mockRejectedValue(new Error("DB crash"));
    const request = makeRequest({
      jobTitle: "Dev",
      jobDescription: "Code",
      companyName: "Acme",
    });

    await POST(request as any);

    expect(mockedJson).toHaveBeenCalledWith(
      { error: "Failed to create job posting" },
      { status: 500 }
    );
  });
});
