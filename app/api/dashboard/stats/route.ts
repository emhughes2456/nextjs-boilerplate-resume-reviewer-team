import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const MOCK_APPLICANT_ID = 1;

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { resume: { applicantId: MOCK_APPLICANT_ID } },
      include: { resume: true, jobPosting: true },
      orderBy: { reviewDate: "desc" },
    });

    const totalResumes = await prisma.resume.count({
      where: { applicantId: MOCK_APPLICANT_ID },
    });

    // Resumes added this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const resumesThisMonth = await prisma.resume.count({
      where: {
        applicantId: MOCK_APPLICANT_ID,
        uploadDate: { gte: startOfMonth },
      },
    });

    const avgScore =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.overallScore, 0) / reviews.length
        : 0;

    const accepted = reviews.filter(
      (r) => r.recommendationLevel === "Accept"
    ).length;
    const needImprovement = reviews.filter(
      (r) => r.recommendationLevel === "Improve"
    ).length;

    const recentReviews = reviews.slice(0, 5).map((r) => ({
      reviewId: r.reviewId,
      fileName: r.resume.fileName,
      score: r.overallScore,
      recommendationLevel: r.recommendationLevel,
      reviewDate: r.reviewDate,
      jobTitle: r.jobPosting?.jobTitle ?? null,
    }));

    return NextResponse.json({
      totalResumes,
      resumesThisMonth,
      avgScore: Math.round(avgScore),
      accepted,
      needImprovement,
      totalReviews: reviews.length,
      recentReviews,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
