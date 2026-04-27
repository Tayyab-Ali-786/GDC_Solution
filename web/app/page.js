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
    if (!confirm("Are you sure you want to clear all logs and conflicts for the demo?")) return;
    try {
      await fetch("/api/clear", { method: "POST" });
    } catch (err) {
      console.error("Clear error:", err);
    }
  }

  const activeConflicts = conflicts.filter((c) => c.status === "active");
  const resolvedConflicts = conflicts.filter((c) => c.status === "resolved");

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="border-b border-[var(--border)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm">
              FB
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[var(--foreground)]">
                Founder Brain
              </h1>
              <p className="text-xs text-[var(--muted)]">
                Coordination Gap Detector
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={clearAllData}
              className="px-3 py-1.5 text-xs font-semibold rounded-md border border-[var(--border)] text-[var(--muted)] hover:text-[var(--danger)] hover:border-[var(--danger)]/50 hover:bg-[var(--danger)]/10 transition-all"
            >
              🗑️ Clear Demo Data
            </button>
            <div className="flex items-center gap-2">
              <span className="dot-pulse inline-block w-2 h-2 rounded-full bg-[var(--success)]"></span>
              <span className="text-xs text-[var(--muted)]">
                AI Active · {activeConflicts.length} conflict
                {activeConflicts.length !== 1 ? "s" : ""} detected
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* ── LEFT: Activity Input ──────────────────────────── */}
          <div className="flex flex-col gap-6">
            {/* Input Card */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
              <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
                Log Activity
              </h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Founder Toggle */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFounder("Paul")}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                      founder === "Paul"
                        ? "bg-[var(--paul)] text-white shadow-lg shadow-[var(--paul)]/20"
                        : "bg-[var(--card-hover)] text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    🏢 Paul · Business
                  </button>
                  <button
                    type="button"
                    onClick={() => setFounder("Sam")}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                      founder === "Sam"
                        ? "bg-[var(--sam)] text-white shadow-lg shadow-[var(--sam)]/20"
                        : "bg-[var(--card-hover)] text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    💻 Sam · Technical
                  </button>
                </div>

                {/* Content Input */}
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    founder === "Paul"
                      ? "e.g., Told the investor analytics feature ships next week..."
                      : "e.g., Deprioritised analytics to fix auth bugs..."
                  }
                  rows={4}
                  className="w-full rounded-lg bg-[var(--background)] border border-[var(--border)] p-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all resize-none"
                />

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className={`btn-glow w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isSubmitting
                      ? "bg-[var(--border)] text-[var(--muted)] cursor-wait"
                      : submitSuccess
                      ? "bg-[var(--success)] text-white"
                      : "bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 disabled:opacity-40 disabled:cursor-not-allowed"
                  }`}
                >
                  {isSubmitting
                    ? "⏳ Analyzing with AI..."
                    : submitSuccess
                    ? "✓ Logged & Analyzed"
                    : "Submit to Founder Brain →"}
                </button>
              </form>
            </div>

            {/* Activity Feed */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 flex-1 overflow-hidden flex flex-col">
              <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
                Recent Activity
              </h2>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {logs.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]/60 text-center py-8">
                    No activity yet. Start logging decisions above.
                  </p>
                ) : (
                  logs.map((log, i) => (
                    <div
                      key={log.id}
                      className="animate-fade-in flex items-start gap-3 p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          log.founder === "Paul"
                            ? "bg-[var(--paul)]/20 text-[var(--paul)]"
                            : "bg-[var(--sam)]/20 text-[var(--sam)]"
                        }`}
                      >
                        {log.founder === "Paul" ? "P" : "S"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[var(--foreground)]">
                            {log.founder}
                          </span>
                          <span className="text-[10px] text-[var(--muted)]">
                            {new Date(log.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--muted)] mt-0.5 break-words">
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

          {/* ── RIGHT: Intelligence Feed ─────────────────────── */}
          <div className="flex flex-col gap-6">
            {/* Active Conflicts */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">
                  🚨 Active Conflicts
                </h2>
                {activeConflicts.length > 0 && (
                  <span className="text-xs font-bold text-[var(--danger)] bg-[var(--danger)]/10 px-2 py-1 rounded-full">
                    {activeConflicts.length} DRIFT
                    {activeConflicts.length !== 1 ? "S" : ""} DETECTED
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {activeConflicts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">✅</div>
                    <p className="text-sm text-[var(--success)] font-medium">
                      All Clear
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      No coordination gaps detected. Founders are aligned.
                    </p>
                  </div>
                ) : (
                  activeConflicts.map((conflict, i) => (
                    <div
                      key={conflict.id}
                      className="animate-slide-in conflict-pulse rounded-lg border-2 border-[var(--danger)]/60 bg-[var(--danger-glow)] p-4"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      {/* Conflict Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-[var(--danger)] dot-pulse"></span>
                        <span className="text-xs font-bold text-[var(--danger)] uppercase">
                          Coordination Gap
                        </span>
                        <span className="text-[10px] text-[var(--muted)] ml-auto">
                          {new Date(conflict.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Summary */}
                      <p className="text-sm text-[var(--foreground)] mb-3 leading-relaxed">
                        {conflict.summary}
                      </p>

                      {/* Resolution */}
                      <div className="rounded-md bg-[var(--card)] border border-[var(--border)] p-3 mb-3">
                        <p className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wider mb-1">
                          AI Suggested Resolution
                        </p>
                        <p className="text-xs text-[var(--muted)] leading-relaxed">
                          {conflict.resolution}
                        </p>
                      </div>

                      {/* Resolve Button */}
                      <button
                        onClick={() => resolveConflict(conflict.id)}
                        className="w-full py-2 rounded-md bg-[var(--success)]/10 text-[var(--success)] text-xs font-semibold hover:bg-[var(--success)]/20 transition-all duration-200 border border-[var(--success)]/20"
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
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 max-h-64 overflow-hidden flex flex-col">
                <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
                  ✅ Resolved ({resolvedConflicts.length})
                </h2>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {resolvedConflicts.map((conflict) => (
                    <div
                      key={conflict.id}
                      className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 opacity-60"
                    >
                      <p className="text-xs text-[var(--muted)] line-through">
                        {conflict.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-[10px] text-[var(--muted)]">
            Founder Brain · Build with AI Hackathon 2026
          </p>
          <p className="text-[10px] text-[var(--muted)]">
            Powered by Gemini 1.5 Flash + Firebase
          </p>
        </div>
      </footer>
    </div>
  );
}
