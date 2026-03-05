import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AnalysisResult, JournalEntry } from "@/types";
import { formatDate, FLAG_LABELS as flagLabels } from "@/lib/utils";

interface IntakePackageData {
  parentName: string;
  casFileNumber?: string;
  courtFileNumber?: string;
  courtDate?: string;
  city: string;
  analysisResults: AnalysisResult[];
  journalEntries?: JournalEntry[];
}

export function generateIntakePackagePDF(data: IntakePackageData): Blob {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });

  const GOLD = [201, 168, 76] as [number, number, number];
  const NAVY = [11, 15, 26] as [number, number, number];
  const GRAY = [100, 100, 100] as [number, number, number];
  const LIGHT = [240, 232, 216] as [number, number, number];

  const pageW = doc.internal.pageSize.getWidth();

  // ── Cover Page ───────────────────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 60, "F");

  doc.setTextColor(...GOLD);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("CYFSA PARENT DEFENSE PLATFORM", 20, 20);

  doc.setTextColor(...LIGHT);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Lawyer Intake Package", 20, 35);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Confidential — Prepared for Legal Counsel", 20, 45);

  // Client info
  doc.setTextColor(...NAVY);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Client Information", 20, 75);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);

  const infoLines = [
    ["Parent / Guardian:", data.parentName],
    ["CAS File Number:", data.casFileNumber || "Not provided"],
    ["Court File Number:", data.courtFileNumber || "Not provided"],
    ["Next Court Date:", data.courtDate ? formatDate(data.courtDate) : "Not provided"],
    ["City / Region:", data.city],
    ["Package Generated:", formatDate(new Date().toISOString())],
  ];

  let y = 85;
  infoLines.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, 80, y);
    y += 8;
  });

  // Disclaimer
  y += 10;
  doc.setFillColor(255, 243, 205);
  doc.roundedRect(18, y, pageW - 36, 22, 2, 2, "F");
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.roundedRect(18, y, pageW - 36, 22, 2, 2, "S");
  doc.setTextColor(120, 80, 0);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("IMPORTANT NOTICE", 22, y + 7);
  doc.setFont("helvetica", "normal");
  doc.text(
    "This package contains educational analysis only and does not constitute legal advice.",
    22,
    y + 14
  );
  doc.text("All findings should be reviewed and verified by qualified legal counsel.", 22, y + 19);

  // ── Summary Section ──────────────────────────────────────────────────────────
  if (data.analysisResults.length > 0) {
    doc.addPage();

    doc.setFillColor(...NAVY);
    doc.rect(0, 0, pageW, 12, "F");
    doc.setTextColor(...GOLD);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("CYFSA PARENT DEFENSE — LAWYER INTAKE PACKAGE", 20, 8);

    doc.setTextColor(...NAVY);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Analysis Summary", 20, 28);

    // Stats row
    const totalFlags = data.analysisResults.reduce((s, r) => s + r.total_flags, 0);
    const avgRisk = Math.round(
      data.analysisResults.reduce((s, r) => s + r.risk_score, 0) /
        Math.max(data.analysisResults.length, 1)
    );
    const charterFlags = data.analysisResults.reduce(
      (s, r) => s + r.flags.filter((f) => f.category === "charter_issue").length,
      0
    );
    const procViolations = data.analysisResults.reduce(
      (s, r) => s + r.flags.filter((f) => f.category === "procedure_violation").length,
      0
    );

    const stats = [
      { label: "Documents Analyzed", value: String(data.analysisResults.length) },
      { label: "Total Flags", value: String(totalFlags) },
      { label: "Risk Score", value: `${avgRisk}/100` },
      { label: "Charter Issues", value: String(charterFlags) },
      { label: "Procedure Violations", value: String(procViolations) },
    ];

    const boxW = (pageW - 40 - 16) / 5;
    stats.forEach((stat, i) => {
      const x = 20 + i * (boxW + 4);
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(x, 35, boxW, 22, 2, 2, "F");
      doc.setTextColor(...NAVY);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(stat.value, x + boxW / 2, 47, { align: "center" });
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRAY);
      doc.text(stat.label, x + boxW / 2, 53, { align: "center" });
    });

    // Per-document summaries
    let dy = 70;
    data.analysisResults.forEach((result, idx) => {
      if (dy > 230) {
        doc.addPage();
        dy = 20;
      }

      doc.setDrawColor(...GOLD);
      doc.setLineWidth(1);
      doc.line(20, dy, 20, dy + 4);
      doc.setTextColor(...NAVY);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Document ${idx + 1}: ${result.document_name}`, 25, dy + 3);
      dy += 10;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      const summaryLines = doc.splitTextToSize(result.summary, pageW - 40);
      doc.text(summaryLines, 20, dy);
      dy += summaryLines.length * 5 + 8;

      if (result.lawyer_summary) {
        doc.setFillColor(245, 248, 255);
        const lsLines = doc.splitTextToSize(result.lawyer_summary, pageW - 50);
        const boxH = lsLines.length * 5 + 8;
        doc.roundedRect(18, dy - 4, pageW - 36, boxH, 2, 2, "F");
        doc.setTextColor(30, 60, 120);
        doc.setFont("helvetica", "italic");
        doc.text(lsLines, 22, dy);
        dy += boxH + 6;
      }
    });

    // ── Flags Table ─────────────────────────────────────────────────────────────
    doc.addPage();

    doc.setFillColor(...NAVY);
    doc.rect(0, 0, pageW, 12, "F");
    doc.setTextColor(...GOLD);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("CYFSA PARENT DEFENSE — LAWYER INTAKE PACKAGE", 20, 8);

    doc.setTextColor(...NAVY);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Flagged Issues", 20, 28);

    const allFlags = data.analysisResults.flatMap((r) =>
      r.flags.map((f) => ({
        ...f,
        document: r.document_name,
      }))
    );

    if (allFlags.length > 0) {
      autoTable(doc, {
        startY: 35,
        head: [["Category", "Severity", "Document", "Excerpt", "Explanation", "Statute"]],
        body: allFlags.map((f) => [
          flagLabels[f.category] || f.category,
          f.severity.toUpperCase(),
          f.document,
          f.excerpt,
          f.explanation,
          f.statute_reference || "—",
        ]),
        styles: { fontSize: 7.5, cellPadding: 3 },
        headStyles: {
          fillColor: NAVY,
          textColor: GOLD,
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 28 },
          1: { cellWidth: 18 },
          2: { cellWidth: 28 },
          3: { cellWidth: 40, fontStyle: "italic" },
          4: { cellWidth: 45 },
          5: { cellWidth: 22 },
        },
        alternateRowStyles: { fillColor: [248, 248, 248] },
      });
    }
  }

  // ── Journal Entries ──────────────────────────────────────────────────────────
  if (data.journalEntries && data.journalEntries.length > 0) {
    doc.addPage();

    doc.setFillColor(...NAVY);
    doc.rect(0, 0, pageW, 12, "F");
    doc.setTextColor(...GOLD);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("CYFSA PARENT DEFENSE — LAWYER INTAKE PACKAGE", 20, 8);

    doc.setTextColor(...NAVY);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Incident Journal", 20, 28);

    autoTable(doc, {
      startY: 35,
      head: [["Date", "Location", "Event", "CAS Involved", "Witnesses"]],
      body: data.journalEntries.map((e) => [
        e.date,
        e.location,
        e.event_description,
        e.cas_involved ? "Yes" : "No",
        e.witnesses.join(", ") || "—",
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: NAVY, textColor: GOLD, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 30 },
        2: { cellWidth: 75 },
        3: { cellWidth: 22 },
        4: { cellWidth: 30 },
      },
      alternateRowStyles: { fillColor: [248, 248, 248] },
    });
  }

  // ── Page numbers ─────────────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Page ${i} of ${pageCount} — CYFSA Parent Defense Platform — Educational purposes only, not legal advice`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
  }

  return doc.output("blob");
}
