"use client";
import { useState, useRef, useCallback } from "react";

// ─── Types ─────────────────────────────────────────────────
type FlagSeverity = "HIGH" | "MEDIUM" | "LOW";
type FlagRec = "RAISE" | "CONSIDER_CAREFULLY" | "LEAVE";
type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

interface Flag {
  id: string;
  severity: FlagSeverity;
  category: string;
  title: string;
  excerpt: string;
  legal_basis: string;
  explanation: string;
  recommendation: FlagRec;
  recommendation_reason: string;
  counter_argument: string;
  evidence_needed?: string[];
  case_law?: string[];
}

interface AnalysisResult {
  analysis_id: string | null;
  document_type: string;
  document_summary: string;
  overall_risk_level: RiskLevel;
  overall_risk_score: number;
  flags: Flag[];
  positive_factors: string[];
  cross_examination_questions: string[];
  motions_to_consider: string[];
  documents_to_prepare: string[];
  lawyer_summary: string;
  urgency_note: string;
  flag_count_high: number;
  flag_count_medium: number;
  flag_count_low: number;
  file_name?: string;
  extraction_method?: string;
  extraction_warning?: string;
  word_count?: number;
}

// ─── Colour helpers ─────────────────────────────────────────
const SEV_COLOR: Record<FlagSeverity, string> = {
  HIGH: "#ef4444",
  MEDIUM: "#f59e0b",
  LOW: "#6b9fc4",
};
const SEV_BG: Record<FlagSeverity, string> = {
  HIGH: "rgba(239,68,68,0.08)",
  MEDIUM: "rgba(245,158,11,0.08)",
  LOW: "rgba(107,159,196,0.08)",
};
const REC_COLOR: Record<FlagRec, string> = {
  RAISE: "#4ade80",
  CONSIDER_CAREFULLY: "#f59e0b",
  LEAVE: "#6b8099",
};
const REC_LABEL: Record<FlagRec, string> = {
  RAISE: "✅ RAISE THIS",
  CONSIDER_CAREFULLY: "⚠️ CONSIDER CAREFULLY",
  LEAVE: "⏭ LEAVE FOR NOW",
};
const RISK_COLOR: Record<RiskLevel, string> = {
  HIGH: "#ef4444",
  MEDIUM: "#f59e0b",
  LOW: "#4ade80",
};
const CATEGORY_LABELS: Record<string, string> = {
  HEARSAY_AS_FACT: "Hearsay as Fact",
  PROCEDURAL_VIOLATION: "Procedural Violation",
  CHARTER_BREACH: "Charter Violation",
  BIAS_DISCRIMINATION: "Bias / Discrimination",
  OPINION_EXCEEDING_EXPERTISE: "Opinion Beyond Expertise",
  MISSING_EVIDENCE: "Missing Evidence",
  CONTRADICTIONS: "Contradiction",
  VAGUE_ALLEGATIONS: "Vague Allegation",
  RIGHTS_VIOLATION: "Rights Violation",
  PROTECTIVE_FACTOR_IGNORED: "Protective Factor Ignored",
  STRATEGIC_CONSIDERATION: "Strategic Note",
};

const DOC_CATEGORIES = [
  { value: "cas_affidavit", label: "CAS Worker Affidavit" },
  { value: "safety_assessment", label: "Safety Assessment (SAT)" },
  { value: "risk_assessment", label: "Risk Assessment (SDM)" },
  { value: "investigation_notes", label: "Investigation Notes" },
  { value: "plan_of_care", label: "Society Plan of Care" },
  { value: "parenting_capacity_assessment", label: "Parenting Capacity Assessment" },
  { value: "access_visit_report", label: "Access Visit Report" },
  { value: "court_order", label: "Court Order" },
  { value: "disclosure", label: "Disclosure Package" },
  { value: "expert_report", label: "Expert Report" },
  { value: "other", label: "Other Document" },
];

// ─── Main Component ─────────────────────────────────────────
export default function DocumentAnalyzer() {
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [docCategory, setDocCategory] = useState("other");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [severityFilter, setSeverityFilter] = useState<FlagSeverity | "ALL">("ALL");
  const [expandedFlag, setExpandedFlag] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"flags" | "strategy" | "lawyer">("flags");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Drag and drop ──────────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  // ── Submit file ────────────────────────────────────────────
  async function submitFile() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    setLoadingStage("Uploading document…");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_category", docCategory);

    try {
      setLoadingStage("Extracting text…");
      await new Promise(r => setTimeout(r, 800));
      setLoadingStage("Running legal rule scan…");
      await new Promise(r => setTimeout(r, 800));
      setLoadingStage("AI deep analysis in progress…");

      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Analysis failed. Please try again.");
        if (data.upgrade_url) window.location.href = data.upgrade_url;
        return;
      }
      setResult(data);
      setActiveTab("flags");
    } catch (err: any) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
      setLoadingStage("");
    }
  }

  // ── Submit pasted text ─────────────────────────────────────
  async function submitText() {
    if (!pastedText.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    setLoadingStage("Parsing document text…");
    await new Promise(r => setTimeout(r, 600));
    setLoadingStage("Running legal rule scan…");
    await new Promise(r => setTimeout(r, 600));
    setLoadingStage("AI deep analysis in progress…");

    try {
      const res = await fetch("/api/analyze/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pastedText, document_category: docCategory }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Analysis failed."); return; }
      setResult(data);
      setActiveTab("flags");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      setLoadingStage("");
    }
  }

  // ── Export as TXT ──────────────────────────────────────────
  function exportReport() {
    if (!result) return;
    const lines: string[] = [
      "═══════════════════════════════════════════════════════",
      "CYFSA PARENT DEFENSE PLATFORM — DOCUMENT ANALYSIS REPORT",
      `Generated: ${new Date().toLocaleString("en-CA")}`,
      "NOT LEGAL ADVICE — For educational use only",
      "═══════════════════════════════════════════════════════",
      "",
      `DOCUMENT TYPE: ${result.document_type}`,
      `RISK LEVEL: ${result.overall_risk_level} (${result.overall_risk_score}/100)`,
      `FLAGS: ${result.flag_count_high} HIGH · ${result.flag_count_medium} MEDIUM · ${result.flag_count_low} LOW`,
      "",
      "DOCUMENT SUMMARY",
      "─────────────────",
      result.document_summary,
      "",
    ];

    if (result.urgency_note) {
      lines.push("⚠️  URGENT ACTION REQUIRED", "─────────────────", result.urgency_note, "");
    }

    lines.push("FLAGS IDENTIFIED", "─────────────────");
    result.flags.forEach((flag, i) => {
      lines.push(
        `\n[${flag.severity}] ${i + 1}. ${flag.title}`,
        `Category: ${CATEGORY_LABELS[flag.category] || flag.category}`,
        `Recommendation: ${flag.recommendation.replace("_", " ")}`,
        `\nExcerpt: "${flag.excerpt}"`,
        `\nLegal Basis: ${flag.legal_basis}`,
        `\nExplanation: ${flag.explanation}`,
        `\nStrategic Note: ${flag.recommendation_reason}`,
        `\nCAS Will Argue: ${flag.counter_argument}`,
        flag.evidence_needed?.length ? `\nEvidence Needed:\n${flag.evidence_needed.map(e => `  • ${e}`).join("\n")}` : "",
        flag.case_law?.length ? `\nCase Law: ${flag.case_law.join("; ")}` : "",
        "\n" + "─".repeat(55)
      );
    });

    if (result.positive_factors.length) {
      lines.push("", "POSITIVE FACTORS FOR YOUR CASE", "─────────────────");
      result.positive_factors.forEach(p => lines.push(`• ${p}`));
    }

    if (result.cross_examination_questions.length) {
      lines.push("", "CROSS-EXAMINATION QUESTIONS", "─────────────────");
      result.cross_examination_questions.forEach((q, i) => lines.push(`${i + 1}. ${q}`));
    }

    if (result.motions_to_consider.length) {
      lines.push("", "MOTIONS TO CONSIDER", "─────────────────");
      result.motions_to_consider.forEach(m => lines.push(`• ${m}`));
    }

    if (result.documents_to_prepare.length) {
      lines.push("", "DOCUMENTS TO GATHER", "─────────────────");
      result.documents_to_prepare.forEach(d => lines.push(`• ${d}`));
    }

    lines.push(
      "", "SUMMARY FOR LEGAL COUNSEL", "─────────────────",
      result.lawyer_summary, "",
      "═══════════════════════════════════════════════════════",
      "Legal Aid Ontario: 1-800-668-8258",
      "Law Society Referral: 1-800-268-8326",
      "This report is for educational purposes only. It does not",
      "constitute legal advice or create a lawyer-client relationship.",
      "═══════════════════════════════════════════════════════"
    );

    const blob = new Blob([lines.filter(l => l !== undefined).join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CYFSA_Analysis_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredFlags = result?.flags.filter(
    f => severityFilter === "ALL" || f.severity === severityFilter
  ) || [];

  // ──────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#080f1e 0%,#0c1830 60%,#080f1e 100%)",
      fontFamily: "'Georgia','Times New Roman',serif",
      color: "#dce8f0",
    }}>
      {/* HEADER */}
      <header style={{ background: "rgba(8,15,30,0.97)", borderBottom: "1px solid rgba(196,160,80,0.2)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>⚖️</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#c4a050" }}>Document Analyzer</div>
            <div style={{ fontSize: 11, color: "#4a6070", textTransform: "uppercase", letterSpacing: "0.08em" }}>CYFSA Parent Defense Platform</div>
          </div>
        </div>
        <div style={{ fontSize: 12, padding: "5px 12px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
          Not legal advice · Educational use only
        </div>
      </header>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 20px" }}>

        {/* ── UPLOAD / PASTE PANEL ─────────────────────────── */}
        {!result && !loading && (
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
            {/* Mode tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {[
                { id: "upload", label: "📎 Upload Document" },
                { id: "paste", label: "📋 Paste Text" },
              ].map(tab => (
                <button key={tab.id} onClick={() => setMode(tab.id as any)} style={{
                  flex: 1, padding: "14px", border: "none", cursor: "pointer", fontSize: 14, fontFamily: "inherit",
                  background: mode === tab.id ? "rgba(196,160,80,0.08)" : "transparent",
                  color: mode === tab.id ? "#c4a050" : "#4a6070",
                  borderBottom: mode === tab.id ? "2px solid #c4a050" : "2px solid transparent",
                }}>{tab.label}</button>
              ))}
            </div>

            <div style={{ padding: "28px" }}>
              {/* Document category */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, color: "#4a6070", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Document Type <span style={{ color: "#6b8099" }}>(improves accuracy)</span>
                </label>
                <select value={docCategory} onChange={e => setDocCategory(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#dce8f0", fontSize: 13, fontFamily: "inherit" }}>
                  {DOC_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              {/* Upload mode */}
              {mode === "upload" && (
                <>
                  <div
                    onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${dragging ? "#c4a050" : file ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.12)"}`,
                      borderRadius: 12, padding: "40px 20px", textAlign: "center", cursor: "pointer",
                      background: dragging ? "rgba(196,160,80,0.05)" : file ? "rgba(74,222,128,0.04)" : "rgba(255,255,255,0.01)",
                      transition: "all 0.15s", marginBottom: 16,
                    }}>
                    <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png" style={{ display: "none" }} onChange={e => setFile(e.target.files?.[0] || null)} />
                    {file ? (
                      <>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                        <div style={{ fontSize: 14, color: "#4ade80", fontWeight: 600, marginBottom: 4 }}>{file.name}</div>
                        <div style={{ fontSize: 12, color: "#6b8099" }}>{(file.size / 1024).toFixed(0)} KB · Click to change</div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
                        <div style={{ fontSize: 15, color: "#a0b8c8", marginBottom: 6 }}>Drop your document here or click to browse</div>
                        <div style={{ fontSize: 12, color: "#4a6070" }}>PDF · Word (.docx) · Plain text · JPG · PNG · Max 10 MB</div>
                      </>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 10, fontSize: 12, color: "#4a6070", marginBottom: 20, flexWrap: "wrap" }}>
                    {["CAS Affidavit", "Safety Assessment", "Plan of Care", "Investigation Notes", "Parenting Capacity Report"].map(d => (
                      <span key={d} style={{ padding: "3px 10px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>{d}</span>
                    ))}
                  </div>

                  <button onClick={submitFile} disabled={!file} style={{
                    width: "100%", padding: "13px", borderRadius: 10, border: "none",
                    background: file ? "linear-gradient(135deg,#8b6914,#c4a050)" : "rgba(255,255,255,0.05)",
                    color: file ? "#0c1830" : "#4a6070", fontSize: 14, fontWeight: 700,
                    cursor: file ? "pointer" : "not-allowed", fontFamily: "inherit",
                  }}>
                    {file ? `⚖️ Analyze "${file.name}"` : "Select a document to begin"}
                  </button>
                </>
              )}

              {/* Paste mode */}
              {mode === "paste" && (
                <>
                  <textarea
                    value={pastedText}
                    onChange={e => setPastedText(e.target.value)}
                    placeholder="Paste the text from the CAS document here…&#10;&#10;Tip: Open the PDF, select all text (Ctrl+A / Cmd+A), copy (Ctrl+C), then paste here."
                    style={{
                      width: "100%", minHeight: 240, padding: "14px", borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)",
                      color: "#dce8f0", fontSize: 13, fontFamily: "inherit", lineHeight: 1.6,
                      resize: "vertical", marginBottom: 16, boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <span style={{ fontSize: 12, color: "#4a6070" }}>{pastedText.length.toLocaleString()} characters pasted</span>
                    {pastedText.length > 0 && <button onClick={() => setPastedText("")} style={{ fontSize: 12, color: "#4a6070", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Clear</button>}
                  </div>
                  <button onClick={submitText} disabled={pastedText.trim().length < 100} style={{
                    width: "100%", padding: "13px", borderRadius: 10, border: "none",
                    background: pastedText.trim().length >= 100 ? "linear-gradient(135deg,#8b6914,#c4a050)" : "rgba(255,255,255,0.05)",
                    color: pastedText.trim().length >= 100 ? "#0c1830" : "#4a6070",
                    fontSize: 14, fontWeight: 700, cursor: pastedText.trim().length >= 100 ? "pointer" : "not-allowed", fontFamily: "inherit",
                  }}>
                    {pastedText.trim().length >= 100 ? "⚖️ Analyze Pasted Text" : "Paste at least 100 characters to begin"}
                  </button>
                </>
              )}

              {error && (
                <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontSize: 13 }}>
                  ⚠️ {error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── LOADING STATE ──────────────────────────────────── */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 24 }}>⚖️</div>
            <div style={{ fontSize: 17, color: "#c4a050", fontWeight: 600, marginBottom: 12 }}>Analyzing your document…</div>
            <div style={{ fontSize: 14, color: "#6b8099", marginBottom: 32 }}>{loadingStage}</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", maxWidth: 420, margin: "0 auto" }}>
              {["Rule engine scan", "Hearsay detection", "Charter analysis", "Bias check", "AI deep analysis", "Strategy generation"].map((step, i) => (
                <div key={step} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, background: "rgba(196,160,80,0.06)", border: "1px solid rgba(196,160,80,0.15)", color: "#8b7040" }}>
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RESULTS ────────────────────────────────────────── */}
        {result && !loading && (
          <>
            {/* Risk banner */}
            <div style={{
              padding: "20px 24px", borderRadius: 14, marginBottom: 20,
              background: SEV_BG[result.overall_risk_level as FlagSeverity],
              border: `1px solid ${RISK_COLOR[result.overall_risk_level]}33`,
              display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
            }}>
              <div>
                <div style={{ fontSize: 12, color: "#4a6070", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{result.document_type}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: RISK_COLOR[result.overall_risk_level] }}>
                  {result.overall_risk_level} RISK — {result.overall_risk_score}/100
                </div>
                <div style={{ fontSize: 13, color: "#8fa5bc", marginTop: 6, lineHeight: 1.5, maxWidth: 600 }}>{result.document_summary}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={exportReport} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid rgba(196,160,80,0.3)", background: "rgba(196,160,80,0.08)", color: "#c4a050", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  ⬇ Export Report
                </button>
                <button onClick={() => { setResult(null); setFile(null); setPastedText(""); setError(null); }} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#6b8099", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  Analyze Another
                </button>
              </div>
            </div>

            {/* Urgency note */}
            {result.urgency_note && (
              <div style={{ padding: "14px 18px", borderRadius: 10, marginBottom: 20, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.35)", color: "#fca5a5", fontSize: 13, lineHeight: 1.6 }}>
                <strong style={{ color: "#ef4444" }}>⚡ URGENT: </strong>{result.urgency_note}
              </div>
            )}

            {/* Flag count row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
              {[
                { label: "HIGH", count: result.flag_count_high, color: "#ef4444" },
                { label: "MEDIUM", count: result.flag_count_medium, color: "#f59e0b" },
                { label: "LOW", count: result.flag_count_low, color: "#6b9fc4" },
              ].map(({ label, count, color }) => (
                <button key={label} onClick={() => setSeverityFilter(severityFilter === label as FlagSeverity ? "ALL" : label as FlagSeverity)} style={{
                  padding: "14px", borderRadius: 10, border: `1px solid ${color}${severityFilter === label ? "66" : "22"}`,
                  background: severityFilter === label ? `${color}14` : "rgba(255,255,255,0.02)",
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color }}>{count}</div>
                  <div style={{ fontSize: 11, color: "#4a6070", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label} severity</div>
                </button>
              ))}
            </div>

            {/* Tab bar */}
            <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 4 }}>
              {[
                { id: "flags", label: `Flags (${result.flags.length})` },
                { id: "strategy", label: "Strategy" },
                { id: "lawyer", label: "For Your Lawyer" },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{
                  flex: 1, padding: "9px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontFamily: "inherit",
                  background: activeTab === tab.id ? "rgba(196,160,80,0.12)" : "transparent",
                  color: activeTab === tab.id ? "#c4a050" : "#4a6070",
                  outline: activeTab === tab.id ? "1px solid rgba(196,160,80,0.25)" : "none",
                }}>{tab.label}</button>
              ))}
            </div>

            {/* ── FLAGS TAB ────────────────────────────────── */}
            {activeTab === "flags" && (
              <div>
                {severityFilter !== "ALL" && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <span style={{ fontSize: 13, color: "#6b8099" }}>Showing {severityFilter} severity only</span>
                    <button onClick={() => setSeverityFilter("ALL")} style={{ fontSize: 12, color: "#c4a050", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Show all →</button>
                  </div>
                )}

                {filteredFlags.length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px", color: "#4a6070", fontSize: 14 }}>
                    No {severityFilter.toLowerCase()} severity flags found.
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filteredFlags.map((flag) => (
                    <div key={flag.id} style={{
                      borderRadius: 12, border: `1px solid ${SEV_COLOR[flag.severity]}22`,
                      background: SEV_BG[flag.severity], overflow: "hidden",
                    }}>
                      {/* Flag header */}
                      <button onClick={() => setExpandedFlag(expandedFlag === flag.id ? null : flag.id)} style={{
                        width: "100%", padding: "14px 18px", display: "flex", alignItems: "flex-start",
                        gap: 14, background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                      }}>
                        <div style={{ width: 60, padding: "3px 0", flexShrink: 0, textAlign: "center" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: SEV_COLOR[flag.severity], letterSpacing: "0.08em" }}>{flag.severity}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#f0e6d0", marginBottom: 4 }}>{flag.title}</div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 11, color: "#4a6070", padding: "2px 8px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                              {CATEGORY_LABELS[flag.category] || flag.category}
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: REC_COLOR[flag.recommendation] }}>
                              {REC_LABEL[flag.recommendation]}
                            </span>
                          </div>
                        </div>
                        <div style={{ color: "#4a6070", fontSize: 16, flexShrink: 0, paddingTop: 2 }}>
                          {expandedFlag === flag.id ? "▲" : "▼"}
                        </div>
                      </button>

                      {/* Flag body */}
                      {expandedFlag === flag.id && (
                        <div style={{ padding: "0 18px 18px 92px", borderTop: `1px solid ${SEV_COLOR[flag.severity]}22` }}>
                          {/* Excerpt */}
                          <div style={{ margin: "14px 0 12px", padding: "12px 14px", borderRadius: 8, background: "rgba(0,0,0,0.2)", borderLeft: `3px solid ${SEV_COLOR[flag.severity]}`, fontSize: 12, color: "#8fa5bc", fontStyle: "italic", lineHeight: 1.6 }}>
                            "{flag.excerpt}"
                          </div>

                          {/* Explanation */}
                          <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 11, color: "#4a6070", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>What This Means</div>
                            <div style={{ fontSize: 13, color: "#a0b8c8", lineHeight: 1.7 }}>{flag.explanation}</div>
                          </div>

                          {/* Legal basis */}
                          <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 11, color: "#4a6070", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Legal Authority</div>
                            <div style={{ fontSize: 12, color: "#c4a050", lineHeight: 1.6 }}>{flag.legal_basis}</div>
                          </div>

                          {/* Strategy */}
                          <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: 8, background: `${REC_COLOR[flag.recommendation]}10`, border: `1px solid ${REC_COLOR[flag.recommendation]}25` }}>
                            <div style={{ fontSize: 11, color: REC_COLOR[flag.recommendation], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Strategic Note</div>
                            <div style={{ fontSize: 13, color: "#a0b8c8", lineHeight: 1.6 }}>{flag.recommendation_reason}</div>
                          </div>

                          {/* CAS counter-argument */}
                          <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 11, color: "#4a6070", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>What CAS Will Argue</div>
                            <div style={{ fontSize: 13, color: "#8fa5bc", lineHeight: 1.6 }}>{flag.counter_argument}</div>
                          </div>

                          {/* Evidence needed */}
                          {flag.evidence_needed && flag.evidence_needed.length > 0 && (
                            <div style={{ marginBottom: 14 }}>
                              <div style={{ fontSize: 11, color: "#4a6070", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Evidence You Need</div>
                              <ul style={{ listStyle: "none" }}>
                                {flag.evidence_needed.map((e, i) => (
                                  <li key={i} style={{ fontSize: 13, color: "#a0b8c8", lineHeight: 1.6, padding: "3px 0", paddingLeft: 16, position: "relative" }}>
                                    <span style={{ position: "absolute", left: 0, color: "#4ade80" }}>→</span> {e}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Case law */}
                          {flag.case_law && flag.case_law.length > 0 && (
                            <div>
                              <div style={{ fontSize: 11, color: "#4a6070", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Case Law</div>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {flag.case_law.map((c, i) => (
                                  <span key={i} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 10, background: "rgba(196,160,80,0.08)", border: "1px solid rgba(196,160,80,0.2)", color: "#8b7040" }}>{c}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Positive factors */}
                {result.positive_factors.length > 0 && (
                  <div style={{ marginTop: 24, background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 12, padding: "18px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#4ade80", marginBottom: 12 }}>✅ Positive Factors In Your Favour</div>
                    <ul style={{ listStyle: "none" }}>
                      {result.positive_factors.map((p, i) => (
                        <li key={i} style={{ fontSize: 13, color: "#a0b8c8", lineHeight: 1.6, padding: "4px 0", paddingLeft: 18, position: "relative" }}>
                          <span style={{ position: "absolute", left: 0, color: "#4ade80" }}>✓</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ── STRATEGY TAB ─────────────────────────────── */}
            {activeTab === "strategy" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { title: "Cross-Examination Questions", icon: "❓", items: result.cross_examination_questions, color: "#c4a050", desc: "Ask the CAS worker these questions under oath" },
                  { title: "Motions to Consider", icon: "⚖️", items: result.motions_to_consider, color: "#6b9fc4", desc: "Legal steps your lawyer should consider filing" },
                  { title: "Documents to Gather Now", icon: "📂", items: result.documents_to_prepare, color: "#4ade80", desc: "Collect these before your next court date" },
                ].map(section => section.items.length > 0 && (
                  <div key={section.title} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "18px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: section.color, marginBottom: 4 }}>{section.icon} {section.title}</div>
                    <div style={{ fontSize: 12, color: "#4a6070", marginBottom: 14 }}>{section.desc}</div>
                    <ol style={{ listStylePosition: "inside" }}>
                      {section.items.map((item, i) => (
                        <li key={i} style={{ fontSize: 13, color: "#a0b8c8", lineHeight: 1.7, padding: "4px 0", listStyle: "none", paddingLeft: 16, position: "relative" }}>
                          <span style={{ position: "absolute", left: 0, color: section.color, fontWeight: 700, fontSize: 12 }}>{i + 1}.</span> {item}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}

                {/* Extraction info */}
                {result.extraction_method && (
                  <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "#4a6070" }}>
                    Document: {result.file_name} · {result.word_count?.toLocaleString()} words extracted via {result.extraction_method}
                    {result.extraction_warning && <span style={{ color: "#f59e0b", display: "block", marginTop: 4 }}>⚠ {result.extraction_warning}</span>}
                  </div>
                )}
              </div>
            )}

            {/* ── LAWYER TAB ───────────────────────────────── */}
            {activeTab === "lawyer" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ background: "rgba(196,160,80,0.05)", border: "1px solid rgba(196,160,80,0.2)", borderRadius: 12, padding: "20px" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#c4a050", marginBottom: 12 }}>⚖️ Executive Summary for Legal Counsel</div>
                  <div style={{ fontSize: 13, color: "#a0b8c8", lineHeight: 1.8 }}>{result.lawyer_summary}</div>
                </div>

                {/* Quick stats for lawyer */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                  {[
                    { label: "Flags to Raise", value: result.flags.filter(f => f.recommendation === "RAISE").length, color: "#4ade80" },
                    { label: "Consider Carefully", value: result.flags.filter(f => f.recommendation === "CONSIDER_CAREFULLY").length, color: "#f59e0b" },
                    { label: "Leave for Now", value: result.flags.filter(f => f.recommendation === "LEAVE").length, color: "#4a6070" },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px", textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                      <div style={{ fontSize: 11, color: "#4a6070" }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={exportReport} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#8b6914,#c4a050)", color: "#0c1830", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    ⬇ Download Full Report (.txt)
                  </button>
                </div>

                <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "#4a6070", lineHeight: 1.7 }}>
                  <strong style={{ color: "#6b8099" }}>Legal Aid Ontario:</strong> 1-800-668-8258<br />
                  <strong style={{ color: "#6b8099" }}>Law Society Referral:</strong> 1-800-268-8326<br />
                  <span style={{ color: "#2a3a4a" }}>This report is educational only and does not constitute legal advice.</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } select option { background: #0c1830; color: #dce8f0; }`}</style>
    </div>
  );
}
