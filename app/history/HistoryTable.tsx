"use client";

import { useState } from "react";

interface Review {
  reviewId: number;
  reviewDate: string;
  overallScore: number;
  feedbackText: string;
  recommendationLevel: string;
  resume: {
    resumeId: number;
    fileName: string;
    fileType: string;
    uploadDate: string;
    resumeText: string;
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
      ? "bg-green-100 text-green-700"
      : level === "Improve"
      ? "bg-orange-100 text-orange-700"
      : "bg-red-100 text-red-700";
  const scoreColor =
    level === "Accept"
      ? "text-green-600"
      : level === "Improve"
      ? "text-orange-500"
      : "text-red-500";
  return (
    <div className="flex items-center gap-2">
      <span className={`font-semibold text-sm ${scoreColor}`}>{score}%</span>
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${badgeColor}`}>
        {level}
      </span>
    </div>
  );
}

function ResumeModal({
  review,
  onClose,
}: {
  review: Review;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {review.resume.fileName}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Uploaded{" "}
              {new Date(review.resume.uploadDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4 flex-1">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
            {review.resume.resumeText}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function HistoryTable({ reviews }: { reviews: Review[] }) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  return (
    <>
      <div className="divide-y divide-gray-100">
        {reviews.map((review) => (
          <div
            key={review.reviewId}
            className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50 transition-colors"
          >
            <div className="col-span-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {review.resume.fileName}
                </p>
                <p className="text-xs text-gray-400">
                  Uploaded{" "}
                  {new Date(review.resume.uploadDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="col-span-3 min-w-0">
              {review.jobPosting ? (
                <div>
                  <p className="text-sm text-gray-700 truncate">
                    {review.jobPosting.jobTitle}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {review.jobPosting.companyName}
                  </p>
                </div>
              ) : (
                <span className="text-xs text-gray-400">General Review</span>
              )}
            </div>
            <div className="col-span-2">
              <ScoreBadge
                score={Math.round(review.overallScore)}
                level={review.recommendationLevel}
              />
            </div>
            <div className="col-span-2">
              <span className="text-sm text-gray-500">
                {new Date(review.reviewDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="col-span-1 flex justify-end">
              <button
                title="View document"
                onClick={() => setSelectedReview(review)}
                className="group relative"
              >
                <svg className="w-4 h-4 text-gray-400 hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedReview && (
        <ResumeModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </>
  );
}
