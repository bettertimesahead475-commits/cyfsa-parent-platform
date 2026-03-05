import Link from "next/link";
import { ArrowRight, Shield, FileSearch, Users } from "lucide-react";

const STATS = [
  { value: "3", label: "Core Defense Tools" },
  { value: "CYFSA", label: "Primary Statute" },
  { value: "6+", label: "Flag Categories" },
  { value: "Charter", label: "Rights Protected" },
];

const PILLARS = [
  {
    num: "01",
    icon: <Shield size={28} />,
    title: "Educate",
    subtitle: "Public Education Layer",
    desc: "Statute-cited guides on CYFSA rights, CAS limits, the 5-day court rule, evidence standards, and Charter protections. Know the law before you enter a courtroom.",
    href: "/rights",
    cta: "Know Your Rights",
  },
  {
    num: "02",
    icon: <FileSearch size={28} />,
    title: "Document",
    subtitle: "Evidence Analyzer + Case Tools",
    desc: "Upload CAS reports, court filings, and transcripts. The AI flags assumptions, opinions, procedure violations, and Charter issues — then generates a structured case report.",
    href: "/analyzer",
    cta: "Analyze Documents",
  },
  {
    num: "03",
    icon: <Users size={28} />,
    title: "Connect",
    subtitle: "Lawyer Marketplace",
    desc: "Receive an automatic lawyer-ready intake package from your case data. Connect with verified Ontario family lawyers by city. They start prepared — you save time.",
    href: "/lawyers",
    cta: "Find a Lawyer",
  },
];

const STEPS = [
  { step: "1", title: "Understand Your Situation", desc: "Read statute-backed guides on CYFSA procedures, your rights as a parent, and what CAS can legally do." },
  { step: "2", title: "Upload Your Documents", desc: "Upload CAS reports, court filings, or transcripts. The analyzer detects assumptions, procedural flaws, and Charter violations." },
  { step: "3", title: "Generate Your Intake Package", desc: "Receive an automatic lawyer-ready summary: timeline, evidence index, flagged violations, and case brief." },
  { step: "4", title: "Connect With a Lawyer", desc: "Share your intake package with a verified Ontario family lawyer. They start prepared. You save time and money." },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Background glow */}
        <div className="absolute inset-0 bg-hero-radial pointer-events-none" />
        <div
          className="absolute top-10 right-[10%] w-72 h-72 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)",
            border: "1px solid rgba(201,168,76,0.07)",
          }}
        />

        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl">
            <div
              className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 mb-7"
              style={{
                background: "rgba(201,168,76,0.08)",
                borderColor: "rgba(201,168,76,0.22)",
              }}
            >
              <span className="section-label">Ontario Parent Rights · CYFSA Defense</span>
            </div>

            <h1 className="font-serif text-[clamp(2.5rem,5vw,4.25rem)] font-black text-stone-100 leading-[1.08] mb-6">
              Know Your Rights.
              <br />
              <span className="text-gold-500">Protect Your Family.</span>
            </h1>

            <p className="font-sans text-[1.125rem] text-stone-400 leading-relaxed max-w-xl mb-10">
              A structured legal education and evidence analysis platform for Ontario parents navigating
              child protection proceedings under CYFSA.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/analyzer" className="btn-gold">
                Analyze Your Documents <ArrowRight size={16} />
              </Link>
              <Link href="/rights" className="btn-ghost">
                Know Your Rights
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────────────── */}
      <section
        className="py-10 px-4"
        style={{ background: "rgba(201,168,76,0.04)", borderTop: "1px solid rgba(201,168,76,0.1)", borderBottom: "1px solid rgba(201,168,76,0.1)" }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-[2.75rem] font-black text-gold-500 leading-none">{s.value}</div>
              <div className="font-sans text-xs text-stone-400 mt-1.5 tracking-wide uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Three Pillars ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">The Three Pillars</p>
            <h2 className="section-title">Everything a Parent Needs</h2>
            <p className="font-sans text-stone-400 mt-4 max-w-md mx-auto">From education to court preparation — structured, calm, and built for real outcomes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PILLARS.map((p, i) => (
              <div
                key={p.num}
                className="card relative overflow-hidden"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className="absolute top-4 right-5 font-serif font-black leading-none select-none pointer-events-none"
                  style={{ fontSize: "5rem", color: "rgba(201,168,76,0.05)" }}
                >
                  {p.num}
                </div>
                <div className="text-gold-500 mb-4">{p.icon}</div>
                <div className="font-serif text-[2rem] font-black text-gold-500 mb-1">{p.title}</div>
                <div className="section-label mb-4">{p.subtitle}</div>
                <p className="font-sans text-sm text-stone-400 leading-relaxed mb-6">{p.desc}</p>
                <Link href={p.href} className="btn-ghost text-sm py-2 px-4">
                  {p.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────────── */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8"
        style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Process</p>
            <h2 className="section-title">How It Works</h2>
          </div>

          <div className="space-y-0">
            {STEPS.map((s, i) => (
              <div key={s.step} className="flex gap-8">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-serif text-lg font-bold text-navy-900 flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #c9a84c, #a8873a)" }}
                  >
                    {s.step}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className="flex-1 w-px mt-2"
                      style={{ background: "rgba(201,168,76,0.2)", minHeight: "3rem" }}
                    />
                  )}
                </div>
                <div className="pb-10 pt-1.5">
                  <h3 className="font-serif text-xl font-bold text-stone-100 mb-2">{s.title}</h3>
                  <p className="font-sans text-sm text-stone-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Emergency CTA ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="rounded-2xl p-10"
            style={{ border: "1px solid rgba(201,168,76,0.2)", background: "rgba(201,168,76,0.05)" }}
          >
            <div className="font-serif text-3xl font-bold text-stone-100 mb-4">
              CAS at Your Door?
            </div>
            <p className="font-sans text-stone-400 mb-2 leading-relaxed">
              If CAS is involved right now, your first step is to speak to a lawyer.
            </p>
            <p className="font-sans text-lg font-semibold text-gold-500 mb-8">
              Legal Aid Ontario: 1-800-668-8258
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/case-tools" className="btn-gold">
                Emergency Checklist →
              </Link>
              <Link href="/lawyers" className="btn-ghost">
                Find a Lawyer Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
