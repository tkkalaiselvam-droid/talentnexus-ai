// ─── Gemini API Service ───
// Calls gemini-2.5-flash with candidate ranking. Falls back to local scoring on failure.

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

export interface GeminiRankingResult {
  rankedCandidates: Array<{
    id: string;
    tracker: string;
    overallScore: number;
    academicScore: number;
    praxisScore: number;
    growthVelocityScore: number;
    reasoning: string;
  }>;
  source: 'gemini' | 'local';
}

interface CandidateProfile {
  id: string;
  tracker: string;
  badges: string[];
  skills: string[];
  experience: string;
  location: string;
  education: string;
  languages: string[];
}

const SYSTEM_PROMPT = `You are an expert technical recruiter AI. Evaluate the provided candidate profiles and rank them from highest to lowest overall fit.

For each candidate, compute three sub-tensor scores (0-10 scale):
1. Academic — strength of education, publications, credential authority
2. Praxis — depth and relevance of hands-on technical skills and project experience
3. Growth Velocity — trajectory, leadership signals, and rate of skill expansion

Pay special attention to multilingual capabilities. Candidates fluent in Hindi, Tamil, Telugu, or other Indic languages should receive a modest bonus in Praxis if their location or skillset suggests they can operate in those markets.

Return ONLY a valid JSON object with this exact shape (no markdown, no code fences):
{
  "rankedCandidates": [
    {
      "id": "string",
      "tracker": "string",
      "overallScore": number,
      "academicScore": number,
      "praxisScore": number,
      "growthVelocityScore": number,
      "reasoning": "One-sentence justification"
    }
  ]
}`;

function buildUserPrompt(query: string, candidates: CandidateProfile[]): string {
  return `Recruiter Intent: "${query}"\n\nCandidate Profiles:\n${JSON.stringify(candidates, null, 2)}`;
}

async function callGemini(query: string, candidates: CandidateProfile[], signal: AbortSignal): Promise<GeminiRankingResult> {
  const body = {
    contents: [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'Understood. I will return only the requested JSON ranking.' }] },
      { role: 'user', parts: [{ text: buildUserPrompt(query, candidates) }] },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  };

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Gemini HTTP ${res.status}: ${text}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const parsed = JSON.parse(text);

  if (!Array.isArray(parsed?.rankedCandidates)) {
    throw new Error('Unexpected Gemini response shape');
  }

  return { rankedCandidates: parsed.rankedCandidates, source: 'gemini' };
}

function localFallback(candidates: CandidateProfile[]): GeminiRankingResult {
  // Deterministic local scoring using the same three tensors
  const scored = candidates.map((c) => {
    // Academic: education tier
    let academic = 5.0;
    if (c.education.includes('Ph.D')) academic = 9.5;
    else if (c.education.includes('M.Tech') || c.education.includes('M.Sc')) academic = 8.5;
    else if (c.education.includes('B.S') || c.education.includes('B.Eng')) academic = 7.0;

    // Praxis: skill breadth + experience
    const expYears = parseFloat(c.experience) || 0;
    const skillCount = c.skills.length;
    const praxis = Math.min(10, (expYears * 0.8) + (skillCount * 0.4) + 2);

    // Growth Velocity: badge signals + languages
    const hasLeadership = c.badges.some((b) => b.includes('LEADERSHIP'));
    const hasHighAuth = c.badges.some((b) => b.includes('HIGH'));
    const langBonus = c.languages.some((l) => ['Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada'].includes(l)) ? 0.5 : 0;
    const growth = Math.min(10, (hasLeadership ? 3 : 0) + (hasHighAuth ? 2 : 0) + langBonus + 5);

    const overall = Math.round(((academic + praxis + growth) / 3) * 100) / 100;

    return {
      id: c.id,
      tracker: c.tracker,
      overallScore: overall,
      academicScore: Math.round(academic * 100) / 100,
      praxisScore: Math.round(praxis * 100) / 100,
      growthVelocityScore: Math.round(growth * 100) / 100,
      reasoning: `Local fallback: Academic ${academic.toFixed(1)}, Praxis ${praxis.toFixed(1)}, Growth ${growth.toFixed(1)}`,
    };
  });

  scored.sort((a, b) => b.overallScore - a.overallScore);
  return { rankedCandidates: scored, source: 'local' };
}

export async function rankCandidates(
  query: string,
  candidates: CandidateProfile[],
  timeoutMs = 15000
): Promise<GeminiRankingResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await callGemini(query, candidates, controller.signal);
    clearTimeout(timer);
    return result;
  } catch (err) {
    clearTimeout(timer);
    console.warn('Gemini call failed, falling back to local scoring:', err);
    return localFallback(candidates);
  }
}
