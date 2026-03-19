import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const MOCK_HIRING_USER_ID = 1;

export async function GET() {
  try {
    const jobs = await prisma.jobPosting.findMany({
      include: {
        hiringUser: true,
        skills: { include: { skill: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: { datePosted: "desc" },
    });
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      jobTitle: string;
      jobDescription: string;
      companyName: string;
      skills?: Array<{ name: string; category: string }>;
    };
    const { jobTitle, jobDescription, companyName, skills } = body;

    if (!jobTitle || !jobDescription || !companyName) {
      return NextResponse.json(
        { error: "jobTitle, jobDescription, and companyName are required" },
        { status: 400 }
      );
    }

    // Ensure mock hiring user exists
    await prisma.hiringUser.upsert({
      where: { userId: MOCK_HIRING_USER_ID },
      update: {},
      create: {
        userId: MOCK_HIRING_USER_ID,
        name: "Jane Smith",
        email: "jane.smith@company.com",
        role: "HR Manager",
      },
    });

    const job = await prisma.jobPosting.create({
      data: {
        jobTitle,
        jobDescription,
        companyName,
        hiringUserId: MOCK_HIRING_USER_ID,
      },
    });

    // Attach skills if provided
    if (skills && skills.length > 0) {
      for (const skill of skills) {
        const savedSkill = await prisma.skill.upsert({
          where: { skillId: 0 }, // force create
          update: {},
          create: { skillName: skill.name, skillCategory: skill.category },
        });
        await prisma.jobSkill
          .create({ data: { jobId: job.jobId, skillId: savedSkill.skillId } })
          .catch(() => {});
      }
    }

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job posting" },
      { status: 500 }
    );
  }
}
