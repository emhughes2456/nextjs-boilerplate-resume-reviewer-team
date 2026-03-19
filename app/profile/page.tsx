import { prisma } from "@/lib/db";
import Link from "next/link";

const MOCK_APPLICANT_ID = 1;

async function getProfileData() {
  try {
    const applicant = await prisma.applicant.findUnique({
      where: { applicantId: MOCK_APPLICANT_ID },
      include: {
        resumes: {
          include: {
            reviews: true,
            skills: { include: { skill: true } },
          },
        },
      },
    });
    return applicant;
  } catch {
    return null;
  }
}

export default async function ProfilePage() {
  const applicant = await getProfileData();

  const totalResumes = applicant?.resumes.length ?? 0;
  const allReviews = applicant?.resumes.flatMap((r) => r.reviews) ?? [];
  const avgScore =
    allReviews.length > 0
      ? Math.round(
          allReviews.reduce((s, r) => s + r.overallScore, 0) / allReviews.length
        )
      : 0;
  const accepted = allReviews.filter((r) => r.recommendationLevel === "Accept").length;

  // Collect unique skills across all resumes
  const skillMap = new Map<string, string>();
  for (const resume of applicant?.resumes ?? []) {
    for (const rs of resume.skills) {
      skillMap.set(rs.skill.skillName, rs.skill.skillCategory);
    }
  }
  const skills = Array.from(skillMap.entries()).map(([name, category]) => ({
    name,
    category,
  }));

  const categoryColors: Record<string, string> = {
    Technical: "bg-blue-50 text-blue-700",
    Tool: "bg-purple-50 text-purple-700",
    Soft: "bg-green-50 text-green-700",
    Domain: "bg-orange-50 text-orange-700",
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      <p className="text-gray-500 mt-1 mb-6">
        Your account information and resume performance
      </p>

      {/* User Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-9 h-9 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {applicant
                ? `${applicant.firstName} ${applicant.lastName}`
                : "John Doe"}
            </h2>
            <p className="text-sm text-gray-500">
              {applicant?.email ?? "john.doe@example.com"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Member since{" "}
              {applicant
                ? new Date(applicant.accountCreatedDate).toLocaleDateString(
                    "en-US",
                    { month: "long", year: "numeric" }
                  )
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{totalResumes}</p>
          <p className="text-xs text-gray-500 mt-1">Resumes Uploaded</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{avgScore}%</p>
          <p className="text-xs text-gray-500 mt-1">Average Score</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{accepted}</p>
          <p className="text-xs text-gray-500 mt-1">Accepted</p>
        </div>
      </div>

      {/* Detected Skills */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Skills from Your Resumes
        </h3>
        {skills.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No skills detected yet.</p>
            <Link
              href="/upload"
              className="text-sm text-blue-600 hover:underline mt-1 inline-block"
            >
              Upload a resume to discover your skills
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {(["Technical", "Tool", "Soft", "Domain"] as const).map((cat) => {
              const catSkills = skills.filter((s) => s.category === cat);
              if (catSkills.length === 0) return null;
              return (
                <div key={cat}>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    {cat}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {catSkills.map((skill) => (
                      <span
                        key={skill.name}
                        className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                          categoryColors[skill.category] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
