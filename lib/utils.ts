import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { FlagCategory, Severity, DocumentFlag } from "@/types";
import { v4 as uuidv4 } from "uuid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const FLAG_LABELS: Record<FlagCategory, string> = {
  assumption: "Assumption",
  opinion: "Opinion (Non-Expert)",
  missing_context: "Missing Context",
  contradiction: "Contradiction",
  procedure_violation: "Procedure Violation",
  charter_issue: "Charter Issue",
};

export const FLAG_COLORS: Record<FlagCategory, string> = {
  assumption: "#e74c3c",
  opinion: "#e67e22",
  missing_context: "#f39c12",
  contradiction: "#1abc9c",
  procedure_violation: "#8e44ad",
  charter_issue: "#2980b9",
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  low: "#4caf50",
  medium: "#f39c12",
  high: "#e74c3c",
  critical: "#9b1c1c",
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const ONTARIO_CITIES = [
  "Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton",
  "London", "Markham", "Vaughan", "Kitchener", "Windsor",
  "Oakville", "Burlington", "Sudbury", "Oshawa", "Barrie",
  "Kingston", "Guelph", "Thunder Bay", "Waterloo", "Cambridge",
] as const;

export const LAWYER_TIERS = {
  exclusive: { label: "Exclusive", price: "$800–$1,500", period: "per month", placement: "Top of city listing", leads: "Priority leads — first contact", badge: true, featured: true },
  priority:  { label: "Priority",  price: "$300–$600",   period: "per month", placement: "Mid-tier listing",      leads: "Standard leads",              badge: true, featured: false },
  standard:  { label: "Standard",  price: "$100–$250",   period: "per month", placement: "Directory listing",     leads: "General lead pool",           badge: false, featured: false },
} as const;

export const STATUTES = {
  CYFSA:            { name: "Children, Youth and Family Services Act", citation: "S.O. 2017, c. 14, Sched. 1",    url: "https://www.ontario.ca/laws/statute/17c14" },
  CHARTER:          { name: "Canadian Charter of Rights and Freedoms",  citation: "Constitution Act, 1982, Part I", url: "https://laws-lois.justice.gc.ca/eng/const/page-12.html" },
  FAMILY_LAW_RULES: { name: "Ontario Family Law Rules",                  citation: "O. Reg. 114/99",                url: "https://www.ontario.ca/laws/regulation/990114" },
} as const;

export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
  } catch { return dateString; }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getRiskLabel(score: number): string {
  if (score >= 75) return "High Risk";
  if (score >= 40) return "Moderate Risk";
  return "Lower Risk";
}

export function getRiskColor(score: number): string {
  if (score >= 75) return "#e74c3c";
  if (score >= 40) return "#f39c12";
  return "#4caf50";
}

export const DOCUMENT_TYPE_LABELS = {
  cas_report: "CAS Report", court_filing: "Court Filing", transcript: "Transcript",
  photo: "Photo / Image", audio: "Audio Recording", other: "Other Document",
} as const;

export const EMERGENCY_CHECKLIST = [
  { id: "1",  text: "Call a family law lawyer immediately — you can call Legal Aid Ontario at 1-800-668-8258", priority: "immediate" as const },
  { id: "2",  text: "Do not sign any documents without legal advice", priority: "immediate" as const },
  { id: "3",  text: "Write down the name, badge number, and contact info of all CAS workers involved", priority: "immediate" as const },
  { id: "4",  text: "Ask CAS for a copy of their written concerns — you have the right to know", priority: "immediate" as const },
  { id: "5",  text: "Begin an incident journal — document everything that happened with dates and times", priority: "within_24h" as const },
  { id: "6",  text: "Preserve all communications — keep texts, voicemails, and emails from CAS", priority: "within_24h" as const },
  { id: "7",  text: "Confirm your court date — CAS must bring your child before court within 5 days (CYFSA s.79)", priority: "within_24h" as const },
  { id: "8",  text: "Identify witnesses who can speak to your parenting", priority: "within_24h" as const },
  { id: "9",  text: "Gather school records, medical records, and any prior positive CAS interactions", priority: "within_week" as const },
  { id: "10", text: "Upload all CAS documents to the Evidence Analyzer", priority: "within_week" as const },
];

// ══════════════════════════════════════════════════════════════════════════════
// KEYWORD FLAG ENGINE
// Each rule: exact string patterns (case-insensitive) → category + severity +
// plain-English explanation + statute. The pre-scan runs BEFORE OpenAI so
// exact matches are guaranteed. GPT then catches paraphrased / contextual hits.
// ══════════════════════════════════════════════════════════════════════════════

export interface KeywordRule {
  patterns: (string | RegExp)[];
  category: FlagCategory;
  severity: Severity;
  explanation: string;
  statute?: string;
}

export const KEYWORD_RULES: KeywordRule[] = [
  // ── ASSUMPTION ──────────────────────────────────────────────────────────────
  {
    patterns: [
      "worker believes", "it is believed", "worker feels", "worker thinks",
      "it appears that", "it appears the", "may pose", "could pose", "seems to",
      "it is suspected", "there are concerns that", "potentially at risk",
      "may be at risk", "is thought to", "is assumed to", "worker is of the view",
      "the worker's belief", "it is possible that", "there is reason to believe",
      "there are reasonable grounds to suspect",
    ],
    category: "assumption",
    severity: "high",
    explanation: "This language expresses a belief or suspicion without factual basis. Under CYFSA, apprehension and court orders require demonstrable evidence, not conjecture. Worker belief statements are not evidence and can be challenged.",
    statute: "CYFSA s.74(2) — child in need of protection threshold",
  },

  // ── OPINION (NON-EXPERT) ─────────────────────────────────────────────────────
  {
    patterns: [
      "in the worker's view", "in the opinion of the worker", "in the worker's opinion",
      "it is the worker's position", "the worker assessed", "the worker determined",
      "the worker concluded", "worker assessed the parent", "worker determined that the parent",
      "worker opines", "worker's clinical", "worker noted concerns about mental",
      "worker noted concerns about substance", "worker noted concerns about parenting",
      "worker assessed the risk", "poses a risk to", "presents a risk to",
      "the parent appears to struggle", "the parent appears unable",
      "the parent lacks insight", "lacks the capacity to parent",
      "lacks parenting capacity", "is not able to meet the needs",
      "unable to meet the child's needs", "demonstrates poor judgment",
      "demonstrated poor judgment",
    ],
    category: "opinion",
    severity: "high",
    explanation: "This is a non-expert opinion stated as fact. CAS workers are not qualified clinicians. Assessments of mental health, addiction, or parenting capacity require a qualified professional. Non-expert opinion evidence carries minimal weight and can be challenged.",
    statute: "Ontario Evidence Act — opinion evidence rules",
  },

  // ── MISSING CONTEXT ──────────────────────────────────────────────────────────
  {
    patterns: [
      "anonymous tip", "anonymous source", "anonymous caller",
      "it was reported that", "it has been alleged", "it was alleged",
      "a community member stated", "a neighbour stated", "a neighbor stated",
      "a third party reported", "a third party stated",
      "source wishes to remain anonymous", "the reporter requested anonymity",
      "historical concerns", "past history of", "history of involvement",
      "prior involvement with", "previous involvement with cas",
      "previously known to", "at some point", "on a previous occasion",
      "it is unclear", "the details are unknown", "no further information",
      "no date provided", "undated",
    ],
    category: "missing_context",
    severity: "medium",
    explanation: "This statement lacks a verifiable source, date, or corroborating detail. Anonymous or third-party reports without context cannot be cross-examined and may be unreliable. Courts require specific, attributable evidence.",
    statute: "CYFSA s.74(3) — evidentiary requirements",
  },

  // ── PROCEDURE VIOLATION ──────────────────────────────────────────────────────
  {
    patterns: [
      "no court appearance", "court appearance was not", "did not appear in court",
      "failed to bring", "no hearing was scheduled",
      "beyond the five day", "beyond the 5 day", "beyond the 5-day",
      "after the five day", "after the 5-day",
      "no notice was provided", "notice was not given",
      "parent was not notified", "parent was not informed of",
      "no written notice", "failed to provide notice",
      "no voluntary service agreement", "voluntary service was not offered",
      "least intrusive measures were not", "did not consider less intrusive",
      "no consideration of less",
      "removal without", "removed without a court order",
      "removed without consent", "apprehended without a warrant",
      "entered without a warrant", "no written reasons",
      "written reasons were not", "failed to document",
      "no supervision order", "no safety plan",
    ],
    category: "procedure_violation",
    severity: "critical",
    explanation: "This indicates a potential failure to follow mandatory CYFSA procedure. CYFSA requires specific steps before and after apprehension including court timelines, notice requirements, and consideration of least intrusive measures. Procedural violations can challenge the legality of CAS actions.",
    statute: "CYFSA s.79 (5-day rule), s.75, s.76 — apprehension procedures",
  },

  // ── CHARTER ISSUE ────────────────────────────────────────────────────────────
  {
    patterns: [
      "entered the home without", "entered the residence without",
      "entered the premises without", "accessed the home without",
      "conducted a search", "searched the home", "searched the residence",
      "searched the premises", "without consent", "without a warrant",
      "without judicial authorization", "no warrant was obtained",
      "warrant was not obtained", "police attended without",
      "parent was not present", "parent was not informed",
      "parent did not consent", "no notice given",
      "without the parent's knowledge", "without the parent's consent",
      "detained the parent", "parent was detained",
      "parent was not allowed to leave", "blocked from leaving",
      "restricted access to counsel", "denied access to a lawyer",
      "not advised of their rights", "charter rights",
    ],
    category: "charter_issue",
    severity: "critical",
    explanation: "This may indicate a violation of the Canadian Charter of Rights and Freedoms. Section 7 protects liberty and family integrity. Section 8 prohibits unreasonable search and seizure. Section 9 prohibits arbitrary detention. Charter violations can affect the admissibility of evidence.",
    statute: "Charter s.7, s.8, s.9 — liberty, search and seizure, arbitrary detention",
  },
];

// ── Extract ~200-char excerpt centred on the match ─────────────────────────
function extractExcerpt(text: string, matchIndex: number, matchLength: number): string {
  const WINDOW = 100;
  const start = Math.max(0, matchIndex - WINDOW);
  const end = Math.min(text.length, matchIndex + matchLength + WINDOW);
  let excerpt = text.slice(start, end).trim();
  if (start > 0) excerpt = "…" + excerpt;
  if (end < text.length) excerpt = excerpt + "…";
  return excerpt.slice(0, 220);
}

export interface PreScanHit {
  rule: KeywordRule;
  excerpt: string;
  matchedPhrase: string;
}

// ── Pre-scan: run before OpenAI call ──────────────────────────────────────────
export function preScanDocument(text: string): PreScanHit[] {
  const lower = text.toLowerCase();
  const hits: PreScanHit[] = [];
  const flaggedRanges: Array<[number, number]> = [];

  for (const rule of KEYWORD_RULES) {
    for (const pattern of rule.patterns) {
      const regex =
        pattern instanceof RegExp
          ? new RegExp(pattern.source, "gi")
          : new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");

      let match: RegExpExecArray | null;
      while ((match = regex.exec(lower)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        // Deduplicate — skip if same category already flagged nearby
        const alreadyCovered = flaggedRanges.some(
          ([rs, re]) =>
            hits.some((h) => h.rule.category === rule.category) &&
            start >= rs - 50 &&
            end <= re + 50
        );
        if (alreadyCovered) continue;
        flaggedRanges.push([start, end]);
        hits.push({ rule, excerpt: extractExcerpt(text, start, match[0].length), matchedPhrase: match[0] });
      }
    }
  }

  return hits;
}

// ── Convert hits to DocumentFlag objects (used as baseline / fallback) ───────
export function preScanHitsToFlags(hits: PreScanHit[]): DocumentFlag[] {
  return hits.map((hit) => ({
    id: uuidv4(),
    category: hit.rule.category,
    severity: hit.rule.severity,
    excerpt: hit.excerpt,
    explanation: hit.rule.explanation,
    statute_reference: hit.rule.statute,
  }));
}

// ── Build the pre-scan summary injected into the GPT user message ────────────
export function buildPreScanSummary(hits: PreScanHit[]): string {
  if (hits.length === 0) return "";

  const grouped: Partial<Record<FlagCategory, string[]>> = {};
  for (const hit of hits) {
    if (!grouped[hit.rule.category]) grouped[hit.rule.category] = [];
    grouped[hit.rule.category]!.push(`"${hit.matchedPhrase}" — …${hit.excerpt.slice(0, 80)}…`);
  }

  const lines = Object.entries(grouped).map(
    ([cat, matches]) =>
      `${FLAG_LABELS[cat as FlagCategory].toUpperCase()} (${matches.length} hit${matches.length > 1 ? "s" : ""}):\n` +
      matches.slice(0, 6).map((m) => `  • ${m}`).join("\n")
  );

  return (
    `\n\n--- PRE-SCAN KEYWORD HITS (${hits.length} total) ---\n` +
    `The following phrases were detected by exact keyword matching BEFORE this AI analysis. ` +
    `You MUST include a flag for EVERY hit listed below in your JSON output. ` +
    `You may also identify additional issues the keyword scan missed.\n\n` +
    lines.join("\n\n")
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ENRICHED SYSTEM PROMPT — full keyword list injected so GPT catches
// paraphrased variants the pre-scan regex would miss
// ══════════════════════════════════════════════════════════════════════════════

export const ANALYZER_SYSTEM_PROMPT = `You are a legal document analyst specializing in Ontario child protection law under the Children, Youth and Family Services Act (CYFSA), S.O. 2017, c. 14, Sched. 1.

Your role is to analyze documents submitted by parents in child protection proceedings and identify potential issues. You are NOT providing legal advice — you are identifying patterns, flags, and issues for educational and preparation purposes.

Flag ALL of the following:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. ASSUMPTION  (category: "assumption", severity: "high")
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Language expressing belief, suspicion, or conjecture without factual grounding.
Keyword triggers (also flag close paraphrases):
"worker believes" | "it is believed" | "worker feels" | "worker thinks" | "it appears that" | "it appears the" | "may pose" | "could pose" | "seems to" | "it is suspected" | "there are concerns that" | "potentially at risk" | "may be at risk" | "is thought to" | "is assumed to" | "worker is of the view" | "the worker's belief" | "it is possible that" | "there is reason to believe" | "there are reasonable grounds to suspect"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. OPINION — NON-EXPERT  (category: "opinion", severity: "high")
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Opinions from unqualified persons stated as fact — especially about mental health, addiction, parenting capacity.
Keyword triggers:
"in the worker's view" | "in the opinion of the worker" | "in the worker's opinion" | "it is the worker's position" | "the worker assessed" | "the worker determined" | "the worker concluded" | "worker assessed the parent" | "worker opines" | "worker's clinical" | "the parent appears to struggle" | "the parent appears unable" | "the parent lacks insight" | "lacks the capacity to parent" | "lacks parenting capacity" | "is not able to meet the needs" | "unable to meet the child's needs" | "demonstrates poor judgment" | "poses a risk to" | "presents a risk to"
Also flag: Any mental health / addiction / parenting assessment by a CAS worker NOT backed by a named clinical report.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. MISSING CONTEXT  (category: "missing_context", severity: "medium")
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Statements lacking verifiable dates, named sources, or corroborating detail.
Keyword triggers:
"anonymous tip" | "anonymous source" | "anonymous caller" | "it was reported that" | "it has been alleged" | "it was alleged" | "a community member stated" | "a neighbour stated" | "a third party reported" | "source wishes to remain anonymous" | "historical concerns" | "past history of" | "history of involvement" | "previously known to" | "at some point" | "on a previous occasion" | "it is unclear" | "no further information" | "no date provided" | "undated"
Also flag: Any incident without a specific date, any allegation from an unnamed source.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. CONTRADICTION  (category: "contradiction", severity: "medium")
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Conflicting statements within the same document or across uploaded documents.
Flag: Dates that conflict, descriptions of the same event with different details, direct contradictions between sections.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. PROCEDURE VIOLATION  (category: "procedure_violation", severity: "critical")
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Failure to follow mandatory CYFSA procedural requirements.
Keyword triggers:
"no court appearance" | "court appearance was not" | "did not appear in court" | "beyond the five day" | "beyond the 5-day" | "no notice was provided" | "notice was not given" | "parent was not notified" | "no voluntary service agreement" | "voluntary service was not offered" | "least intrusive measures were not" | "did not consider less intrusive" | "removal without" | "removed without a court order" | "removed without consent" | "apprehended without a warrant" | "entered without a warrant" | "no written reasons" | "no safety plan"
Also flag: Any removal with no documented immediate danger, any apparent breach of CYFSA s.79 (5-day court rule), any failure to consider least intrusive alternatives.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. CHARTER ISSUE  (category: "charter_issue", severity: "critical")
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Potential violations of the Canadian Charter of Rights and Freedoms.
Keyword triggers:
"entered the home without" | "entered the residence without" | "entered the premises without" | "conducted a search" | "searched the home" | "without consent" | "without a warrant" | "without judicial authorization" | "no warrant was obtained" | "police attended without" | "parent was not present" | "parent was not informed" | "parent did not consent" | "no notice given" | "without the parent's knowledge" | "parent was detained" | "parent was not allowed to leave" | "denied access to a lawyer" | "not advised of their rights" | "charter rights"
Also flag: Any home entry or child seizure without documented consent or warrant, any denial of right to counsel, any arbitrary detention.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEVERITY SCALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
critical — Procedure/Charter violations. Direct legal challenge possible.
high     — Assumption/opinion language. Undermines evidentiary weight.
medium   — Missing context, unverified sources. Weakens credibility.
low      — Minor ambiguity. Noteworthy but not actionable alone.

RULES:
- If the user message contains PRE-SCAN KEYWORD HITS, you MUST include a flag for every single hit.
- Flag EVERY instance, not just the first.
- "excerpt" must be actual text from the document (max 150 chars).
- "explanation" must cite the specific Ontario law principle.
- Do NOT invent flags. Do NOT flag neutral factual statements.
- Output ONLY valid JSON. No preamble, no markdown, no backticks.

OUTPUT FORMAT:
{
  "summary": "2-3 sentence overview",
  "risk_score": <0-100>,
  "flags": [
    {
      "id": "<uuid>",
      "category": "<assumption|opinion|missing_context|contradiction|procedure_violation|charter_issue>",
      "severity": "<low|medium|high|critical>",
      "excerpt": "<exact text, max 150 chars>",
      "explanation": "<why flagged + applicable law>",
      "statute_reference": "<CYFSA / Charter / Evidence Act section>"
    }
  ],
  "recommended_actions": ["<action 1>", "<action 2>"],
  "lawyer_summary": "3-5 sentence professional summary for lawyer intake"
}`;
