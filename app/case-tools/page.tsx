"use client";

import { useState } from "react";
import { Plus, Trash2, CheckSquare, Square, AlertCircle, BookOpen, Calendar, Folder, School, MessageSquare } from "lucide-react";
import { JournalEntry } from "@/types";
import { EMERGENCY_CHECKLIST, formatDate } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";

const TOOLS_NAV = [
  { id: "emergency", label: "Emergency Checklist", icon: AlertCircle },
  { id: "journal", label: "Incident Journal", icon: BookOpen },
  { id: "calendar", label: "Court Calendar", icon: Calendar },
  { id: "documents", label: "Document Organizer", icon: Folder },
  { id: "school", label: "School Attendance", icon: School },
  { id: "comms", label: "Communication Log", icon: MessageSquare },
];

type JournalEntryForm = {
  date: string;
  time: string;
  location: string;
  event_description: string;
  cas_involved: boolean;
  witnesses: string;
  evidence_attached: string;
  notes: string;
};

const EMPTY_FORM: JournalEntryForm = {
  date: "",
  time: "",
  location: "",
  event_description: "",
  cas_involved: false,
  witnesses: "",
  evidence_attached: "",
  notes: "",
};

type CourtEvent = { id: string; date: string; time: string; title: string; location: string; notes: string };
type CommEntry = { id: string; date: string; worker_name: string; method: string; summary: string; action_required: string };
type SchoolEntry = { id: string; date: string; student_name: string; present: boolean; notes: string };

export default function CaseToolsPage() {
  const [activeTab, setActiveTab] = useState("emergency");
  const [checklist, setChecklist] = useState(EMERGENCY_CHECKLIST.map((i) => ({ ...i, completed: false })));

  // Journal
  const [journalForm, setJournalForm] = useState<JournalEntryForm>(EMPTY_FORM);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  // Calendar
  const [calForm, setCalForm] = useState<Omit<CourtEvent, "id">>({ date: "", time: "", title: "", location: "", notes: "" });
  const [courtEvents, setCourtEvents] = useState<CourtEvent[]>([]);

  // Comms
  const [commForm, setCommForm] = useState<Omit<CommEntry, "id">>({ date: "", worker_name: "", method: "Phone", summary: "", action_required: "" });
  const [commEntries, setCommEntries] = useState<CommEntry[]>([]);

  // School
  const [schoolForm, setSchoolForm] = useState<Omit<SchoolEntry, "id">>({ date: "", student_name: "", present: true, notes: "" });
  const [schoolEntries, setSchoolEntries] = useState<SchoolEntry[]>([]);

  const toggleCheck = (id: string) => {
    setChecklist((prev) => prev.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i)));
  };

  const addJournalEntry = () => {
    if (!journalForm.date || !journalForm.event_description) {
      toast.error("Date and event description are required");
      return;
    }
    const entry: JournalEntry = {
      id: uuidv4(),
      case_id: "local",
      created_at: new Date().toISOString(),
      date: journalForm.date,
      time: journalForm.time || undefined,
      location: journalForm.location,
      event_description: journalForm.event_description,
      cas_involved: journalForm.cas_involved,
      witnesses: journalForm.witnesses ? journalForm.witnesses.split(",").map((s) => s.trim()).filter(Boolean) : [],
      evidence_attached: journalForm.evidence_attached ? journalForm.evidence_attached.split(",").map((s) => s.trim()).filter(Boolean) : [],
      notes: journalForm.notes || undefined,
    };
    setJournalEntries((prev) => [entry, ...prev]);
    setJournalForm(EMPTY_FORM);
    toast.success("Journal entry added");
  };

  const addCourtEvent = () => {
    if (!calForm.date || !calForm.title) { toast.error("Date and title required"); return; }
    setCourtEvents((prev) => [{ ...calForm, id: uuidv4() }, ...prev].sort((a, b) => a.date.localeCompare(b.date)));
    setCalForm({ date: "", time: "", title: "", location: "", notes: "" });
    toast.success("Court event added");
  };

  const addCommEntry = () => {
    if (!commForm.date || !commForm.summary) { toast.error("Date and summary required"); return; }
    setCommEntries((prev) => [{ ...commForm, id: uuidv4() }, ...prev]);
    setCommForm({ date: "", worker_name: "", method: "Phone", summary: "", action_required: "" });
    toast.success("Communication logged");
  };

  const addSchoolEntry = () => {
    if (!schoolForm.date || !schoolForm.student_name) { toast.error("Date and student name required"); return; }
    setSchoolEntries((prev) => [{ ...schoolForm, id: uuidv4() }, ...prev]);
    setSchoolForm({ date: "", student_name: "", present: true, notes: "" });
    toast.success("Attendance logged");
  };

  const completedCount = checklist.filter((i) => i.completed).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Header */}
      <div className="mb-10">
        <p className="section-label mb-3">Parent Tools</p>
        <h1 className="section-title mb-4">
          Case Preparation<br />
          <span className="text-gold-500">& Documentation</span>
        </h1>
        <p className="font-sans text-stone-400 max-w-xl leading-relaxed">
          Tools designed to prevent evidence loss and build a court-ready record from day one. Courts value consistent, organized, timestamped documentation.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Sidebar nav */}
        <aside className="lg:w-56 flex-shrink-0">
          <div className="sticky top-20 space-y-1">
            {TOOLS_NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-sans font-medium transition-colors text-left ${
                  activeTab === id
                    ? "bg-gold-500/15 text-gold-400 border border-gold-500/25"
                    : "text-stone-400 hover:text-stone-200 hover:bg-white/5"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* ── Emergency Checklist ── */}
          {activeTab === "emergency" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-bold text-stone-100">Emergency Checklist</h2>
                <span className="font-sans text-sm text-stone-400">{completedCount}/{checklist.length} completed</span>
              </div>
              <div className="disclaimer-banner mb-6">
                ⚠️ If CAS is at your door right now, call Legal Aid Ontario first: <strong className="text-amber-300">1-800-668-8258</strong>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 rounded-full mb-8" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / checklist.length) * 100}%`, background: "linear-gradient(90deg, #c9a84c, #4caf50)" }}
                />
              </div>

              {["immediate", "within_24h", "within_week"].map((priority) => {
                const items = checklist.filter((i) => i.priority === priority);
                const labels: Record<string, string> = { immediate: "Do Immediately", within_24h: "Within 24 Hours", within_week: "Within One Week" };
                const colors: Record<string, string> = { immediate: "#e74c3c", within_24h: "#f39c12", within_week: "#4caf50" };
                return (
                  <div key={priority} className="mb-7">
                    <div
                      className="flex items-center gap-2 mb-3"
                      style={{ color: colors[priority] }}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ background: colors[priority] }} />
                      <span className="font-sans text-xs font-bold uppercase tracking-wider">{labels[priority]}</span>
                    </div>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleCheck(item.id)}
                          className="w-full flex items-start gap-3 p-4 rounded-lg text-left transition-colors"
                          style={{
                            background: item.completed ? "rgba(76,175,80,0.06)" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${item.completed ? "rgba(76,175,80,0.25)" : "rgba(255,255,255,0.07)"}`,
                          }}
                        >
                          {item.completed
                            ? <CheckSquare size={18} style={{ color: "#4caf50", flexShrink: 0, marginTop: 1 }} />
                            : <Square size={18} style={{ color: "var(--stone-muted)", flexShrink: 0, marginTop: 1 }} />}
                          <span
                            className="font-sans text-sm leading-relaxed"
                            style={{
                              color: item.completed ? "#9a9080" : "#d4caba",
                              textDecoration: item.completed ? "line-through" : "none",
                            }}
                          >
                            {item.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Incident Journal ── */}
          {activeTab === "journal" && (
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-100 mb-2">Incident Journal</h2>
              <p className="font-sans text-sm text-stone-400 mb-6 leading-relaxed">
                Courts value consistent, timestamped documentation. Record every CAS interaction and relevant event here. Be factual and specific.
              </p>

              {/* Form */}
              <div
                className="rounded-xl p-6 mb-8"
                style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.15)" }}
              >
                <h3 className="font-serif text-lg font-bold text-stone-100 mb-5">New Entry</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="section-label block mb-2">Date *</label>
                    <input type="date" className="input-field" value={journalForm.date} onChange={(e) => setJournalForm({ ...journalForm, date: e.target.value })} />
                  </div>
                  <div>
                    <label className="section-label block mb-2">Time</label>
                    <input type="time" className="input-field" value={journalForm.time} onChange={(e) => setJournalForm({ ...journalForm, time: e.target.value })} />
                  </div>
                  <div>
                    <label className="section-label block mb-2">Location *</label>
                    <input className="input-field" placeholder="e.g. Family home, 123 Main St" value={journalForm.location} onChange={(e) => setJournalForm({ ...journalForm, location: e.target.value })} />
                  </div>
                  <div>
                    <label className="section-label block mb-2">Witnesses Present</label>
                    <input className="input-field" placeholder="Names, comma-separated" value={journalForm.witnesses} onChange={(e) => setJournalForm({ ...journalForm, witnesses: e.target.value })} />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="section-label block mb-2">Event Description *</label>
                  <textarea
                    rows={4}
                    className="input-field resize-y"
                    placeholder="Describe exactly what happened. Who said what, what actions were taken, what was requested or threatened. Be precise and factual."
                    value={journalForm.event_description}
                    onChange={(e) => setJournalForm({ ...journalForm, event_description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="section-label block mb-2">Evidence Attached</label>
                    <input className="input-field" placeholder="Photos, recordings, etc." value={journalForm.evidence_attached} onChange={(e) => setJournalForm({ ...journalForm, evidence_attached: e.target.value })} />
                  </div>
                  <div>
                    <label className="section-label block mb-2">Notes</label>
                    <input className="input-field" placeholder="Additional context" value={journalForm.notes} onChange={(e) => setJournalForm({ ...journalForm, notes: e.target.value })} />
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-5">
                  <button
                    type="button"
                    onClick={() => setJournalForm({ ...journalForm, cas_involved: !journalForm.cas_involved })}
                    className="flex items-center gap-2 font-sans text-sm text-stone-300"
                  >
                    {journalForm.cas_involved ? <CheckSquare size={18} className="text-gold-500" /> : <Square size={18} className="text-stone-500" />}
                    CAS worker was present / involved
                  </button>
                </div>
                <button className="btn-gold" onClick={addJournalEntry}>
                  <Plus size={16} /> Add Journal Entry
                </button>
              </div>

              {/* Entries */}
              {journalEntries.length === 0 ? (
                <p className="font-sans text-sm text-stone-500 text-center py-8">No entries yet. Start recording events above.</p>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-serif text-lg font-bold text-stone-100">Log ({journalEntries.length} entries)</h3>
                  {journalEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-lg p-5"
                      style={{ background: "rgba(255,255,255,0.03)", borderLeft: "3px solid var(--gold)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="flag-badge" style={{ background: "rgba(201,168,76,0.1)", color: "var(--gold)", border: "1px solid rgba(201,168,76,0.2)" }}>
                          📅 {entry.date}{entry.time ? ` at ${entry.time}` : ""}
                        </span>
                        {entry.location && (
                          <span className="flag-badge" style={{ background: "rgba(255,255,255,0.05)", color: "#9a9080" }}>📍 {entry.location}</span>
                        )}
                        {entry.cas_involved && (
                          <span className="flag-badge" style={{ background: "rgba(231,76,60,0.1)", color: "#e74c3c", border: "1px solid rgba(231,76,60,0.25)" }}>CAS Present</span>
                        )}
                        {entry.witnesses.length > 0 && (
                          <span className="flag-badge" style={{ background: "rgba(255,255,255,0.05)", color: "#9a9080" }}>👤 {entry.witnesses.join(", ")}</span>
                        )}
                      </div>
                      <p className="font-sans text-sm text-stone-300 leading-relaxed">{entry.event_description}</p>
                      {entry.notes && <p className="font-sans text-xs text-stone-500 mt-2 italic">{entry.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Court Calendar ── */}
          {activeTab === "calendar" && (
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-100 mb-6">Court Calendar</h2>
              <div className="disclaimer-banner mb-6">
                ⚠️ Reminder: CAS must bring your child before court within <strong>5 days</strong> of apprehension (CYFSA s.79). Track all deadlines here.
              </div>
              <div className="rounded-xl p-6 mb-6" style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.15)" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div><label className="section-label block mb-2">Date *</label><input type="date" className="input-field" value={calForm.date} onChange={(e) => setCalForm({ ...calForm, date: e.target.value })} /></div>
                  <div><label className="section-label block mb-2">Time</label><input type="time" className="input-field" value={calForm.time} onChange={(e) => setCalForm({ ...calForm, time: e.target.value })} /></div>
                  <div><label className="section-label block mb-2">Event Title *</label><input className="input-field" placeholder="e.g. First Appearance, Motion" value={calForm.title} onChange={(e) => setCalForm({ ...calForm, title: e.target.value })} /></div>
                  <div><label className="section-label block mb-2">Court Location</label><input className="input-field" placeholder="e.g. Toronto Family Court, 311 Jarvis" value={calForm.location} onChange={(e) => setCalForm({ ...calForm, location: e.target.value })} /></div>
                </div>
                <div className="mb-4"><label className="section-label block mb-2">Notes</label><input className="input-field" placeholder="Documents required, contact, etc." value={calForm.notes} onChange={(e) => setCalForm({ ...calForm, notes: e.target.value })} /></div>
                <button className="btn-gold" onClick={addCourtEvent}><Plus size={16} /> Add Court Event</button>
              </div>
              {courtEvents.length === 0
                ? <p className="font-sans text-sm text-stone-500 text-center py-8">No events yet. Add court dates above.</p>
                : <div className="space-y-3">
                    {courtEvents.map((ev) => (
                      <div key={ev.id} className="card flex justify-between items-start">
                        <div>
                          <div className="font-serif text-lg font-bold text-stone-100 mb-1">{ev.title}</div>
                          <div className="font-sans text-sm text-gold-500 mb-1">{ev.date}{ev.time ? ` at ${ev.time}` : ""}</div>
                          {ev.location && <div className="font-sans text-xs text-stone-400">📍 {ev.location}</div>}
                          {ev.notes && <div className="font-sans text-xs text-stone-500 mt-1">{ev.notes}</div>}
                        </div>
                        <button onClick={() => setCourtEvents((p) => p.filter((e) => e.id !== ev.id))} className="text-stone-600 hover:text-stone-400 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {/* ── Communication Log ── */}
          {activeTab === "comms" && (
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-100 mb-6">Communication Log</h2>
              <div className="rounded-xl p-6 mb-6" style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.15)" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div><label className="section-label block mb-2">Date *</label><input type="date" className="input-field" value={commForm.date} onChange={(e) => setCommForm({ ...commForm, date: e.target.value })} /></div>
                  <div><label className="section-label block mb-2">Method</label>
                    <select className="input-field" value={commForm.method} onChange={(e) => setCommForm({ ...commForm, method: e.target.value })}>
                      {["Phone", "In-Person", "Email", "Text", "Letter", "Video Call"].map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div><label className="section-label block mb-2">CAS Worker Name</label><input className="input-field" placeholder="Full name + badge if known" value={commForm.worker_name} onChange={(e) => setCommForm({ ...commForm, worker_name: e.target.value })} /></div>
                  <div><label className="section-label block mb-2">Action Required</label><input className="input-field" placeholder="What was asked or demanded" value={commForm.action_required} onChange={(e) => setCommForm({ ...commForm, action_required: e.target.value })} /></div>
                </div>
                <div className="mb-4"><label className="section-label block mb-2">Summary *</label><textarea rows={3} className="input-field resize-y" placeholder="What was discussed or communicated. Be specific and factual." value={commForm.summary} onChange={(e) => setCommForm({ ...commForm, summary: e.target.value })} /></div>
                <button className="btn-gold" onClick={addCommEntry}><Plus size={16} /> Log Communication</button>
              </div>
              {commEntries.length === 0
                ? <p className="font-sans text-sm text-stone-500 text-center py-8">No communications logged yet.</p>
                : <div className="space-y-3">
                    {commEntries.map((c) => (
                      <div key={c.id} className="card" style={{ borderLeft: "3px solid var(--gold)" }}>
                        <div className="flex justify-between mb-2">
                          <div className="flex flex-wrap gap-2">
                            <span className="flag-badge" style={{ background: "rgba(201,168,76,0.1)", color: "var(--gold)", border: "1px solid rgba(201,168,76,0.2)" }}>{c.date}</span>
                            <span className="flag-badge" style={{ background: "rgba(255,255,255,0.05)", color: "#9a9080" }}>{c.method}</span>
                            {c.worker_name && <span className="flag-badge" style={{ background: "rgba(255,255,255,0.05)", color: "#9a9080" }}>👤 {c.worker_name}</span>}
                          </div>
                          <button onClick={() => setCommEntries((p) => p.filter((e) => e.id !== c.id))} className="text-stone-600 hover:text-stone-400"><Trash2 size={14} /></button>
                        </div>
                        <p className="font-sans text-sm text-stone-300 leading-relaxed">{c.summary}</p>
                        {c.action_required && <p className="font-sans text-xs text-amber-400 mt-2">⚠️ Action: {c.action_required}</p>}
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {/* ── School Attendance ── */}
          {activeTab === "school" && (
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-100 mb-6">School Attendance Log</h2>
              <div className="rounded-xl p-6 mb-6" style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.15)" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div><label className="section-label block mb-2">Date *</label><input type="date" className="input-field" value={schoolForm.date} onChange={(e) => setSchoolForm({ ...schoolForm, date: e.target.value })} /></div>
                  <div><label className="section-label block mb-2">Student Name *</label><input className="input-field" placeholder="Child's full name" value={schoolForm.student_name} onChange={(e) => setSchoolForm({ ...schoolForm, student_name: e.target.value })} /></div>
                  <div className="flex items-center gap-3 pt-6">
                    <button type="button" onClick={() => setSchoolForm({ ...schoolForm, present: !schoolForm.present })} className="flex items-center gap-2 font-sans text-sm text-stone-300">
                      {schoolForm.present ? <CheckSquare size={18} className="text-green-500" /> : <Square size={18} className="text-stone-500" />}
                      {schoolForm.present ? "Present" : "Absent"}
                    </button>
                  </div>
                  <div><label className="section-label block mb-2">Notes</label><input className="input-field" placeholder="Reason for absence, teacher notes, etc." value={schoolForm.notes} onChange={(e) => setSchoolForm({ ...schoolForm, notes: e.target.value })} /></div>
                </div>
                <button className="btn-gold" onClick={addSchoolEntry}><Plus size={16} /> Log Attendance</button>
              </div>
              {schoolEntries.length === 0
                ? <p className="font-sans text-sm text-stone-500 text-center py-8">No attendance records yet.</p>
                : <div className="space-y-2">
                    {schoolEntries.map((e) => (
                      <div key={e.id} className="flex items-center justify-between p-4 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="flex items-center gap-4">
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${e.present ? "bg-green-500" : "bg-red-500"}`} />
                          <div>
                            <div className="font-sans text-sm text-stone-200">{e.student_name} — <span className="text-stone-400">{e.date}</span></div>
                            {e.notes && <div className="font-sans text-xs text-stone-500">{e.notes}</div>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-sans font-semibold ${e.present ? "text-green-500" : "text-red-400"}`}>{e.present ? "Present" : "Absent"}</span>
                          <button onClick={() => setSchoolEntries((p) => p.filter((s) => s.id !== e.id))} className="text-stone-600 hover:text-stone-400"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {/* ── Document Organizer placeholder ── */}
          {activeTab === "documents" && (
            <div className="text-center py-16">
              <Folder size={52} className="text-stone-600 mx-auto mb-5" />
              <h2 className="font-serif text-2xl font-bold text-stone-500 mb-3">Document Organizer</h2>
              <p className="font-sans text-sm text-stone-600 max-w-sm mx-auto mb-6">Upload and organize your case documents. For AI-powered analysis, use the Evidence Analyzer.</p>
              <a href="/analyzer" className="btn-gold">Go to Evidence Analyzer →</a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
