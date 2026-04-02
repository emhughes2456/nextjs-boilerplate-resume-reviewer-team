import Link from "next/link";
import HistoryTable from "./HistoryTable";

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
            <HistoryTable reviews={reviews} />
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
