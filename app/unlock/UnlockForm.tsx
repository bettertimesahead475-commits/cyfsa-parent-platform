"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, Scale } from "lucide-react";

export default function UnlockForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/analyzer";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = async () => {
    if (!password.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push(redirect);
        router.refresh();
      } else {
        setError(data.error || "Incorrect password.");
        setPassword("");
        setShake(true);
        setTimeout(() => setShake(false), 600);
        inputRef.current?.focus();
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const SECTION_LABELS: Record<string, string> = {
    "/analyzer": "Evidence Analyzer",
    "/case-tools": "Case Tools",
    "/lawyers": "Lawyer Marketplace",
  };
  const sectionName = SECTION_LABELS[redirect] || "this section";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 70%)" }}
    >
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #c9a84c, #a8873a)" }}>
              <Scale size={20} style={{ color: "#0b0f1a" }} />
            </div>
            <div>
              <div className="font-serif text-lg font-bold" style={{ color: "#f0e8d8" }}>CYFSA Parent Defense</div>
              <div className="text-xs tracking-widest uppercase" style={{ color: "#9a9080" }}>Ontario Family Rights Platform</div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 16, padding: "2.5rem" }}>
          <div className="flex justify-center mb-6">
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lock size={24} style={{ color: "#c9a84c" }} />
            </div>
          </div>

          <h1 className="font-serif text-2xl font-bold text-center mb-2" style={{ color: "#f0e8d8" }}>Access Required</h1>
          <p className="font-sans text-sm text-center mb-8 leading-relaxed" style={{ color: "#9a9080" }}>
            Enter the access password to unlock{" "}
            <span style={{ color: "#c9a84c" }}>{sectionName}</span>.
          </p>

          <div className="mb-4">
            <label className="section-label block mb-2">Access Password</label>
            <div style={{ position: "relative", animation: shake ? "shake 0.5s ease" : undefined }}>
              <input
                ref={inputRef}
                type={showPassword ? "text" : "password"}
                className="input-field"
                style={{ paddingRight: "3rem", borderColor: error ? "rgba(231,76,60,0.5)" : undefined }}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Enter password"
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#9a9080", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {error && <p className="font-sans text-xs mt-2" style={{ color: "#e74c3c" }}>{error}</p>}
          </div>

          <button
            className="btn-gold"
            style={{ width: "100%", justifyContent: "center", opacity: loading || !password.trim() ? 0.7 : 1 }}
            onClick={handleSubmit}
            disabled={loading || !password.trim()}
          >
            {loading ? "Verifying..." : "Unlock Access →"}
          </button>
        </div>

        <p className="text-center mt-6 font-sans text-sm">
          <a href="/" style={{ color: "#9a9080", textDecoration: "none" }}>← Back to homepage</a>
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
