import type { Entry } from "../types";

interface EntriesListProps {
  entries: Entry[];
  isLoading: boolean;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.replace("T", " ");
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function EntriesList({ entries, isLoading }: EntriesListProps) {
  return (
    <section className="entries-section" aria-labelledby="entries-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">History</p>
          <h3 id="entries-title">Recent entries</h3>
        </div>
        <span className="entry-count">{entries.length} total</span>
      </div>

      {isLoading ? (
        <div className="table-empty">Loading entries…</div>
      ) : entries.length === 0 ? (
        <div className="table-empty">No readings yet. Add your first entry.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Glucose</th>
                <th>Meal</th>
                <th>Exercise</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={entry.id ?? `${entry.created_at}-${index}`}>
                  <td data-label="Time">{formatDateTime(entry.created_at)}</td>
                  <td data-label="Glucose">
                    <strong className="glucose-reading">{entry.glucose.toFixed(1)}</strong>
                    <span className="cell-unit"> mmol/L</span>
                  </td>
                  <td data-label="Meal">
                    <span>{entry.meal || "—"}</span>
                    {entry.notes && <small className="entry-note">{entry.notes}</small>}
                  </td>
                  <td data-label="Exercise">{entry.exercise_minutes} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
