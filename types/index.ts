// ============================================================
// CYFSA Parent Defense Platform — Core Type Definitions
// ============================================================

export type FlagCategory =
  | "assumption"
  | "opinion"
  | "missing_context"
  | "contradiction"
  | "procedure_violation"
  | "charter_issue";

export type Severity = "low" | "medium" | "high" | "critical";

export interface DocumentFlag {
  id: string;
  category: FlagCategory;
  severity: Severity;
  excerpt: string;
  explanation: string;
  statute_reference?: string;
  page?: number;
  line?: number;
}

export interface AnalysisResult {
  id: string;
  created_at: string;
  document_name: string;
  document_type: "cas_report" | "court_filing" | "transcript" | "evidence" | "other";
  flags: DocumentFlag[];
  summary: string;
  total_flags: number;
  risk_score: number; // 0–100
  recommended_actions: string[];
  lawyer_summary: string;
}

export interface CaseFile {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  cas_file_number?: string;
  court_file_number?: string;
  assigned_court?: string;
  next_court_date?: string;
  status: "active" | "resolved" | "appealing";
  analysis_results: AnalysisResult[];
  journal_entries: JournalEntry[];
  documents: UploadedDocument[];
}

export interface JournalEntry {
  id: string;
  case_id: string;
  created_at: string;
  date: string;
  time?: string;
  location: string;
  event_description: string;
  cas_involved: boolean;
  witnesses: string[];
  evidence_attached: string[];
  notes?: string;
}

export interface UploadedDocument {
  id: string;
  case_id: string;
  created_at: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  document_category: "cas_report" | "court_filing" | "transcript" | "photo" | "audio" | "other";
  analyzed: boolean;
  analysis_id?: string;
}

export interface LawyerProfile {
  id: string;
  name: string;
  firm?: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  website?: string;
  bio: string;
  specializations: string[];
  years_experience: number;
  languages: string[];
  subscription_tier: "exclusive" | "priority" | "standard";
  verified: boolean;
  accepts_legal_aid: boolean;
  rating?: number;
  review_count?: number;
}

export interface LawyerLead {
  id: string;
  created_at: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  city: string;
  case_summary: string;
  intake_package_url?: string;
  lawyer_id?: string;
  status: "new" | "contacted" | "retained" | "closed";
}

export interface IntakePackage {
  case_summary: string;
  timeline: TimelineEvent[];
  evidence_index: EvidenceItem[];
  flagged_violations: DocumentFlag[];
  recommended_statutes: string[];
  urgency_level: "routine" | "urgent" | "emergency";
  generated_at: string;
}

export interface TimelineEvent {
  date: string;
  event: string;
  source: string;
  significance: "low" | "medium" | "high";
}

export interface EvidenceItem {
  id: string;
  description: string;
  document_name: string;
  category: string;
  flags: number;
}

export type OntarioCity =
  | "Toronto"
  | "Ottawa"
  | "Mississauga"
  | "Brampton"
  | "Hamilton"
  | "London"
  | "Markham"
  | "Vaughan"
  | "Kitchener"
  | "Windsor"
  | "Oakville"
  | "Burlington"
  | "Sudbury"
  | "Oshawa"
  | "Barrie"
  | "Kingston"
  | "Guelph"
  | "Thunder Bay"
  | "Waterloo"
  | "Cambridge";

export interface RightsArticle {
  id: string;
  title: string;
  category: "cyfsa" | "charter" | "procedure" | "evidence" | "court";
  summary: string;
  full_content: string;
  statute_references: StatuteRef[];
  related_articles: string[];
}

export interface StatuteRef {
  statute: string;
  section: string;
  text: string;
  url?: string;
}

export interface EmergencyChecklist {
  id: string;
  title: string;
  items: ChecklistItem[];
  timeframe: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  priority: "immediate" | "within_24h" | "within_week";
  completed?: boolean;
}
