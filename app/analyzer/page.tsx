"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertTriangle, CheckCircle, Download, Loader2 } from "lucide-react";
import { AnalysisResult, DocumentFlag } from "@/types";
import { FLAG_LABELS, FLAG_COLORS, SEVERITY_LABELS, SEVERITY_COLORS, formatFileSize, getRiskLabel, getRiskColor } from "@/lib/utils";
import toast from "react-hot-toast";

interface UploadedFile {
  file: File;
  id: string;
}

export default function AnalyzerPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((f) => ({ file: f, id: crypto.randomUUID() }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
      "audio/mpeg": [".mp3"],
      "audio/wav": [".wav"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxSize: 20 * 1024 * 1024, // 20 MB
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      toast.error("Please upload at least one document");
      return;
    }

    setAnalyzing(true);
    setResults([]);
    setSelectedResult(null);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f.file));

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Analysis failed");
      }

      const data = await response.json();
      setResults(data.results);
      if (data.results.length > 0) {
        setSelectedResult(data.results[0]);
      }
      toast.success(`Analysis complete — ${data.results.reduce((s: number, r: AnalysisResult) => s + r.total_flags, 0)} issues found`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      toast.error(message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (results.length === 0) return;
    setGeneratingPDF(true);
    try {
      const { generateIntakePackagePDF } = await import("@/lib/pdf-generator");
      const blob = generateIntakePackagePDF({
        parentName: "Parent / Guardian",
        city: "Ontario",
        analysisResults: results,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CYFSA_Intake_Package_${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Intake package downloaded");
    } catch (err) {
      toast.error("Could not generate PDF");
    } finally {
      setGeneratingPDF(false);
    }
  };

  const totalFlags = results.reduce((s, r) => s + r.total_flags, 0);
  const avgRisk = results.length
    ? Math.round(results.reduce((s, r) => s + r.risk_score, 0) / results.length)
    : 0;

  const flagCounts: Partial<Record<string, number>> = {};
  results.forEach((r) =>
    r.flags.forEach((f) => {
      flagCounts[f.category] = (flagCounts[f.category] || 0) + 1;
    })
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Header */}
      <div className="mb-12">
        <p className="section-label mb-3">Evidence Analyzer</p>
        <h1 className="section-title mb-5">
          AI Document<br />
          <span className="text-gold-500">Analysis Engine</span>
        </h1>
        <p className="font-sans text-stone-400 leading-relaxed max-w-xl">
          Upload CAS documents, court filings, or transcripts. The system detects assumptions, opinion evidence, procedural violations, and Charter issues automatically.
        </p>
      </div>

      <div className="disclaimer-banner mb-10">
        ⚠️ <strong className="text-amber-300/90">Educational analysis only — not legal advice.</strong> All findings should be reviewed by qualified legal counsel before use in proceedings.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Left: Upload + Flag Summary ── */}
        <div className="space-y-6">

          {/* Drop Zone */}
          <div
            {...getRootProps()}
            className={`drop-zone ${isDragActive ? "dragging" : ""}`}
          >
            <input {...getInputProps()} />
            <Upload size={36} className="text-gold-500 mx-auto mb-4 opacity-70" />
            <div className="font-serif text-xl text-stone-200 mb-2">
              {isDragActive ? "Drop files here..." : "Upload Case Documents"}
            </div>
            <p className="font-sans text-sm text-stone-400 mb-5 leading-relaxed">
              Drag & drop or click to browse.<br />
              Supports PDF, DOCX, TXT, MP3, JPG, PNG — up to 20 MB each.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["CAS Reports", "Court Filings", "Transcripts", "Photos", "Audio"].map((t) => (
                <span
                  key={t}
                  className="flag-badge"
                  style={{ background: "rgba(201,168,76,0.1)", color: "var(--gold)", border: "1px solid rgba(201,168,76,0.2)" }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-gold-500 flex-shrink-0" />
                    <span className="font-sans text-sm text-stone-200 truncate max-w-[200px]">{f.file.name}</span>
                    <span className="font-sans text-xs text-stone-500">{formatFileSize(f.file.size)}</span>
                  </div>
                  <button
                    onClick={() => removeFile(f.id)}
                    className="text-stone-500 hover:text-stone-300 transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}

              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="btn-gold w-full justify-center mt-2"
              >
                {analyzing ? (
                  <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
                ) : (
                  <>Analyze {files.length} Document{files.length > 1 ? "s" : ""} →</>
                )}
              </button>
            </div>
          )}

          {/* Flag Categories */}
          <div className="card">
            <h3 className="font-serif text-lg font-bold text-stone-100 mb-5">What the System Flags</h3>
            <div className="space-y-4">
              {Object.entries(FLAG_LABELS).map(([key, label]) => {
                const count = flagCounts[key] || 0;
                const color = FLAG_COLORS[key as keyof typeof FLAG_COLORS];
                const maxForBar = Math.max(...Object.values(flagCounts).filter(Boolean) as number[], 1);
                const pct = results.length > 0 ? Math.round((count / maxForBar) * 100) : 0;
                return (
                  <div key={key}>
                    <div className="flex justify-between mb-1.5">
                      <span className="font-sans text-sm text-stone-300">{label}</span>
                      <span
                        className="flag-badge"
                        style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
                      >
                        {results.length > 0 ? count : "?"}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right: Results ── */}
        <div className="space-y-6">
          {results.length > 0 ? (
            <>
              {/* Summary Card */}
              <div
                className="card"
                style={{ borderColor: "rgba(76,175,80,0.3)" }}
              >
                <div className="flex justify-between items-start mb-5">
                  <h3 className="font-serif text-xl font-bold text-stone-100">Case Report Summary</h3>
                  <span
                    className="flag-badge"
                    style={{ background: "rgba(76,175,80,0.1)", color: "#4caf50", border: "1px solid rgba(76,175,80,0.3)" }}
                  >
                    <CheckCircle size={12} /> COMPLETE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    ["Documents", String(results.length)],
                    ["Total Flags", String(totalFlags)],
                    ["Risk Score", `${avgRisk}/100`],
                    ["Risk Level", getRiskLabel(avgRisk)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg p-3 text-center"
                      style={{ background: "rgba(255,255,255,0.03)" }}
                    >
                      <div
                        className="font-serif text-2xl font-bold mb-0.5"
                        style={{ color: label === "Risk Level" ? getRiskColor(avgRisk) : "var(--gold)" }}
                      >
                        {value}
                      </div>
                      <div className="font-sans text-xs text-stone-400">{label}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleDownloadPDF}
                  disabled={generatingPDF}
                  className="btn-gold w-full justify-center"
                >
                  {generatingPDF ? (
                    <><Loader2 size={16} className="animate-spin" /> Generating PDF...</>
                  ) : (
                    <><Download size={16} /> Download Lawyer Intake Package</>
                  )}
                </button>
              </div>

              {/* Document selector */}
              {results.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {results.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedResult(r)}
                      className={`text-xs font-sans px-3 py-1.5 rounded-full transition-colors ${
                        selectedResult?.id === r.id
                          ? "bg-gold-500/20 text-gold-400 border border-gold-500/40"
                          : "text-stone-400 border border-stone-700 hover:border-stone-500"
                      }`}
                    >
                      {r.document_name.slice(0, 20)}
                    </button>
                  ))}
                </div>
              )}

              {/* Flags Preview */}
              {selectedResult && (
                <div className="card">
                  <h3 className="font-serif text-lg font-bold text-stone-100 mb-2">
                    {selectedResult.document_name}
                  </h3>
                  <p className="font-sans text-sm text-stone-400 leading-relaxed mb-5">
                    {selectedResult.summary}
                  </p>
                  <div className="space-y-3">
                    {selectedResult.flags.slice(0, 8).map((flag: DocumentFlag) => (
                      <div
                        key={flag.id}
                        className="p-3 rounded-lg"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          borderLeft: `3px solid ${FLAG_COLORS[flag.category]}`,
                        }}
                      >
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span
                            className="flag-badge"
                            style={{
                              background: `${FLAG_COLORS[flag.category]}18`,
                              color: FLAG_COLORS[flag.category],
                              border: `1px solid ${FLAG_COLORS[flag.category]}44`,
                            }}
                          >
                            {FLAG_LABELS[flag.category]}
                          </span>
                          <span
                            className="flag-badge"
                            style={{
                              background: `${SEVERITY_COLORS[flag.severity]}18`,
                              color: SEVERITY_COLORS[flag.severity],
                              border: `1px solid ${SEVERITY_COLORS[flag.severity]}44`,
                            }}
                          >
                            {SEVERITY_LABELS[flag.severity]}
                          </span>
                          {flag.statute_reference && (
                            <span className="flag-badge" style={{ background: "rgba(255,255,255,0.05)", color: "#9a9080", border: "1px solid rgba(255,255,255,0.1)" }}>
                              {flag.statute_reference}
                            </span>
                          )}
                        </div>
                        <p className="font-sans text-xs text-stone-400 italic mb-1.5">
                          &ldquo;{flag.excerpt}&rdquo;
                        </p>
                        <p className="font-sans text-xs text-stone-300 leading-relaxed">
                          {flag.explanation}
                        </p>
                      </div>
                    ))}
                    {selectedResult.flags.length > 8 && (
                      <p className="font-sans text-xs text-stone-500 text-center py-2">
                        + {selectedResult.flags.length - 8} more flags in the full PDF report
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div
              className="flex flex-col items-center justify-center rounded-xl min-h-[400px] text-center"
              style={{ border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}
            >
              <AlertTriangle size={52} className="text-stone-600 mb-5" />
              <div className="font-serif text-xl text-stone-500 mb-2">Analysis Results</div>
              <p className="font-sans text-sm text-stone-600">
                Upload documents and click<br />&ldquo;Analyze Documents&rdquo; to see results here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
