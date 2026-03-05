import { AnalysisResult, DocumentFlag } from "@/types";
import {
  ANALYZER_SYSTEM_PROMPT,
  preScanDocument,
  preScanHitsToFlags,
  buildPreScanSummary,
} from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

// Lazy OpenAI client — only instantiated at request time, not module load
function getOpenAI() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const OpenAI = require("openai").default;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function analyzeDocument(
  text: string,
  documentName: string,
  documentType: AnalysisResult["document_type"]
): Promise<AnalysisResult> {

  // ── Step 1: Pre-scan for exact keyword matches ─────────────────────────────
  const preScanHits = preScanDocument(text);
  const preScanFlags = preScanHitsToFlags(preScanHits);
  const preScanSummary = buildPreScanSummary(preScanHits);

  // ── Step 2: Send to OpenAI with pre-scan results injected ──────────────────
  const openai = getOpenAI();

  const userMessage =
    `Please analyze this document:\n\nDocument name: ${documentName}\nDocument type: ${documentType}\n\n---\n\n${text.slice(0, 12000)}` +
    preScanSummary;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: ANALYZER_SYSTEM_PROMPT },
      { role: "user",   content: userMessage },
    ],
    temperature: 0.1,
    max_tokens: 3000,
  });

  const raw = completion.choices[0]?.message?.content ?? "";

  let parsed: {
    summary: string;
    risk_score: number;
    flags: DocumentFlag[];
    recommended_actions: string[];
    lawyer_summary: string;
  };

  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    // GPT parse failed — fall back to pre-scan flags only
    const fallbackFlags = preScanFlags;
    return {
      id: uuidv4(),
      created_at: new Date().toISOString(),
      document_name: documentName,
      document_type: documentType,
      flags: fallbackFlags,
      summary: `Keyword pre-scan detected ${fallbackFlags.length} issue(s). AI analysis unavailable — manual review recommended.`,
      total_flags: fallbackFlags.length,
      risk_score: Math.min(100, fallbackFlags.length * 10),
      recommended_actions: ["Consult a family law lawyer with this document."],
      lawyer_summary: `Document pre-scan identified ${fallbackFlags.length} flagged phrase(s). Full AI analysis was unavailable. A lawyer should review the flagged excerpts directly.`,
    };
  }

  // ── Step 3: Merge — GPT flags take priority; add any pre-scan hits GPT missed
  const gptFlags: DocumentFlag[] = (parsed.flags || []).map((f) => ({
    ...f,
    id: f.id || uuidv4(),
  }));

  // Find pre-scan hits whose excerpt doesn't overlap with any GPT flag excerpt
  const missedByGPT = preScanFlags.filter((psFlag) => {
    const psExcerptCore = psFlag.excerpt.toLowerCase().replace(/[…\s]/g, "").slice(0, 40);
    return !gptFlags.some((gf) => {
      const gfExcerptCore = gf.excerpt.toLowerCase().replace(/[…\s]/g, "").slice(0, 40);
      return (
        gf.category === psFlag.category &&
        (gfExcerptCore.includes(psExcerptCore.slice(0, 20)) ||
          psExcerptCore.includes(gfExcerptCore.slice(0, 20)))
      );
    });
  });

  const allFlags: DocumentFlag[] = [...gptFlags, ...missedByGPT];

  // Boost risk score if critical flags exist
  const criticalCount = allFlags.filter((f) => f.severity === "critical").length;
  const highCount     = allFlags.filter((f) => f.severity === "high").length;
  const rawScore      = parsed.risk_score || 0;
  const boostedScore  = Math.min(100, rawScore + criticalCount * 8 + highCount * 3);

  return {
    id: uuidv4(),
    created_at: new Date().toISOString(),
    document_name: documentName,
    document_type: documentType,
    flags: allFlags,
    summary: parsed.summary || "",
    total_flags: allFlags.length,
    risk_score: boostedScore,
    recommended_actions: parsed.recommended_actions || [],
    lawyer_summary: parsed.lawyer_summary || "",
  };
}

export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "txt" || ext === "md") {
    return await file.text();
  }

  if (ext === "pdf") {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === "docx") {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (["mp3", "wav", "m4a", "ogg"].includes(ext || "")) {
    return "[Audio file uploaded — audio transcription requires Whisper API integration]";
  }

  if (["jpg", "jpeg", "png", "webp"].includes(ext || "")) {
    return "[Image uploaded — text extraction from images requires OCR integration]";
  }

  return await file.text().catch(() => "[Could not extract text from this file type]");
}
