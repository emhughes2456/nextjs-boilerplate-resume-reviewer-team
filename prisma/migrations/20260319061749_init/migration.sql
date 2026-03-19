-- CreateTable
CREATE TABLE "Applicant" (
    "applicantId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "accountCreatedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Resume" (
    "resumeId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "uploadDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resumeText" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "applicantId" INTEGER NOT NULL,
    CONSTRAINT "Resume_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant" ("applicantId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Skill" (
    "skillId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "skillName" TEXT NOT NULL,
    "skillCategory" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ResumeSkill" (
    "resumeId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,

    PRIMARY KEY ("resumeId", "skillId"),
    CONSTRAINT "ResumeSkill_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("resumeId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ResumeSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill" ("skillId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "reviewId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reviewDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overallScore" REAL NOT NULL,
    "feedbackText" TEXT NOT NULL,
    "recommendationLevel" TEXT NOT NULL,
    "resumeId" INTEGER NOT NULL,
    "jobPostingId" INTEGER,
    CONSTRAINT "Review_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("resumeId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "JobPosting" ("jobId") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JobPosting" (
    "jobId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "jobTitle" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "datePosted" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hiringUserId" INTEGER NOT NULL,
    CONSTRAINT "JobPosting_hiringUserId_fkey" FOREIGN KEY ("hiringUserId") REFERENCES "HiringUser" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JobSkill" (
    "jobId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,

    PRIMARY KEY ("jobId", "skillId"),
    CONSTRAINT "JobSkill_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting" ("jobId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JobSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill" ("skillId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HiringUser" (
    "userId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_email_key" ON "Applicant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_username_key" ON "Applicant"("username");

-- CreateIndex
CREATE UNIQUE INDEX "HiringUser_email_key" ON "HiringUser"("email");
