import Link from "next/link";

interface RecentReview {
  reviewId: number;
  fileName: string;
  score: number;
  recommendationLevel: string;
  reviewDate: string;
  jobTitle: string | null;
}

interface DashboardStats {
  totalResumes: number;
  resumesThisMonth: number;
  avgScore: number;
  accepted: number;
  needImprovement: number;
  totalReviews: number;
  recentReviews: RecentReview[];
}

async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/dashboard/stats`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json() as Promise<DashboardStats>;
  } catch {
    return {
      totalResumes: 0,
      resumesThisMonth: 0,
      avgScore: 0,
      accepted: 0,
      needImprovement: 0,
      totalReviews: 0,
      recentReviews: [],
    };
  }
}

function ScoreBadge({ score, level }: { score: number; level: string }) {
  const isAccept = level === "Accept";
  const color = isAccept ? "text-green-600" : "text-orange-500";
  const badgeColor = isAccept
    ? "bg-green-100 text-green-700"
    : "bg-orange-100 text-orange-700";
  return (
    <div className="flex items-center gap-2">
      <span className={`font-semibold text-sm ${color}`}>{score}%</span>
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${badgeColor}`}>
        {level}
      </span>
    </div>
  );
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const acceptanceRate =
    stats.totalReviews > 0
      ? Math.round((stats.accepted / stats.totalReviews) * 100)
      : 0;
  const needImprovementPct =
    stats.totalReviews > 0
      ? Math.round((stats.needImprovement / stats.totalReviews) * 100)
      : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-500 mt-1 mb-6">
        Overview of your resume reviews and performance metrics
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Resumes</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.totalResumes}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                +{stats.resumesThisMonth} this month
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Score</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.avgScore}%
              </p>
              <p className="text-xs text-green-500 mt-1">+5% improvement</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Accepted</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.accepted}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {acceptanceRate}% acceptance rate
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Need Improvement</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.needImprovement}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {needImprovementPct}% of total
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/upload"
            className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4-4-4 4M12 8v8" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Upload Resume</p>
              <p className="text-xs text-gray-500">Get AI review instantly</p>
            </div>
          </Link>

          <Link
            href="/jobs"
            className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-purple-400 hover:bg-purple-50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zm-8-4h0a4 4 0 014 4H8a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Browse Jobs</p>
              <p className="text-xs text-gray-500">{stats.totalReviews} active postings</p>
            </div>
          </Link>

          <Link
            href="/history"
            className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-green-400 hover:bg-green-50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">View History</p>
              <p className="text-xs text-gray-500">{stats.totalReviews} total reviews</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            Recent Reviews
          </h2>
          <Link
            href="/history"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all
          </Link>
        </div>

        {stats.recentReviews.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">No reviews yet.</p>
            <Link href="/upload" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
              Upload your first resume
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {stats.recentReviews.map((review) => (
              <div
                key={review.reviewId}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {review.fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {review.jobTitle ?? "General Review"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <ScoreBadge
                    score={Math.round(review.score)}
                    level={review.recommendationLevel}
                  />
                  <span className="text-xs text-gray-400">
                    {new Date(review.reviewDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
