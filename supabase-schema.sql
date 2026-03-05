-- ============================================================
-- CYFSA Parent Defense Platform — Supabase Database Schema
-- Run this in the Supabase SQL Editor after creating your project
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Cases table ──────────────────────────────────────────────────────────────
CREATE TABLE public.cases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  title TEXT NOT NULL,
  cas_file_number TEXT,
  court_file_number TEXT,
  assigned_court TEXT,
  next_court_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'appealing'))
);

-- ── Journal Entries ───────────────────────────────────────────────────────────
CREATE TABLE public.journal_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  date DATE NOT NULL,
  time TIME,
  location TEXT,
  event_description TEXT NOT NULL,
  cas_involved BOOLEAN DEFAULT false,
  witnesses TEXT[] DEFAULT '{}',
  evidence_attached TEXT[] DEFAULT '{}',
  notes TEXT
);

-- ── Analysis Results ──────────────────────────────────────────────────────────
CREATE TABLE public.analysis_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  document_name TEXT NOT NULL,
  document_type TEXT DEFAULT 'other',
  flags JSONB DEFAULT '[]',
  summary TEXT,
  total_flags INTEGER DEFAULT 0,
  risk_score INTEGER DEFAULT 0,
  recommended_actions TEXT[] DEFAULT '{}',
  lawyer_summary TEXT
);

-- ── Lawyers ───────────────────────────────────────────────────────────────────
CREATE TABLE public.lawyers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  name TEXT NOT NULL,
  firm TEXT,
  city TEXT NOT NULL,
  province TEXT DEFAULT 'ON',
  phone TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  website TEXT,
  bio TEXT,
  specializations TEXT[] DEFAULT '{}',
  years_experience INTEGER DEFAULT 0,
  languages TEXT[] DEFAULT ARRAY['English'],
  subscription_tier TEXT DEFAULT 'standard' CHECK (subscription_tier IN ('exclusive', 'priority', 'standard')),
  subscription_active BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  accepts_legal_aid BOOLEAN DEFAULT false,
  rating NUMERIC(3,2),
  review_count INTEGER DEFAULT 0
);

-- ── Lawyer Leads ─────────────────────────────────────────────────────────────
CREATE TABLE public.lawyer_leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_phone TEXT,
  city TEXT NOT NULL,
  case_summary TEXT NOT NULL,
  intake_package_url TEXT,
  lawyer_id UUID REFERENCES public.lawyers(id),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'retained', 'closed'))
);

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyer_leads ENABLE ROW LEVEL SECURITY;

-- Cases policies
CREATE POLICY "Users can CRUD own cases" ON public.cases
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Journal entries policies
CREATE POLICY "Users can CRUD own journal entries" ON public.journal_entries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Analysis results policies
CREATE POLICY "Users can CRUD own analysis results" ON public.analysis_results
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Lawyers are public read, admin write
CREATE POLICY "Public can read active verified lawyers" ON public.lawyers
  FOR SELECT USING (verified = true AND subscription_active = true);

-- Leads — parents can insert, lawyers can read their own leads
CREATE POLICY "Anyone can create a lead" ON public.lawyer_leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Lawyers can read leads in their city" ON public.lawyer_leads
  FOR SELECT USING (
    city IN (
      SELECT l.city FROM public.lawyers l WHERE l.email = auth.email()
    )
  );

-- ── Updated at trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX cases_user_id_idx ON public.cases(user_id);
CREATE INDEX journal_entries_case_id_idx ON public.journal_entries(case_id);
CREATE INDEX journal_entries_user_id_idx ON public.journal_entries(user_id);
CREATE INDEX analysis_results_case_id_idx ON public.analysis_results(case_id);
CREATE INDEX lawyers_city_idx ON public.lawyers(city);
CREATE INDEX lawyers_tier_idx ON public.lawyers(subscription_tier);
CREATE INDEX lawyer_leads_city_idx ON public.lawyer_leads(city);
CREATE INDEX lawyer_leads_status_idx ON public.lawyer_leads(status);
