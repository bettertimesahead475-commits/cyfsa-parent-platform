"use client";

import { useState } from "react";
import { Search, Star, Phone, Globe, CheckCircle, ArrowRight } from "lucide-react";
import { LawyerProfile } from "@/types";
import { LAWYER_TIERS, ONTARIO_CITIES } from "@/lib/utils";
import toast from "react-hot-toast";

// Sample data — in production, this is fetched from Supabase
const SAMPLE_LAWYERS: LawyerProfile[] = [
  {
    id: "1",
    name: "Sarah Mitchell, B.A., LL.B.",
    firm: "Mitchell Family Law",
    city: "Toronto",
    province: "ON",
    phone: "416-555-0123",
    email: "smitchell@mitchellfamilylaw.ca",
    website: "mitchellfamilylaw.ca",
    bio: "Over 15 years of experience representing parents in child protection proceedings before the Ontario Court of Justice. Strong record challenging CAS evidence and procedure.",
    specializations: ["CYFSA proceedings", "Apprehension defense", "Charter challenges", "Appeal"],
    years_experience: 15,
    languages: ["English", "French"],
    subscription_tier: "exclusive",
    verified: true,
    accepts_legal_aid: true,
    rating: 4.9,
    review_count: 87,
  },
  {
    id: "2",
    name: "David Okonkwo, LL.B.",
    firm: "Okonkwo & Associates",
    city: "Hamilton",
    province: "ON",
    phone: "905-555-0456",
    email: "dokonkwo@okonkwolaw.ca",
    bio: "Dedicated family law practitioner with extensive experience in child protection matters across Hamilton and the surrounding region. Former Legal Aid duty counsel.",
    specializations: ["Child protection", "Parenting plans", "Temporary care agreements"],
    years_experience: 11,
    languages: ["English", "Yoruba"],
    subscription_tier: "priority",
    verified: true,
    accepts_legal_aid: true,
    rating: 4.7,
    review_count: 53,
  },
  {
    id: "3",
    name: "Maria Fernandez, J.D.",
    firm: "Fernandez Law Office",
    city: "Ottawa",
    province: "ON",
    phone: "613-555-0789",
    email: "mfernandez@fernandezlaw.ca",
    bio: "Bilingual family law lawyer serving Ottawa parents in child protection and custody matters. Particular focus on mental health and addiction-related CAS cases.",
    specializations: ["Bilingual services", "Mental health & CAS", "Access and custody"],
    years_experience: 8,
    languages: ["English", "French", "Spanish"],
    subscription_tier: "priority",
    verified: true,
    accepts_legal_aid: false,
    rating: 4.8,
    review_count: 41,
  },
];

export default function LawyersPage() {
  const [searchCity, setSearchCity] = useState("");
  const [filtered, setFiltered] = useState<LawyerProfile[]>(SAMPLE_LAWYERS);
  const [activeSection, setActiveSection] = useState<"find" | "apply" | "how">("find");
  const [leadForm, setLeadForm] = useState({
    parent_name: "",
    parent_email: "",
    parent_phone: "",
    city: "",
    case_summary: "",
    consent: false,
  });
  const [submittingLead, setSubmittingLead] = useState(false);

  const handleSearch = () => {
    if (!searchCity.trim()) {
      setFiltered(SAMPLE_LAWYERS);
      return;
    }
    const q = searchCity.toLowerCase();
    setFiltered(SAMPLE_LAWYERS.filter((l) => l.city.toLowerCase().includes(q)));
  };

  const handleLeadSubmit = async () => {
    if (!leadForm.parent_name || !leadForm.parent_email || !leadForm.city || !leadForm.case_summary) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!leadForm.consent) {
      toast.error("Please provide consent to share your information");
      return;
    }
    setSubmittingLead(true);
    try {
      const res = await fetch("/api/lawyer-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadForm),
      });
      if (!res.ok) throw new Error("Submission failed");
      toast.success("Your request has been sent to lawyers in your area");
      setLeadForm({ parent_name: "", parent_email: "", parent_phone: "", city: "", case_summary: "", consent: false });
    } catch {
      toast.error("Could not submit request. Please try again.");
    } finally {
      setSubmittingLead(false);
    }
  };

  const tierOrder: LawyerProfile["subscription_tier"][] = ["exclusive", "priority", "standard"];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Header */}
      <div className="mb-10">
        <p className="section-label mb-3">Lawyer Marketplace</p>
        <h1 className="section-title mb-4">
          Find Ontario<br />
          <span className="text-gold-500">Family Law Counsel</span>
        </h1>
        <p className="font-sans text-stone-400 leading-relaxed max-w-xl">
          Connect with verified Ontario family lawyers. Your case intake package is automatically generated and shared when you connect — they start prepared.
        </p>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-10 border-b border-gold-500/10 pb-0">
        {[
          { id: "find", label: "Find a Lawyer" },
          { id: "how", label: "How It Works" },
          { id: "apply", label: "For Lawyers — Apply" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveSection(t.id as typeof activeSection)}
            className={`px-5 py-3 font-sans text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeSection === t.id
                ? "border-gold-500 text-gold-500"
                : "border-transparent text-stone-400 hover:text-stone-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Find a Lawyer ── */}
      {activeSection === "find" && (
        <div>
          {/* Search */}
          <div
            className="rounded-xl p-6 mb-8"
            style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.15)" }}
          >
            <h3 className="font-serif text-xl font-bold text-stone-100 mb-4">Search by City</h3>
            <div className="flex gap-3 flex-wrap mb-4">
              <input
                className="input-field flex-1 min-w-[200px]"
                placeholder="Enter Ontario city..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button className="btn-gold" onClick={handleSearch}><Search size={16} /> Search</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Toronto", "Ottawa", "Hamilton", "Mississauga", "London", "Brampton", "Kitchener"].map((c) => (
                <button
                  key={c}
                  className="btn-ghost text-xs py-1.5 px-3"
                  onClick={() => { setSearchCity(c); setFiltered(SAMPLE_LAWYERS.filter((l) => l.city === c)); }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Lawyer Cards */}
          <div className="space-y-5 mb-12">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="font-sans text-stone-400">No lawyers found for that city. Try a nearby city or submit a lead request.</p>
              </div>
            ) : (
              filtered
                .sort((a, b) => tierOrder.indexOf(a.subscription_tier) - tierOrder.indexOf(b.subscription_tier))
                .map((lawyer) => {
                  const tierColors = { exclusive: "#c9a84c", priority: "#a0aec0", standard: "#718096" };
                  const tierColor = tierColors[lawyer.subscription_tier];
                  return (
                    <div
                      key={lawyer.id}
                      className="card"
                      style={{ borderColor: lawyer.subscription_tier === "exclusive" ? "rgba(201,168,76,0.3)" : undefined }}
                    >
                      <div className="flex flex-col sm:flex-row gap-5">
                        {/* Avatar */}
                        <div
                          className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center font-serif text-2xl font-bold"
                          style={{ background: `${tierColor}22`, color: tierColor, border: `2px solid ${tierColor}44` }}
                        >
                          {lawyer.name.charAt(0)}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-serif text-xl font-bold text-stone-100">{lawyer.name}</h3>
                                {lawyer.verified && <CheckCircle size={15} className="text-green-500 flex-shrink-0" />}
                              </div>
                              {lawyer.firm && <p className="font-sans text-sm text-stone-400">{lawyer.firm}</p>}
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                              <span
                                className="flag-badge text-[0.6rem]"
                                style={{ background: `${tierColor}18`, color: tierColor, border: `1px solid ${tierColor}40` }}
                              >
                                {LAWYER_TIERS[lawyer.subscription_tier].label}
                              </span>
                              {lawyer.rating && (
                                <div className="flex items-center gap-1">
                                  <Star size={12} className="text-gold-500 fill-gold-500" />
                                  <span className="font-sans text-xs text-stone-400">{lawyer.rating} ({lawyer.review_count})</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <p className="font-sans text-sm text-stone-400 leading-relaxed mb-3">{lawyer.bio}</p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {lawyer.specializations.map((s) => (
                              <span key={s} className="flag-badge" style={{ background: "rgba(255,255,255,0.05)", color: "#9a9080" }}>{s}</span>
                            ))}
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-stone-400">
                            <span>📍 {lawyer.city}, {lawyer.province}</span>
                            <span>⚖️ {lawyer.years_experience} years exp.</span>
                            <span>🌐 {lawyer.languages.join(", ")}</span>
                            {lawyer.accepts_legal_aid && <span className="text-green-500">✓ Legal Aid</span>}
                          </div>

                          <div className="flex flex-wrap gap-3 mt-4">
                            <a href={`tel:${lawyer.phone}`} className="btn-gold text-sm py-2 px-4">
                              <Phone size={14} /> {lawyer.phone}
                            </a>
                            {lawyer.website && (
                              <a href={`https://${lawyer.website}`} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm py-2 px-3">
                                <Globe size={13} /> Website
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          {/* Lead Request Form */}
          <div
            className="rounded-xl p-8"
            style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.15)" }}
          >
            <h3 className="font-serif text-2xl font-bold text-stone-100 mb-2">Request Lawyer Contact</h3>
            <p className="font-sans text-sm text-stone-400 mb-6 leading-relaxed">
              Submit your information and case summary. Matching lawyers in your city will receive your case intake package and reach out directly.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div><label className="section-label block mb-2">Your Name *</label><input className="input-field" value={leadForm.parent_name} onChange={(e) => setLeadForm({ ...leadForm, parent_name: e.target.value })} /></div>
              <div><label className="section-label block mb-2">Email *</label><input type="email" className="input-field" value={leadForm.parent_email} onChange={(e) => setLeadForm({ ...leadForm, parent_email: e.target.value })} /></div>
              <div><label className="section-label block mb-2">Phone</label><input type="tel" className="input-field" value={leadForm.parent_phone} onChange={(e) => setLeadForm({ ...leadForm, parent_phone: e.target.value })} /></div>
              <div>
                <label className="section-label block mb-2">City *</label>
                <select className="input-field" value={leadForm.city} onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })}>
                  <option value="">Select city</option>
                  {ONTARIO_CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="mb-5">
              <label className="section-label block mb-2">Brief Case Summary *</label>
              <textarea rows={4} className="input-field resize-y" placeholder="Describe your situation briefly. This will be shared with lawyers in your city." value={leadForm.case_summary} onChange={(e) => setLeadForm({ ...leadForm, case_summary: e.target.value })} />
            </div>
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setLeadForm({ ...leadForm, consent: !leadForm.consent })}
                className="flex items-start gap-3 font-sans text-sm text-stone-300 text-left"
              >
                <div className={`w-5 h-5 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${leadForm.consent ? "bg-gold-500 border-gold-500" : "border-stone-600"}`}>
                  {leadForm.consent && <span className="text-navy-900 text-xs font-bold">✓</span>}
                </div>
                I consent to sharing my case summary with verified Ontario family lawyers on this platform for the purpose of obtaining legal representation.
              </button>
            </div>
            <button className="btn-gold" onClick={handleLeadSubmit} disabled={submittingLead}>
              {submittingLead ? "Submitting..." : <><ArrowRight size={16} /> Send Request to Lawyers</>}
            </button>
          </div>
        </div>
      )}

      {/* ── How It Works ── */}
      {activeSection === "how" && (
        <div className="max-w-2xl">
          <div className="space-y-0 mb-12">
            {[
              { icon: "📂", title: "Parent uploads case documents", desc: "Upload CAS reports, court filings, or any relevant documents to the Evidence Analyzer." },
              { icon: "🤖", title: "System generates intake summary", desc: "The AI flags assumptions, procedure violations, and Charter issues. A structured summary is automatically generated." },
              { icon: "✅", title: "Parent consents to share", desc: "You review the summary and explicitly consent before any information is sent to lawyers." },
              { icon: "📧", title: "Lawyer receives lead package", desc: "Matching lawyers in your city receive the intake package. They reach out directly — starting from a place of preparation." },
            ].map((step, i, arr) => (
              <div key={i} className="flex gap-6">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="text-3xl">{step.icon}</div>
                  {i < arr.length - 1 && <div className="w-px flex-1 mt-3" style={{ background: "rgba(201,168,76,0.2)", minHeight: "3rem" }} />}
                </div>
                <div className="pb-10 pt-0.5">
                  <h3 className="font-serif text-xl font-bold text-stone-100 mb-1">{step.title}</h3>
                  <p className="font-sans text-sm text-stone-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── For Lawyers ── */}
      {activeSection === "apply" && (
        <div>
          <p className="font-sans text-stone-400 max-w-xl mb-10 leading-relaxed">
            Reach parents who need legal help in Ontario — with pre-screened leads delivered alongside a structured case intake package. Choose your city and tier.
          </p>

          {/* Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {(["exclusive", "priority", "standard"] as const).map((tier) => {
              const t = LAWYER_TIERS[tier];
              const color = { exclusive: "#c9a84c", priority: "#a0aec0", standard: "#718096" }[tier];
              return (
                <div
                  key={tier}
                  className="rounded-xl p-7 relative"
                  style={{ background: "#0f1422", border: `1px solid ${color}44` }}
                >
                  {tier === "exclusive" && (
                    <div
                      className="absolute top-4 right-4 flag-badge"
                      style={{ background: "rgba(201,168,76,0.15)", color: "var(--gold)", border: "1px solid rgba(201,168,76,0.3)" }}
                    >
                      BEST
                    </div>
                  )}
                  <div className="font-serif text-2xl font-bold mb-1" style={{ color }}>{t.label}</div>
                  <div className="font-serif text-3xl font-black text-stone-100 mb-1">{t.price}</div>
                  <div className="font-sans text-xs text-stone-500 mb-6">{t.period}</div>
                  <div className="space-y-3 mb-7">
                    {[t.placement, t.leads, "Verified badge", "Ontario city listing"].concat(
                      t.badge ? ["Priority contact badge"] : []
                    ).map((f) => (
                      <div key={f} className="flex items-center gap-2.5">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                          style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}
                        >
                          ✓
                        </div>
                        <span className="font-sans text-sm text-stone-300">{f}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    className="w-full py-3 rounded-lg font-sans font-semibold text-sm transition-colors"
                    style={{ background: `${color}18`, border: `1px solid ${color}55`, color }}
                    onClick={() => toast("Lawyer applications open soon — leave your email at the contact form.", { icon: "📧" })}
                  >
                    Apply as a Lawyer →
                  </button>
                </div>
              );
            })}
          </div>

          <div className="disclaimer-banner">
            Lawyers on this platform are independently verified. CYFSA Parent Defense does not guarantee the quality of legal services provided. Always conduct your own due diligence when retaining legal counsel.
          </div>
        </div>
      )}
    </div>
  );
}
