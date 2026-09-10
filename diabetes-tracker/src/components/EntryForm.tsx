import { useState, type FormEvent } from "react";
import type { EntryPayload } from "../types";

interface EntryFormProps {
  isSaving: boolean;
  onSave: (payload: EntryPayload) => Promise<void>;
}

interface FormErrors {
  glucose?: string;
  exercise?: string;
}

const initialForm = {
  glucose: "",
  meal: "",
  exercise: "0",
  notes: "",
};

export function EntryForm({ isSaving, onSave }: EntryFormProps) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    if (field === "glucose" || field === "exercise") {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const glucose = Number(form.glucose);
    const exerciseMinutes = Number(form.exercise);
    const nextErrors: FormErrors = {};

    if (form.glucose.trim() === "" || !Number.isFinite(glucose)) {
      nextErrors.glucose = "Enter a glucose reading.";
    } else if (glucose < 1 || glucose > 35) {
      nextErrors.glucose = "Use a value between 1.0 and 35.0 mmol/L.";
    }

    if (!Number.isInteger(exerciseMinutes) || exerciseMinutes < 0 || exerciseMinutes > 600) {
      nextErrors.exercise = "Use a whole number from 0 to 600.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      await onSave({
        glucose,
        meal: form.meal.trim() || null,
        exercise_minutes: exerciseMinutes,
        notes: form.notes.trim() || null,
      });
      setForm(initialForm);
    } catch {
      // The parent displays the API error and the entered values stay in place.
    }
  }

  return (
    <form className="entry-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <div className="label-row">
          <label htmlFor="glucose">Glucose</label>
          <span className="unit">mmol/L</span>
        </div>
        <input
          id="glucose"
          name="glucose"
          type="number"
          inputMode="decimal"
          min="1"
          max="35"
          step="0.1"
          placeholder="e.g. 6.4"
          value={form.glucose}
          onChange={(event) => updateField("glucose", event.target.value)}
          aria-invalid={Boolean(errors.glucose)}
          aria-describedby={errors.glucose ? "glucose-error" : undefined}
          required
        />
        {errors.glucose && (
          <p className="field-error" id="glucose-error">
            {errors.glucose}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="meal">Meal</label>
        <input
          id="meal"
          name="meal"
          type="text"
          maxLength={80}
          placeholder="Breakfast, lunch, snack…"
          value={form.meal}
          onChange={(event) => updateField("meal", event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="exercise">Exercise minutes</label>
        <input
          id="exercise"
          name="exercise"
          type="number"
          inputMode="numeric"
          min="0"
          max="600"
          step="1"
          value={form.exercise}
          onChange={(event) => updateField("exercise", event.target.value)}
          aria-invalid={Boolean(errors.exercise)}
          aria-describedby={errors.exercise ? "exercise-error" : undefined}
        />
        {errors.exercise && (
          <p className="field-error" id="exercise-error">
            {errors.exercise}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          maxLength={500}
          placeholder="Anything useful to remember"
          value={form.notes}
          onChange={(event) => updateField("notes", event.target.value)}
        />
      </div>

      <button className="primary-button" type="submit" disabled={isSaving}>
        {isSaving ? "Saving…" : "Save entry"}
      </button>
    </form>
  );
}
