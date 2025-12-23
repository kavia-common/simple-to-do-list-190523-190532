import React, { useEffect, useId, useMemo, useState } from "react";

/**
 * TaskForm supports both create and edit flows.
 */

// PUBLIC_INTERFACE
export default function TaskForm({ mode, initialTask, onSubmit, onCancel }) {
  const formId = useId();
  const isEdit = mode === "edit";

  const initial = useMemo(
    () => ({
      title: initialTask?.title || "",
      description: initialTask?.description || "",
      status: initialTask?.status || "pending",
    }),
    [initialTask]
  );

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [status, setStatus] = useState(initial.status);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle(initial.title);
    setDescription(initial.description);
    setStatus(initial.status);
    setError("");
  }, [initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: trimmedTitle,
        description: description.trim(),
        status,
      });

      if (!isEdit) {
        setTitle("");
        setDescription("");
        setStatus("pending");
      }
    } catch (err) {
      // The parent typically shows a toast; keep a local message for accessibility.
      setError(err?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit} aria-describedby={`${formId}-help`}>
      <div className="form-grid">
        <div className="field">
          <label className="label" htmlFor={`${formId}-title`}>
            Title <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-title`}
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Buy groceries"
            required
            aria-required="true"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor={`${formId}-description`}>
            Description
          </label>
          <input
            id={`${formId}-description`}
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional details…"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor={`${formId}-status`}>
            Status
          </label>
          <select
            id={`${formId}-status`}
            className="select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Task status"
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div id={`${formId}-help`} className="help">
        {isEdit ? "Update the task details and save." : "Create a new task and it will appear below."}
      </div>

      {error ? (
        <div className="help" role="alert" aria-live="polite" style={{ color: "var(--danger)" }}>
          {error}
        </div>
      ) : null}

      <div className="actions">
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Add task"}
        </button>

        {isEdit ? (
          <button
            className="btn btn-secondary"
            type="button"
            onClick={onCancel}
            disabled={submitting}
            aria-label="Cancel editing"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
