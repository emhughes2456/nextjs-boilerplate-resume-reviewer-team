/**
 * @jest-environment node
 */

jest.mock("@/lib/db", () => ({
  prisma: {
    review: { findMany: jest.fn() },
    resume: { count: jest.fn() },
  },
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status ?? 200 })),
  },
}));

import { GET } from "@/app/api/dashboard/stats/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const mockedJson = NextResponse.json as jest.Mock;
const mockedReviewFindMany = prisma.review.findMany as jest.Mock;
const mockedResumeCount = prisma.resume.count as jest.Mock;

/** Helper to build a minimal review object for mocking. */
function makeReview(
  id: number,
  score: number,
  level: "Accept" | "Improve" | "Reject",
  fileName = "resume.pdf",
  jobTitle: string | null = null
) {
  return {
    reviewId: id,
    overallScore: score,
    recommendationLevel: level,
    resume: { fileName },
    jobPosting: jobTitle ? { jobTitle } : null,
    reviewDate: new Date("2025-01-15"),
  };
}

describe("GET /api/dashboard/stats", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns a response with the correct shape", async () => {
    mockedReviewFindMany.mockResolvedValue([]);
    mockedResumeCount.mockResolvedValue(0);

    await GET();

    const response = mockedJson.mock.calls[0][0];
    expect(response).toMatchObject({
      totalResumes: expect.any(Number),
      resumesThisMonth: expect.any(Number),
      avgScore: expect.any(Number),
      accepted: expect.any(Number),
      needImprovement: expect.any(Number),
      totalReviews: expect.any(Number),
      recentReviews: expect.any(Array),
    });
  });

  it("returns avgScore of 0 when there are no reviews", async () => {
    mockedReviewFindMany.mockResolvedValue([]);
    mockedResumeCount.mockResolvedValue(0);

    await GET();

    expect(mockedJson.mock.calls[0][0].avgScore).toBe(0);
  });

  it("calculates avgScore rounded to the nearest integer", async () => {
    // (70 + 85 + 76) / 3 = 77
    mockedReviewFindMany.mockResolvedValue([
      makeReview(1, 70, "Improve"),
      makeReview(2, 85, "Accept"),
      makeReview(3, 76, "Improve"),
    ]);
    mockedResumeCount.mockResolvedValue(3);

    await GET();

    expect(mockedJson.mock.calls[0][0].avgScore).toBe(77);
  });

  it("rounds avgScore up when fractional part >= 0.5", async () => {
    // (80 + 81) / 2 = 80.5 → rounds to 81
    mockedReviewFindMany.mockResolvedValue([
      makeReview(1, 80, "Accept"),
      makeReview(2, 81, "Accept"),
    ]);
    mockedResumeCount.mockResolvedValue(2);

    await GET();

    expect(mockedJson.mock.calls[0][0].avgScore).toBe(81);
  });

  it("counts accepted, needImprovement, and totalReviews correctly", async () => {
    mockedReviewFindMany.mockResolvedValue([
      makeReview(1, 90, "Accept"),
      makeReview(2, 92, "Accept"),
      makeReview(3, 60, "Improve"),
      makeReview(4, 40, "Reject"),
    ]);
    mockedResumeCount.mockResolvedValue(4);

    await GET();

    const response = mockedJson.mock.calls[0][0];
    expect(response.accepted).toBe(2);
    expect(response.needImprovement).toBe(1);
    expect(response.totalReviews).toBe(4);
  });

  it("limits recentReviews to 5 entries", async () => {
    const reviews = Array.from({ length: 8 }, (_, i) =>
      makeReview(i + 1, 80, "Accept", `resume${i}.pdf`)
    );
    mockedReviewFindMany.mockResolvedValue(reviews);
    mockedResumeCount.mockResolvedValue(8);

    await GET();

    expect(mockedJson.mock.calls[0][0].recentReviews).toHaveLength(5);
  });

  it("maps recentReviews to the correct shape", async () => {
    mockedReviewFindMany.mockResolvedValue([
      makeReview(1, 85, "Accept", "cv.pdf", "Senior Engineer"),
    ]);
    mockedResumeCount.mockResolvedValue(1);

    await GET();

    expect(mockedJson.mock.calls[0][0].recentReviews[0]).toMatchObject({
      reviewId: 1,
      fileName: "cv.pdf",
      score: 85,
      recommendationLevel: "Accept",
      jobTitle: "Senior Engineer",
    });
  });

  it("sets jobTitle to null in recentReviews when no job posting", async () => {
    mockedReviewFindMany.mockResolvedValue([
      makeReview(1, 70, "Improve", "cv.pdf", null),
    ]);
    mockedResumeCount.mockResolvedValue(1);

    await GET();

    expect(mockedJson.mock.calls[0][0].recentReviews[0].jobTitle).toBeNull();
  });

  it("returns totalResumes from prisma.resume.count", async () => {
    mockedReviewFindMany.mockResolvedValue([]);
    mockedResumeCount.mockResolvedValueOnce(7).mockResolvedValueOnce(2);

    await GET();

    expect(mockedJson.mock.calls[0][0].totalResumes).toBe(7);
  });

  it("returns resumesThisMonth from the second count call", async () => {
    mockedReviewFindMany.mockResolvedValue([]);
    mockedResumeCount.mockResolvedValueOnce(10).mockResolvedValueOnce(3);

    await GET();

    expect(mockedJson.mock.calls[0][0].resumesThisMonth).toBe(3);
  });

  it("returns 500 on database error", async () => {
    mockedReviewFindMany.mockRejectedValue(new Error("Connection failed"));

    await GET();

    expect(mockedJson).toHaveBeenCalledWith(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  });
});
