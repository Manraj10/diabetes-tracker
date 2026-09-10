import type { DailySummary } from "../types";

interface TrendChartProps {
  days: DailySummary[];
  isLoading: boolean;
}

function dayLabel(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
}

function shortDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

export function TrendChart({ days, isLoading }: TrendChartProps) {
  const chronologicalDays = [...days].reverse();
  const maxAverage = Math.max(10, ...chronologicalDays.map((day) => day.average_glucose));

  return (
    <section className="trend-section" aria-labelledby="trend-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Last seven days</p>
          <h3 id="trend-title">Average glucose trend</h3>
        </div>
        <span className="chart-unit">mmol/L</span>
      </div>

      {isLoading ? (
        <div className="chart-empty">Loading trend…</div>
      ) : chronologicalDays.length === 0 ? (
        <div className="chart-empty">Your daily averages will appear here.</div>
      ) : (
        <div className="chart" role="img" aria-label="Daily average glucose bar chart">
          {chronologicalDays.map((day) => {
            const height = Math.max(8, (day.average_glucose / maxAverage) * 100);
            return (
              <div className="bar-column" key={day.date}>
                <span className="bar-value">{day.average_glucose.toFixed(1)}</span>
                <div className="bar-track">
                  <div className="bar" style={{ height: `${height}%` }} />
                </div>
                <strong>{dayLabel(day.date)}</strong>
                <span>{shortDate(day.date)}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
