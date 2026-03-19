import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const MOCK_APPLICANT_ID = 1;

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        resume: { applicantId: MOCK_APPLICANT_ID },
      },
      include: {
        resume: true,
        jobPosting: true,
      },
      orderBy: { reviewDate: "desc" },
    });
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
