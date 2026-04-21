-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Review" (
    "reviewId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reviewDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overallScore" REAL NOT NULL,
    "feedbackText" TEXT NOT NULL,
    "recommendationLevel" TEXT NOT NULL,
    "strengths" TEXT NOT NULL DEFAULT '[]',
    "improvements" TEXT NOT NULL DEFAULT '[]',
    "resumeId" INTEGER NOT NULL,
    "jobPostingId" INTEGER,
    CONSTRAINT "Review_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("resumeId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "JobPosting" ("jobId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("feedbackText", "jobPostingId", "overallScore", "recommendationLevel", "resumeId", "reviewDate", "reviewId") SELECT "feedbackText", "jobPostingId", "overallScore", "recommendationLevel", "resumeId", "reviewDate", "reviewId" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
