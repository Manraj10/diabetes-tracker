import { useCallback, useEffect, useState } from "react";
import {
  apiUrl,
  createEntry,
  getEntries,
  getRecentSummary,
  getTodaySummary,
} from "./api";
import { EntriesList } from "./components/EntriesList";
import { EntryForm } from "./components/EntryForm";
import { SummaryCards } from "./components/SummaryCards";
import { TrendChart } from "./components/TrendChart";
import type { DailySummary, Entry, EntryPayload, TodaySummary } from "./types";

type Notice = { tone: "success" | "error"; message: string } | null;

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function RefreshIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
      <path
        d="M20 11a8 8 0 1 0-2.34 5.66M20 11V5m0 6h-6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [today, setToday] = useState<TodaySummary | null>(null);
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);

    try {
      const [entriesData, recentData, todayData] = await Promise.all([
        getEntries(),
        getRecentSummary(7),
        getTodaySummary(),
      ]);
      setEntries(entriesData);
      setDailySummaries(recentData.daily_summaries ?? []);
      setToday(todayData);
    } catch (error) {
      setNotice({ tone: "error", message: errorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function handleSave(payload: EntryPayload) {
    setIsSaving(true);
    setNotice(null);

    try {
      await createEntry(payload);
      setNotice({ tone: "success", message: "Entry saved successfully." });
      await loadDashboard();
    } catch (error) {
      setNotice({ tone: "error", message: errorMessage(error) });
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow"><span /> Diabetes tracker</p>
          <h1>Small logs.<br />Clearer patterns.</h1>
          <p className="hero-copy">
            Record glucose, meals, and movement, then review your recent daily trends.
          </p>
        </div>
        <div className="today-pill">
          <span>Today</span>
          <strong>{new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date())}</strong>
        </div>
      </header>

      {notice && (
        <div className={`notice notice-${notice.tone}`} role={notice.tone === "error" ? "alert" : "status"}>
          <span>{notice.tone === "success" ? "✓" : "!"}</span>
          <p>{notice.message}</p>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss message">×</button>
        </div>
      )}

      <div className="layout">
        <aside className="card entry-card">
          <div className="card-heading">
            <p className="section-kicker">New reading</p>
            <h2>Log an entry</h2>
            <p>Add the context that makes each number more useful.</p>
          </div>
          <EntryForm isSaving={isSaving} onSave={handleSave} />
          <a className="export-link" href={apiUrl("/api/export/csv")}>
            <span>↓</span> Export entries as CSV
          </a>
        </aside>

        <section className="card dashboard-card">
          <div className="dashboard-heading">
            <div>
              <p className="section-kicker">Dashboard</p>
              <h2>Your recent overview</h2>
            </div>
            <button
              className="icon-button"
              type="button"
              onClick={() => void loadDashboard()}
              disabled={isLoading}
              aria-label="Refresh dashboard"
            >
              <RefreshIcon />
              <span>Refresh</span>
            </button>
          </div>

          <SummaryCards summary={today} isLoading={isLoading} />
          <TrendChart days={dailySummaries} isLoading={isLoading} />
          <EntriesList entries={entries} isLoading={isLoading} />
        </section>
      </div>

      <footer>
        <p>Readings are shown in mmol/L. Follow the targets set with your healthcare team.</p>
      </footer>
    </main>
  );
}
