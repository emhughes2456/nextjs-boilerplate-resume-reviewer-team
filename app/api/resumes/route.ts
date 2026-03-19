import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { analyzeResume } from "@/lib/ai";
// pdf-parse is CommonJS — import dynamically to avoid ESM issues with Next.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

// Hardcoded applicant ID (mock auth — real auth would come from session)
const MOCK_APPLICANT_ID = 1;

export async function GET() {
  try {
    const resumes = await prisma.resume.findMany({
      where: { applicantId: MOCK_APPLICANT_ID },
      include: {
        reviews: {
          orderBy: { reviewDate: "desc" },
          take: 1,
        },
      },
      orderBy: { uploadDate: "desc" },
    });
    return NextResponse.json(resumes);
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return NextResponse.json(
      { error: "Failed to fetch resumes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const jobPostingId = formData.get("jobPostingId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF, TXT, DOC, and DOCX files are supported" },
        { status: 400 }
      );
    }

    // Extract text from file
    let resumeText = "";
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (file.type === "application/pdf") {
      const parsed = await pdfParse(buffer);
      resumeText = parsed.text;
    } else {
      resumeText = buffer.toString("utf-8");
    }

    if (!resumeText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from the file" },
        { status: 400 }
      );
    }

    // Get job description if a job posting was selected
    let jobDescription: string | undefined;
    if (jobPostingId) {
      const job = await prisma.jobPosting.findUnique({
        where: { jobId: parseInt(jobPostingId) },
      });
      if (job) jobDescription = `${job.jobTitle}\n\n${job.jobDescription}`;
    }

    // Ensure the mock applicant exists
    await prisma.applicant.upsert({
      where: { applicantId: MOCK_APPLICANT_ID },
      update: {},
      create: {
        applicantId: MOCK_APPLICANT_ID,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        username: "johndoe",
        passwordHash: "mock_hash",
      },
    });

    // Save resume to database
    const resume = await prisma.resume.create({
      data: {
        fileName: file.name,
        fileType: file.type,
        resumeText,
        applicantId: MOCK_APPLICANT_ID,
      },
    });

    // Run AI analysis
    const analysis = await analyzeResume(resumeText, jobDescription);

    // Save skills to database
    for (const skill of analysis.skills) {
      const existingSkill = await prisma.skill.findFirst({
        where: { skillName: { equals: skill.name } },
      });
      const savedSkill =
        existingSkill ??
        (await prisma.skill.create({
          data: { skillName: skill.name, skillCategory: skill.category },
        }));
      await prisma.resumeSkill
        .create({
          data: { resumeId: resume.resumeId, skillId: savedSkill.skillId },
        })
        .catch(() => {
          // Ignore duplicate skill links
        });
    }

    // Save review to database
    const review = await prisma.review.create({
      data: {
        overallScore: analysis.overallScore,
        feedbackText: analysis.feedbackText,
        recommendationLevel: analysis.recommendationLevel,
        resumeId: resume.resumeId,
        jobPostingId: jobPostingId ? parseInt(jobPostingId) : null,
      },
    });

    return NextResponse.json(
      {
        resume,
        review,
        analysis: {
          strengths: analysis.strengths,
          improvements: analysis.improvements,
          skills: analysis.skills,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing resume:", error);
    return NextResponse.json(
      { error: "Failed to process resume" },
      { status: 500 }
    );
  }
}
