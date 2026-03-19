import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create hiring user
  const hiringUser = await prisma.hiringUser.upsert({
    where: { userId: 1 },
    update: {},
    create: {
      userId: 1,
      name: "Jane Smith",
      email: "jane.smith@company.com",
      role: "HR Manager",
    },
  });

  // Create job postings
  const jobs = await Promise.all([
    prisma.jobPosting.upsert({
      where: { jobId: 1 },
      update: {},
      create: {
        jobId: 1,
        jobTitle: "Senior Software Engineer",
        jobDescription:
          "We are looking for a Senior Software Engineer to join our team. You will design, develop, and maintain scalable backend systems.\n\nRequirements:\n- 5+ years of software engineering experience\n- Proficiency in TypeScript, Node.js, or Python\n- Experience with cloud platforms (AWS, GCP, or Azure)\n- Strong understanding of databases and SQL\n- Experience with REST APIs and microservices\n- Excellent communication and collaboration skills",
        companyName: "TechCorp Inc.",
        hiringUserId: hiringUser.userId,
      },
    }),
    prisma.jobPosting.upsert({
      where: { jobId: 2 },
      update: {},
      create: {
        jobId: 2,
        jobTitle: "Product Manager",
        jobDescription:
          "We are seeking an experienced Product Manager to drive product strategy and execution.\n\nRequirements:\n- 3+ years of product management experience\n- Strong analytical and data-driven mindset\n- Excellent stakeholder management skills\n- Experience with agile methodologies\n- Ability to translate business needs into product requirements\n- Strong written and verbal communication",
        companyName: "StartupXYZ",
        hiringUserId: hiringUser.userId,
      },
    }),
    prisma.jobPosting.upsert({
      where: { jobId: 3 },
      update: {},
      create: {
        jobId: 3,
        jobTitle: "Data Scientist",
        jobDescription:
          "Join our data science team to build ML models and extract insights from large datasets.\n\nRequirements:\n- 2+ years of data science or ML experience\n- Proficiency in Python (pandas, scikit-learn, TensorFlow/PyTorch)\n- Strong statistics and mathematics background\n- Experience with SQL and data pipelines\n- Ability to communicate findings to non-technical stakeholders\n- Experience with cloud ML services a plus",
        companyName: "DataDriven Co.",
        hiringUserId: hiringUser.userId,
      },
    }),
  ]);

  // Add skills to jobs
  const skills = await Promise.all([
    prisma.skill.upsert({
      where: { skillId: 1 },
      update: {},
      create: { skillId: 1, skillName: "TypeScript", skillCategory: "Technical" },
    }),
    prisma.skill.upsert({
      where: { skillId: 2 },
      update: {},
      create: { skillId: 2, skillName: "Node.js", skillCategory: "Technical" },
    }),
    prisma.skill.upsert({
      where: { skillId: 3 },
      update: {},
      create: { skillId: 3, skillName: "Python", skillCategory: "Technical" },
    }),
    prisma.skill.upsert({
      where: { skillId: 4 },
      update: {},
      create: { skillId: 4, skillName: "SQL", skillCategory: "Technical" },
    }),
    prisma.skill.upsert({
      where: { skillId: 5 },
      update: {},
      create: { skillId: 5, skillName: "Product Strategy", skillCategory: "Domain" },
    }),
    prisma.skill.upsert({
      where: { skillId: 6 },
      update: {},
      create: { skillId: 6, skillName: "Machine Learning", skillCategory: "Technical" },
    }),
    prisma.skill.upsert({
      where: { skillId: 7 },
      update: {},
      create: { skillId: 7, skillName: "Communication", skillCategory: "Soft" },
    }),
  ]);

  // Link skills to jobs
  const jobSkillLinks = [
    { jobId: 1, skillId: 1 }, // SWE -> TypeScript
    { jobId: 1, skillId: 2 }, // SWE -> Node.js
    { jobId: 1, skillId: 4 }, // SWE -> SQL
    { jobId: 2, skillId: 5 }, // PM -> Product Strategy
    { jobId: 2, skillId: 7 }, // PM -> Communication
    { jobId: 3, skillId: 3 }, // DS -> Python
    { jobId: 3, skillId: 4 }, // DS -> SQL
    { jobId: 3, skillId: 6 }, // DS -> Machine Learning
  ];

  for (const link of jobSkillLinks) {
    await prisma.jobSkill
      .upsert({
        where: { jobId_skillId: link },
        update: {},
        create: link,
      })
      .catch(() => {});
  }

  // Create mock applicant
  const applicant = await prisma.applicant.upsert({
    where: { applicantId: 1 },
    update: {},
    create: {
      applicantId: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      username: "johndoe",
      passwordHash: "mock_hash",
    },
  });

  // Create sample resumes + reviews
  const sampleResumes = [
    {
      fileName: "John_Doe_Resume_2026.pdf",
      fileType: "application/pdf",
      resumeText: "Senior Software Engineer with 7 years experience in TypeScript, Node.js, React.",
      uploadDate: new Date("2026-02-15"),
      jobId: 1,
      score: 85,
      recommendation: "Accept",
      feedback:
        "Strong technical background with solid experience in TypeScript and Node.js. The resume clearly demonstrates relevant skills and measurable achievements. Consider adding more specific metrics to quantify impact.",
    },
    {
      fileName: "Jane_Smith_CV.pdf",
      fileType: "application/pdf",
      resumeText: "Product Manager with 4 years experience in agile, stakeholder management.",
      uploadDate: new Date("2026-02-14"),
      jobId: 2,
      score: 72,
      recommendation: "Improve",
      feedback:
        "Good product management experience but the resume lacks specific product outcomes and metrics. Strengthen the impact section with data-driven results and add more detail on cross-functional collaboration.",
    },
    {
      fileName: "Mike_Johnson_Resume.pdf",
      fileType: "application/pdf",
      resumeText: "Data Scientist with expertise in Python, ML, TensorFlow, statistical modeling.",
      uploadDate: new Date("2026-02-13"),
      jobId: 3,
      score: 91,
      recommendation: "Accept",
      feedback:
        "Excellent resume with strong ML expertise and well-documented projects. Python skills and data pipeline experience are impressive. This candidate is a strong match for the data science role.",
    },
  ];

  for (const sample of sampleResumes) {
    const resume = await prisma.resume.create({
      data: {
        fileName: sample.fileName,
        fileType: sample.fileType,
        resumeText: sample.resumeText,
        uploadDate: sample.uploadDate,
        applicantId: applicant.applicantId,
      },
    });

    await prisma.review.create({
      data: {
        overallScore: sample.score,
        recommendationLevel: sample.recommendation,
        feedbackText: sample.feedback,
        reviewDate: sample.uploadDate,
        resumeId: resume.resumeId,
        jobPostingId: sample.jobId,
      },
    });
  }

  console.log("Database seeded successfully!");
  console.log(`Created ${jobs.length} job postings, ${sampleResumes.length} resumes, ${skills.length} skills`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
