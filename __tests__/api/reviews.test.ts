/**
 * @jest-environment node
 */

jest.mock("@/lib/db", () => ({
  prisma: {
    review: { findMany: jest.fn() },
  },
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status ?? 200 })),
  },
}));

import { GET } from "@/app/api/reviews/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const mockedJson = NextResponse.json as jest.Mock;
const mockedReviewFindMany = prisma.review.findMany as jest.Mock;

const sampleReviews = [
  {
    reviewId: 1,
    overallScore: 85,
    recommendationLevel: "Accept",
    feedbackText: "Great resume.",
    reviewDate: new Date("2025-01-15"),
    resume: { resumeId: 1, fileName: "cv.pdf" },
    jobPosting: { jobId: 1, jobTitle: "Software Engineer" },
  },
  {
    reviewId: 2,
    overallScore: 60,
    recommendationLevel: "Improve",
    feedbackText: "Needs work.",
    reviewDate: new Date("2025-01-10"),
    resume: { resumeId: 2, fileName: "resume.docx" },
    jobPosting: null,
  },
];

describe("GET /api/reviews", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns all reviews with resume and jobPosting", async () => {
    mockedReviewFindMany.mockResolvedValue(sampleReviews);

    await GET();

    expect(mockedJson).toHaveBeenCalledWith(sampleReviews);
  });

  it("queries reviews scoped to the mock applicant (id = 1)", async () => {
    mockedReviewFindMany.mockResolvedValue([]);

    await GET();

    expect(mockedReviewFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { resume: { applicantId: 1 } },
      })
    );
  });

  it("orders reviews by reviewDate descending", async () => {
    mockedReviewFindMany.mockResolvedValue([]);

    await GET();

    expect(mockedReviewFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { reviewDate: "desc" },
      })
    );
  });

  it("includes resume and jobPosting relations", async () => {
    mockedReviewFindMany.mockResolvedValue([]);

    await GET();

    expect(mockedReviewFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: { resume: true, jobPosting: true },
      })
    );
  });

  it("returns an empty array when no reviews exist", async () => {
    mockedReviewFindMany.mockResolvedValue([]);

    await GET();

    expect(mockedJson).toHaveBeenCalledWith([]);
  });

  it("returns 500 on database error", async () => {
    mockedReviewFindMany.mockRejectedValue(new Error("Connection lost"));

    await GET();

    expect(mockedJson).toHaveBeenCalledWith(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  });
});
