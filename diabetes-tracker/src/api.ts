import type {
  Entry,
  EntryPayload,
  RecentSummary,
  TodaySummary,
} from "./types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

function validationMessage(data: unknown): string | null {
  if (!data || typeof data !== "object" || !("detail" in data)) return null;

  const detail = (data as { detail: unknown }).detail;
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    const messages = detail.flatMap((item) => {
      if (!item || typeof item !== "object") return [];

      const issue = item as { loc?: unknown; msg?: unknown };
      const location = Array.isArray(issue.loc)
        ? issue.loc.filter((part) => part !== "body").join(" → ")
        : "request";
      const message = typeof issue.msg === "string" ? issue.msg : "Invalid value";
      return [`${location || "request"}: ${message}`];
    });

    return messages.length > 0 ? messages.join(". ") : null;
  }

  return null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), init);
  const contentType = response.headers.get("content-type") ?? "";
  const data: unknown = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      validationMessage(data) ||
      (typeof data === "string" && data.trim()) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export function getEntries() {
  return request<Entry[]>("/api/entries");
}

export function getRecentSummary(days = 7) {
  return request<RecentSummary>(`/api/summary/recent?days=${days}`);
}

export async function getTodaySummary(): Promise<TodaySummary | null> {
  try {
    return await request<TodaySummary>("/api/summary/today");
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function createEntry(payload: EntryPayload) {
  return request<Entry>("/api/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
