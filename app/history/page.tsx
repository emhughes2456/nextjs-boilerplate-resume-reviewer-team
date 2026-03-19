import Link from "next/link";

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
  };
  jobPosting: {
    jobId: number;
    jobTitle: string;
    companyName: string;
  } | null;
}

async function getReviews(): Promise<Review[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/reviews`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json() as Promise<Review[]>;
  } catch {
    return [];
  }
}

function ScoreBadge({
  score,
  level,
}: {
  score: number;
  level: string;
}) {
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

export default async function HistoryPage() {
  const reviews = await getReviews();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review History</h1>
          <p className="text-gray-500 mt-1">
            All your past AI-powered resume reviews
          </p>
        </div>
        <Link
          href="/upload"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Review
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {reviews.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-14 h-14 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium text-gray-500">No reviews yet</p>
            <p className="text-xs mt-1">Upload your first resume to get AI feedback</p>
            <Link
              href="/upload"
              className="mt-4 inline-block text-sm text-blue-600 hover:underline"
            >
              Upload a resume
            </Link>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <div className="col-span-4">Resume</div>
              <div className="col-span-3">Job</div>
              <div className="col-span-2">Score</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1"></div>
            </div>
            {/* Table Rows */}
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
                      title="View feedback"
                      className="group relative"
                    >
                      <svg className="w-4 h-4 text-gray-400 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Feedback panel for recent review */}
      {reviews.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Latest Feedback
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {reviews[0].feedbackText}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs text-gray-400">From:</span>
            <span className="text-xs font-medium text-gray-700">
              {reviews[0].resume.fileName}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(reviews[0].reviewDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
