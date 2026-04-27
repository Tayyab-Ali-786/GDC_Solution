"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  limit,
} from "firebase/firestore";

export default function Dashboard() {
  const [founder, setFounder] = useState("Paul");
  const [content, setContent] = useState("");
  const [conflicts, setConflicts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const feedEndRef = useRef(null);

  // ── Real-time listener: Conflicts ──────────────────────────────
  useEffect(() => {
    const q = query(
      collection(db, "conflicts"),
      orderBy("timestamp", "desc"),
      limit(20)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setConflicts(data);
    });
    return () => unsubscribe();
  }, []);

  // ── Real-time listener: Activity Logs ──────────────────────────
  useEffect(() => {
    const q = query(
      collection(db, "logs"),
      orderBy("timestamp", "desc"),
      limit(15)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLogs(data);
    });
    return () => unsubscribe();
  }, []);

  // ── Submit a new action ────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ founder, content }),
      });

      if (res.ok) {
        setContent("");
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 2000);
      }
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Resolve a conflict ─────────────────────────────────────────
  async function resolveConflict(id) {
    try {
      await updateDoc(doc(db, "conflicts", id), { status: "resolved" });
    } catch (err) {
      console.error("Resolve error:", err);
    }
  }

  // ── Clear all data ─────────────────────────────────────────────
  async function clearAllData() {
    if (!confirm("Clear all logs and conflicts? This resets the demo."))
      return;
    try {
      await fetch("/api/clear", { method: "POST" });
    } catch (err) {
      console.error("Clear error:", err);
    }
  }

  const activeConflicts = conflicts.filter((c) => c.status === "active");
  const resolvedConflicts = conflicts.filter((c) => c.status === "resolved");

  // ── Helper: relative time ──────────────────────────────────────
  function relativeTime(ts) {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(ts).toLocaleDateString();
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="header-gradient border-b border-[var(--border)] px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[#5b4de0] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[var(--accent)]/20">
                ⚡
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--success)] border-2 border-[var(--background)] dot-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[var(--foreground)] tracking-tight">
                Founder Brain
              </h1>
              <p className="text-[11px] text-[var(--muted)] font-medium">
                AI Coordination Intelligence
              </p>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={clearAllData}
              className="focus-ring px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--danger)] hover:border-[var(--danger-border)] hover:bg-[var(--danger-glow)] transition-all duration-200 cursor-pointer"
            >
              ✕ Reset
            </button>

            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-[var(--border)]">
              {/* Live Indicator */}
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--success)]"></span>
                </span>
                <span className="text-[11px] text-[var(--muted)] font-medium">
                  Live
                </span>
              </div>

              {/* Conflict counter */}
              {activeConflicts.length > 0 ? (
                <span className="badge-danger count-pop">
                  {activeConflicts.length} Drift{activeConflicts.length !== 1 ? "s" : ""}
                </span>
              ) : (
                <span className="badge-success">Aligned</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* ── LEFT: Activity Input (5 cols) ──────────────────── */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Input Card */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-[var(--muted)] uppercase tracking-[0.1em]">
                  Log Founder Activity
                </h2>
                <span className="text-[10px] text-[var(--muted)] font-mono">
                  {logs.length} entries
                </span>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {/* Founder Toggle */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--background-subtle)] rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFounder("Paul")}
                    className={`focus-ring py-2.5 px-3 rounded-[var(--radius-sm)] text-sm font-semibold transition-all duration-250 cursor-pointer ${
                      founder === "Paul"
                        ? "bg-[var(--paul-accent)] text-white shadow-lg shadow-[var(--paul-accent)]/25"
                        : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--glass)]"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-base">🏢</span>
                      <span>Paul</span>
                      <span className="text-[10px] opacity-70 font-normal">Business</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFounder("Sam")}
                    className={`focus-ring py-2.5 px-3 rounded-[var(--radius-sm)] text-sm font-semibold transition-all duration-250 cursor-pointer ${
                      founder === "Sam"
                        ? "bg-[var(--sam-accent)] text-[#06060a] shadow-lg shadow-[var(--sam-accent)]/25"
                        : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--glass)]"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-base">💻</span>
                      <span>Sam</span>
                      <span className="text-[10px] opacity-70 font-normal">Technical</span>
                    </span>
                  </button>
                </div>

                {/* Content Input */}
                <div className="relative">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={
                      founder === "Paul"
                        ? "What business decision or commitment did Paul make?"
                        : "What technical decision or change did Sam make?"
                    }
                    rows={4}
                    className="focus-ring w-full rounded-xl bg-[var(--background-subtle)] border border-[var(--border)] p-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/40 focus:border-[var(--accent)]/50 focus:bg-[var(--background)] transition-all duration-200 resize-none leading-relaxed"
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] text-[var(--muted)]/40 font-mono">
                    {content.length > 0 ? `${content.length} chars` : ""}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className={`btn-glow w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-250 cursor-pointer ${
                    isSubmitting
                      ? "bg-[var(--card-hover)] text-[var(--muted)] cursor-wait"
                      : submitSuccess
                      ? "bg-[var(--success)] text-[#06060a]"
                      : `bg-gradient-to-r from-[var(--accent)] to-[#6055e0] text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none`
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Analyzing with AI…
                    </span>
                  ) : submitSuccess ? (
                    "✓ Logged & Analyzed"
                  ) : (
                    "Submit to Founder Brain →"
                  )}
                </button>
              </form>
            </div>

            {/* Activity Feed */}
            <div className="glass-card p-5 flex-1 overflow-hidden flex flex-col min-h-[280px]">
              <h2 className="text-xs font-bold text-[var(--muted)] uppercase tracking-[0.1em] mb-4">
                Activity Timeline
              </h2>
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {logs.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="empty-state-icon bg-[var(--glass)]">📝</div>
                    <p className="text-sm text-[var(--muted)] font-medium">
                      No activity yet
                    </p>
                    <p className="text-xs text-[var(--muted)]/50 mt-1">
                      Log a founder decision above to get started
                    </p>
                  </div>
                ) : (
                  logs.map((log, i) => (
                    <div
                      key={log.id}
                      className="animate-fade-in group flex items-start gap-3 p-3 rounded-xl bg-[var(--background-subtle)] border border-transparent hover:border-[var(--border-strong)] transition-all duration-200"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                          log.founder === "Paul"
                            ? "bg-[var(--paul-bg)] text-[var(--paul-accent)]"
                            : "bg-[var(--sam-bg)] text-[var(--sam-accent)]"
                        }`}
                      >
                        {log.founder === "Paul" ? "P" : "S"}
                      </div>
                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--foreground)]">
                            {log.founder}
                          </span>
                          <span className={`inline-block w-1 h-1 rounded-full ${
                            log.founder === "Paul" ? "bg-[var(--paul-accent)]" : "bg-[var(--sam-accent)]"
                          }`}/>
                          <span className="text-[10px] text-[var(--muted)] font-mono">
                            {relativeTime(log.timestamp)}
                          </span>
                        </div>
                        <p className="text-[13px] text-[var(--foreground-secondary)] mt-1 break-words leading-relaxed">
                          {log.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={feedEndRef} />
              </div>
            </div>
          </div>

          {/* ── RIGHT: Intelligence Feed (7 cols) ─────────────── */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Active Conflicts */}
            <div className="glass-card p-5 flex-1 overflow-hidden flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[var(--danger-glow)] flex items-center justify-center">
                    <span className="text-sm">🚨</span>
                  </div>
                  <h2 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-[0.1em]">
                    Active Conflicts
                  </h2>
                </div>
                {activeConflicts.length > 0 && (
                  <span className="badge-danger count-pop">
                    {activeConflicts.length} DRIFT{activeConflicts.length !== 1 ? "S" : ""}
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {activeConflicts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="empty-state-icon bg-[var(--success-glow)] border border-[rgba(45,212,160,0.15)]">
                      ✓
                    </div>
                    <p className="text-sm text-[var(--success)] font-semibold">
                      All Clear
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-1.5 text-center max-w-xs">
                      No coordination gaps detected between founders. Submit activity logs to start monitoring.
                    </p>
                  </div>
                ) : (
                  activeConflicts.map((conflict, i) => (
                    <div
                      key={conflict.id}
                      className="animate-slide-in conflict-pulse rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-glow)] p-5"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      {/* Conflict Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--danger)] opacity-50"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--danger)]"></span>
                          </span>
                          <span className="text-[11px] font-bold text-[var(--danger)] uppercase tracking-wider">
                            Coordination Gap Detected
                          </span>
                        </div>
                        <span className="text-[10px] text-[var(--muted)] font-mono">
                          {relativeTime(conflict.timestamp)}
                        </span>
                      </div>

                      {/* Summary */}
                      <p className="text-[13px] text-[var(--foreground)] mb-4 leading-relaxed">
                        {conflict.summary}
                      </p>

                      {/* Resolution */}
                      <div className="resolution-card p-4 mb-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-xs">💡</span>
                          <p className="text-[10px] font-bold text-[var(--accent-light)] uppercase tracking-[0.1em]">
                            AI Suggested Resolution
                          </p>
                        </div>
                        <p className="text-xs text-[var(--foreground-secondary)] leading-relaxed">
                          {conflict.resolution}
                        </p>
                      </div>

                      {/* Resolve Button */}
                      <button
                        onClick={() => resolveConflict(conflict.id)}
                        className="focus-ring w-full py-2.5 rounded-xl bg-[var(--success-glow)] text-[var(--success)] text-xs font-bold hover:bg-[rgba(45,212,160,0.18)] transition-all duration-200 border border-[rgba(45,212,160,0.15)] cursor-pointer"
                      >
                        ✓ Mark as Resolved
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Resolved Conflicts */}
            {resolvedConflicts.length > 0 && (
              <div className="glass-card p-5 max-h-56 overflow-hidden flex flex-col">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-[var(--success-glow)] flex items-center justify-center">
                    <span className="text-sm">✅</span>
                  </div>
                  <h2 className="text-xs font-bold text-[var(--muted)] uppercase tracking-[0.1em]">
                    Resolved
                  </h2>
                  <span className="text-[10px] text-[var(--muted)] font-mono ml-auto">
                    {resolvedConflicts.length} item{resolvedConflicts.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {resolvedConflicts.map((conflict) => (
                    <div
                      key={conflict.id}
                      className="rounded-xl border border-[var(--border)] bg-[var(--background-subtle)] p-3 opacity-50 hover:opacity-70 transition-opacity duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px]">✓</span>
                        <p className="text-xs text-[var(--muted)] line-through">
                          {conflict.summary}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-[10px] text-[var(--muted)] font-medium">
            Founder Brain · Build with AI Hackathon 2026
          </p>
          <p className="text-[10px] text-[var(--muted)] flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
            Powered by Gemini + Firebase
          </p>
        </div>
      </footer>
    </div>
  );
}
