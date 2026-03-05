import Link from "next/link";
import { Scale } from "lucide-react";

const LINKS = {
  Platform: [
    { label: "Know Your Rights", href: "/rights" },
    { label: "Evidence Analyzer", href: "/analyzer" },
    { label: "Case Tools", href: "/case-tools" },
    { label: "Find a Lawyer", href: "/lawyers" },
  ],
  "Legal Resources": [
    { label: "CYFSA Text", href: "https://www.ontario.ca/laws/statute/17c14", external: true },
    { label: "Canadian Charter", href: "https://laws-lois.justice.gc.ca/eng/const/page-12.html", external: true },
    { label: "Legal Aid Ontario", href: "https://www.legalaid.on.ca", external: true },
    { label: "Ontario Family Rules", href: "https://www.ontario.ca/laws/regulation/990114", external: true },
  ],
  "For Lawyers": [
    { label: "Lawyer Portal", href: "/lawyers/apply" },
    { label: "Subscription Tiers", href: "/lawyers#tiers" },
    { label: "Lead System", href: "/lawyers#how-it-works" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-gold-500/10 mt-16">
      {/* Disclaimer bar */}
      <div className="bg-gold-500/5 border-b border-gold-500/10 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-sans text-amber-200/70 text-center leading-relaxed">
            <strong className="text-amber-300/90">⚠️ Educational Information Only — Not Legal Advice.</strong>{" "}
            This platform provides general information about Ontario family law and CYFSA procedures.
            It does not constitute legal advice. Always consult a qualified family law lawyer for your
            specific situation. Sources: CYFSA S.O. 2017, c. 14, Sched. 1 · Canadian Charter of Rights and
            Freedoms · Ontario Family Law Rules O. Reg. 114/99.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-gold-gradient rounded flex items-center justify-center">
                <Scale size={14} className="text-navy-900" />
              </div>
              <span className="font-serif font-bold text-stone-100">CYFSA Parent Defense</span>
            </div>
            <p className="text-sm font-sans text-stone-400 leading-relaxed mb-4">
              Structured legal education and evidence analysis for Ontario parents in child protection proceedings.
            </p>
            <p className="text-xs font-sans text-stone-500">Ontario, Canada</p>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="section-label mb-4">{category}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-sans text-stone-400 hover:text-gold-500 transition-colors"
                      >
                        {link.label} ↗
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm font-sans text-stone-400 hover:text-gold-500 transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gold-500/10 pt-8 flex flex-col sm:flex-row justify-between gap-4">
          <p className="text-xs font-sans text-stone-500">
            © {new Date().getFullYear()} CYFSA Parent Defense Platform. All rights reserved.
          </p>
          <p className="text-xs font-sans text-stone-500">
            Emergency: Legal Aid Ontario{" "}
            <a href="tel:18006688258" className="text-gold-600 hover:text-gold-500">
              1-800-668-8258
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
