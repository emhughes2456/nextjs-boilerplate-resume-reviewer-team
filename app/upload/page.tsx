"use client";

import { useState, useRef } from "react";
import Link from "next/link";

interface JobPosting {
  jobId: number;
  jobTitle: string;
  companyName: string;
}

interface AnalysisResult {
  resume: { resumeId: number; fileName: string };
  review: {
    reviewId: number;
    overallScore: number;
    recommendationLevel: string;
    feedbackText: string;
  };
  analysis: {
    strengths: string[];
    improvements: string[];
    skills: Array<{ name: string; category: string }>;
  };
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobsLoaded, setJobsLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadJobs = async () => {
    if (jobsLoaded) return;
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json() as JobPosting[];
      setJobPostings(data);
      setJobsLoaded(true);
    } catch {
      // non-critical
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (selectedJobId) formData.append("jobPostingId", selectedJobId);

      const res = await fetch("/api/resumes", {
        method: "POST",
        body: formData,
      });

      const data = await res.json() as AnalysisResult & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
      } else {
        setResult(data);
      }
    } catch {
      setError("Failed to upload. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setSelectedJobId("");
  };

  const scoreColor =
    result?.review.overallScore !== undefined
      ? result.review.overallScore >= 80
        ? "text-green-600"
        : result.review.overallScore >= 60
        ? "text-orange-500"
        : "text-red-500"
      : "";

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Upload Resume</h1>
      <p className="text-gray-500 mt-1 mb-6">
        Upload your resume and get instant AI-powered feedback
      </p>

      {!result ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : file
                ? "border-green-400 bg-green-50"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.txt,.doc,.docx"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFile(f);
              }}
            />
            {file ? (
              <div className="space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4-4-4 4M12 8v8" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Drag & drop your resume here
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    or click to browse — PDF, TXT, DOC, DOCX
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Job Posting Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Match against a job posting{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              onFocus={loadJobs}
            >
              <option value="">General review (no specific job)</option>
              {jobPostings.map((job) => (
                <option key={job.jobId} value={job.jobId}>
                  {job.jobTitle} — {job.companyName}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!file || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing with AI...
              </>
            ) : (
              "Analyze Resume"
            )}
          </button>
        </div>
      ) : (
        /* Results */
        <div className="space-y-4">
          {/* Score Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{result.resume.fileName}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-5xl font-bold ${scoreColor}`}>
                    {Math.round(result.review.overallScore)}%
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.review.recommendationLevel === "Accept"
                        ? "bg-green-100 text-green-700"
                        : result.review.recommendationLevel === "Improve"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {result.review.recommendationLevel}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 border-t border-gray-100 pt-4">
              {result.review.feedbackText}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                Strengths
              </h3>
              <ul className="space-y-2">
                {result.analysis.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </span>
                Areas to Improve
              </h3>
              <ul className="space-y-2">
                {result.analysis.improvements.map((imp, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Detected Skills */}
          {result.analysis.skills.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Detected Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.analysis.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Upload Another
            </button>
            <Link
              href="/history"
              className="flex-1 bg-blue-600 text-white text-center font-medium py-2.5 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              View All Reviews
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
