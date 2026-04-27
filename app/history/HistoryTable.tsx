"use client";

import { useState } from "react";

interface Review {
  reviewId: number;
  reviewDate: string;
  overallScore: number;
  feedbackText: string;
  recommendationLevel: string;
  strengths: string;
  improvements: string;
  resume: {
    resumeId: number;
    fileName: string;
    fileType: string;
    uploadDate: string;
    resumeText: string;
    filePath: string | null;
    skills: Array<{ skill: { skillId: number; skillName: string; skillCategory: string } }>;
  };
  jobPosting: {
    jobId: number;
    jobTitle: string;
    companyName: string;
  } | null;
}

function ScoreBadge({ score, level }: { score: number; level: string }) {
  const badgeColor =
    level === "Accept"
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : level === "Improve"
      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  const scoreColor =
    level === "Accept"
      ? "text-green-600 dark:text-green-400"
      : level === "Improve"
      ? "text-orange-500 dark:text-orange-400"
      : "text-red-500 dark:text-red-400";
  return (
    <div className="flex items-center gap-2">
      <span className={`font-semibold text-sm ${scoreColor}`}>{score}%</span>
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${badgeColor}`}>
        {level}
      </span>
    </div>
  );
}

function ReviewModal({ review, onClose }: { review: Review; onClose: () => void }) {
  const strengths: string[] = JSON.parse(review.strengths);
  const improvements: string[] = JSON.parse(review.improvements);

  const scoreColor =
    review.overallScore >= 80
      ? "text-green-600 dark:text-green-400"
      : review.overallScore >= 60
      ? "text-orange-500 dark:text-orange-400"
      : "text-red-500 dark:text-red-400";

  const badgeColor =
    review.recommendationLevel === "Accept"
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : review.recommendationLevel === "Improve"
      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-xl">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {review.resume.fileName}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Reviewed{" "}
              {new Date(review.reviewDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
              {review.jobPosting && ` · ${review.jobPosting.jobTitle} at ${review.jobPosting.companyName}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 flex-1 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <span className={`text-5xl font-bold ${scoreColor}`}>
                {Math.round(review.overallScore)}%
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColor}`}>
                {review.recommendationLevel}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 border-t border-gray-100 dark:border-gray-700 pt-4 leading-relaxed">
              {review.feedbackText}
            </p>
          </div>

          {(strengths.length > 0 || improvements.length > 0) && (
            <div className="grid grid-cols-2 gap-4">
              {strengths.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {strengths.map((s, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {improvements.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Areas to Improve
                  </h3>
                  <ul className="space-y-2">
                    {improvements.map((imp, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5">•</span>
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {review.resume.skills.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Detected Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {review.resume.skills.map(({ skill }) => (
                  <span
                    key={skill.skillId}
                    className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium"
                  >
                    {skill.skillName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FileViewerModal({ resume, onClose }: { resume: Review["resume"]; onClose: () => void }) {
  const fileUrl = `/api/resumes/${resume.resumeId}/file`;
  const isViewable = resume.fileType === "application/pdf" || resume.fileType === "text/plain";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {resume.fileName}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Uploaded {new Date(resume.uploadDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`${fileUrl}?download`}
              download
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4 4-4-4M12 8v8" />
              </svg>
              Download
            </a>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden rounded-b-xl">
          {isViewable ? (
            <iframe
              src={fileUrl}
              className="w-full h-full"
              title={resume.fileName}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
              <svg className="w-14 h-14 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This file type cannot be previewed in the browser.
              </p>
              <a
                href={`${fileUrl}?download`}
                download
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Download file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HistoryTable({ reviews }: { reviews: Review[] }) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [viewingFile, setViewingFile] = useState<Review["resume"] | null>(null);

  return (
    <>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {reviews.map((review) => (
          <div
            key={review.reviewId}
            className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="col-span-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-blue-400 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {review.resume.fileName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Uploaded {new Date(review.resume.uploadDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="col-span-3 min-w-0">
              {review.jobPosting ? (
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {review.jobPosting.jobTitle}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {review.jobPosting.companyName}
                  </p>
                </div>
              ) : (
                <span className="text-xs text-gray-500 dark:text-gray-400">General Review</span>
              )}
            </div>
            <div className="col-span-2">
              <ScoreBadge
                score={Math.round(review.overallScore)}
                level={review.recommendationLevel}
              />
            </div>
            <div className="col-span-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(review.reviewDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="col-span-1 flex justify-end items-center gap-2">
              {/* View AI review */}
              <button
                title="View AI review"
                onClick={() => setSelectedReview(review)}
              >
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              {/* View / download original file */}
              {review.resume.filePath && (
                <button
                  title="View original file"
                  onClick={() => setViewingFile(review.resume)}
                >
                  <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedReview && (
        <ReviewModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
        />
      )}

      {viewingFile && (
        <FileViewerModal
          resume={viewingFile}
          onClose={() => setViewingFile(null)}
        />
      )}
    </>
  );
}
