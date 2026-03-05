import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { STATUTES } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Know Your Rights",
  description: "Statute-backed information on Ontario parent rights under CYFSA. Know what CAS can and cannot do, the 5-day court rule, evidence standards, and Charter protections.",
};

const RIGHTS = [
  {
    icon: "⚖️",
    title: "Right to Legal Representation",
    category: "Fundamental",
    content: `You have the right to a lawyer at every stage of child protection proceedings. If you cannot afford one, you may qualify for Legal Aid Ontario (call 1-800-668-8258). Do not proceed to court without legal representation if at all possible. Ask for an adjournment if you need time to retain counsel.`,
    statutes: ["CYFSA s.75(3) — right to legal representation", "Charter s.7 — right to life, liberty and security"],
  },
  {
    icon: "📅",
    title: "The 5-Day Court Rule",
    category: "Critical Procedure",
    content: `When CAS apprehends (removes) a child, they must bring the matter before the court within 5 days. This is a mandatory procedural requirement. If CAS fails to meet this deadline, it is a procedure violation under CYFSA. Track the date of removal carefully and confirm a court appearance is scheduled.`,
    statutes: ["CYFSA s.79 — hearing within 5 days of apprehension"],
  },
  {
    icon: "🚫",
    title: "What CAS Can and Cannot Do",
    category: "Limits of Authority",
    content: `CAS can apprehend (remove) a child WITHOUT a court order only if they believe the child is in immediate danger and there is no time to get a warrant. In all other circumstances, CAS must obtain a court order first. CAS CANNOT enter your home without consent or a warrant. CAS CANNOT remove your child based on suspicion or opinion alone — they must have grounds under CYFSA.`,
    statutes: ["CYFSA s.79 — apprehension with and without warrant", "Charter s.8 — protection against unreasonable search"],
  },
  {
    icon: "📊",
    title: "Grounds for Apprehension vs. Removal Threshold",
    category: "Legal Standard",
    content: `CAS must meet the threshold in CYFSA s.74(2) to establish that a child is "in need of protection." This is a legal standard — not a gut feeling or worker opinion. Grounds include: physical harm, sexual abuse, emotional harm, neglect, or developmental harm. The threshold must be established by evidence, not assumptions or speculation.`,
    statutes: ["CYFSA s.74(2) — definition of child in need of protection", "CYFSA s.1 — least intrusive measures principle"],
  },
  {
    icon: "🔍",
    title: "Evidence vs. Opinion",
    category: "Evidentiary Standard",
    content: `There is a critical legal distinction between evidence and opinion. Statements like "the worker believes the parent may pose a risk" are opinion — not evidence. Evidence requires facts: dates, locations, observed events, medical records, professional assessments by qualified experts. Non-expert opinions from CAS workers about your mental health, substance use, or parenting ability carry minimal weight without professional backing. Challenge all opinion-based statements in CAS reports.`,
    statutes: ["Ontario Evidence Act — opinion evidence rules", "CYFSA hearings — evidentiary standards"],
  },
  {
    icon: "📝",
    title: "Documentation Discipline",
    category: "Protection Strategy",
    content: `Consistent, timestamped documentation is one of the most powerful tools available to parents. Courts value organized, dated records over vague recollections. For every CAS interaction, record: the date and time, the worker's full name and badge, exactly what was said, who was present, and what was requested or threatened. Keep all texts, emails, and voicemails from CAS. Start an incident journal immediately.`,
    statutes: ["General evidentiary principle — contemporaneous records"],
  },
  {
    icon: "🧠",
    title: "Mental Health and Addiction Scenarios",
    category: "Common Issues",
    content: `Having a mental health condition or history of addiction does NOT automatically mean your child is in need of protection. CAS must show that your condition creates a specific, demonstrable risk to your child at the present time. A parent can have a mental health diagnosis and be a capable, loving parent. Request that any mental health assessment be conducted by a qualified professional — not opined on by a CAS worker.`,
    statutes: ["CYFSA s.74(2)(a) — physical harm threshold", "Human Rights Code — disability protections"],
  },
  {
    icon: "🏛️",
    title: "Court Form Guides",
    category: "Procedure",
    content: `Child protection proceedings in Ontario use specific Ontario Family Law Rules forms. Key forms include: Form 8: Application; Form 14: Notice of Motion; Form 13: Financial Statement (if relevant); Form 35.1: Affidavit for Child Protection matters. All forms must be served on the other parties and filed with the court. Timelines and service requirements are strict — missing a deadline can have serious consequences.`,
    statutes: ["Ontario Family Law Rules O. Reg. 114/99", "CYFSA — procedural requirements"],
  },
  {
    icon: "🛡️",
    title: "Charter Protections in CAS Investigations",
    category: "Constitutional Rights",
    content: `The Canadian Charter of Rights and Freedoms protects you during CAS investigations. Section 7 protects your right to liberty and security of the person — this includes your family integrity. Section 8 protects against unreasonable search and seizure — CAS cannot enter your home without consent or legal authority. Section 9 protects against arbitrary detention. Charter violations can affect the admissibility of evidence and the conduct of proceedings.`,
    statutes: ["Charter s.7 — liberty and security", "Charter s.8 — search and seizure", "Charter s.9 — arbitrary detention"],
  },
];

export default function RightsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Header */}
      <div className="mb-12">
        <p className="section-label mb-3">Know Your Rights</p>
        <h1 className="section-title mb-5">
          Ontario Parent Rights<br />
          <span className="text-gold-500">Under CYFSA</span>
        </h1>
        <p className="font-sans text-stone-400 leading-relaxed max-w-xl">
          Statute-backed information on child protection law in Ontario. Every right below is sourced directly from CYFSA, the Canadian Charter, or Ontario Family Law Rules.
        </p>
      </div>

      <div className="disclaimer-banner mb-10">
        ⚠️ <strong className="text-amber-300/90">Educational information only — not legal advice.</strong> This content summarizes Ontario statutes for informational purposes. Consult a family law lawyer for advice on your specific case.
      </div>

      {/* Rights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
        {RIGHTS.map((right, i) => (
          <div key={i} className="card">
            <div className="flex items-start gap-4 mb-4">
              <span className="text-3xl flex-shrink-0">{right.icon}</span>
              <div>
                <div className="inline-flex items-center mb-1">
                  <span
                    className="flag-badge text-[0.6rem]"
                    style={{ background: "rgba(201,168,76,0.1)", color: "var(--gold)", border: "1px solid rgba(201,168,76,0.25)" }}
                  >
                    {right.category}
                  </span>
                </div>
                <h2 className="font-serif text-lg font-bold text-stone-100">{right.title}</h2>
              </div>
            </div>
            <p className="font-sans text-sm text-stone-400 leading-relaxed mb-5">{right.content}</p>
            <div className="space-y-1.5">
              {right.statutes.map((s, j) => (
                <div
                  key={j}
                  className="text-xs font-sans px-2.5 py-1.5 rounded"
                  style={{ background: "rgba(201,168,76,0.06)", color: "var(--gold)", borderLeft: "2px solid rgba(201,168,76,0.4)" }}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Statute Sources */}
      <div
        className="rounded-xl p-8"
        style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.15)" }}
      >
        <h2 className="font-serif text-2xl font-bold text-stone-100 mb-6">Primary Law Sources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {Object.values(STATUTES).map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-5 rounded-lg transition-colors group"
              style={{ background: "rgba(255,255,255,0.03)", borderLeft: "3px solid var(--gold)" }}
            >
              <div className="font-serif text-xl font-bold text-gold-500 mb-1 group-hover:text-gold-400 transition-colors flex items-center gap-2">
                {s.name.includes("CYFSA") ? "CYFSA" : s.name.includes("Charter") ? "Charter" : "Family Law Rules"}
                <ExternalLink size={13} className="opacity-50" />
              </div>
              <div className="font-sans text-sm text-stone-300 mb-1.5">{s.name}</div>
              <div className="font-sans text-xs text-stone-500">{s.citation}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
