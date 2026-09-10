export interface Entry {
  id?: number;
  glucose: number;
  meal: string | null;
  exercise_minutes: number;
  notes: string | null;
  created_at: string;
}

export interface EntryPayload {
  glucose: number;
  meal: string | null;
  exercise_minutes: number;
  notes: string | null;
}

export interface TodaySummary {
  total_entries: number;
  average_glucose: number | null;
  min_glucose: number | null;
  max_glucose: number | null;
}

export interface DailySummary {
  date: string;
  average_glucose: number;
}

export interface RecentSummary {
  daily_summaries: DailySummary[];
}
