"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, Scale, Lock, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Know Your Rights", href: "/rights", protected: false },
  { label: "Evidence Analyzer", href: "/analyzer", protected: true },
  { label: "Case Tools", href: "/case-tools", protected: true },
  { label: "Find a Lawyer", href: "/lawyers", protected: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/");
    router.refresh();
    setLoggingOut(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-navy-900/95 backdrop-blur-md border-b border-gold-500/15">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-gold-gradient rounded-md flex items-center justify-center flex-shrink-0">
            <Scale size={16} className="text-navy-900" />
          </div>
          <div>
            <div className="font-serif text-[1rem] font-bold text-stone-100 leading-tight group-hover:text-gold-500 transition-colors">
              CYFSA Parent Defense
            </div>
            <div className="text-[0.55rem] tracking-[0.12em] uppercase" style={{ color: "var(--stone-muted)" }}>
              Ontario Family Rights Platform
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-sans transition-colors flex items-center gap-1.5",
                pathname === link.href
                  ? "text-gold-500 border-b-2 border-gold-500"
                  : "text-stone-400 hover:text-stone-200"
              )}
            >
              {link.protected && (
                <Lock size={10} className="opacity-40 flex-shrink-0" />
              )}
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Lock access"
            className="p-2 rounded-md text-stone-500 hover:text-stone-300 transition-colors"
          >
            <LogOut size={15} />
          </button>
          <Link href="/analyzer" className="btn-gold text-sm py-2 px-4">
            Get Help Now
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-stone-400 hover:text-gold-500 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gold-500/10 bg-navy-800 px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "px-3 py-2.5 rounded-md text-sm font-sans transition-colors flex items-center gap-2",
                pathname === link.href ? "text-gold-500 bg-gold-500/10" : "text-stone-300 hover:text-stone-100"
              )}
            >
              {link.protected && <Lock size={11} className="opacity-40" />}
              {link.label}
            </Link>
          ))}
          <div className="flex gap-2 mt-2">
            <Link href="/analyzer" onClick={() => setMobileOpen(false)} className="btn-gold text-sm flex-1 justify-center">
              Get Help Now
            </Link>
            <button onClick={handleLogout} className="btn-ghost text-sm px-3" title="Lock">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
