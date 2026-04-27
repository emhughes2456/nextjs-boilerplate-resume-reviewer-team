const STOP_WORDS = [
  "the", "and", "is", "in", "at", "of", "a", "to", "for", "on", "with"
];

const SYNONYMS: Record<string, string> = {
  js: "javascript",
  reactjs: "react",
  nodejs: "node",
};

function normalize(word: string) {
  return SYNONYMS[word] || word;
}

export function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .map(normalize)
    .filter(word => word.length > 2 && !STOP_WORDS.includes(word));
}

export function matchKeywords(resumeText: string, jobText: string) {
  const resumeWords = extractKeywords(resumeText);
  const jobWords = extractKeywords(jobText);

  const resumeSet = new Set(resumeWords);
  const jobSet = new Set(jobWords);

  let matchCount = 0;
  let missing: string[] = [];

  jobSet.forEach(word => {
    if (resumeSet.has(word)) {
      matchCount++;
    } else {
      missing.push(word);
    }
  });

  const score = (matchCount / jobSet.size) * 100;

  return {
    score: Math.round(score),
    matched: matchCount,
    missing
  };
}