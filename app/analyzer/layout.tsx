import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evidence Analyzer",
  description:
    "Upload CAS documents, court filings, and transcripts. AI-powered analysis detects assumptions, procedure violations, and Charter issues in child protection documents.",
};

export default function AnalyzerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
