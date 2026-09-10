import type { TodaySummary } from "../types";

interface SummaryCardsProps {
  summary: TodaySummary | null;
  isLoading: boolean;
}

function glucoseValue(value: number | null | undefined) {
  return value == null ? "—" : value.toFixed(1);
}

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  const items = [
    { label: "Entries today", value: summary?.total_entries ?? 0, unit: "logs" },
    { label: "Average", value: glucoseValue(summary?.average_glucose), unit: "mmol/L" },
    { label: "Minimum", value: glucoseValue(summary?.min_glucose), unit: "mmol/L" },
    { label: "Maximum", value: glucoseValue(summary?.max_glucose), unit: "mmol/L" },
  ];

  return (
    <div className="summary-grid" aria-busy={isLoading}>
      {items.map((item) => (
        <article className="summary-box" key={item.label}>
          <p>{item.label}</p>
          <div>
            <strong>{isLoading ? "—" : item.value}</strong>
            <span>{item.unit}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
