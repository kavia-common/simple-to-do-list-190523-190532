import React from "react";

// PUBLIC_INTERFACE
export default function TaskItem({ task, onEdit, onDelete, onToggleStatus }) {
  const isCompleted = task.status === "completed";

  return (
    <article className="task" aria-label={`Task: ${task.title}`}>
      <div className="task-main">
        <div className="task-title-row">
          <h3 className={`task-title ${isCompleted ? "completed" : ""}`}>{task.title}</h3>
          <span className={`pill ${isCompleted ? "completed" : ""}`}>
            {isCompleted ? "Completed" : "Pending"}
            {task._optimistic ? " • syncing" : ""}
          </span>
        </div>

        {task.description ? <p className="task-desc">{task.description}</p> : null}

        <label className="toggle">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={onToggleStatus}
            aria-label={isCompleted ? "Mark as pending" : "Mark as completed"}
          />
          Toggle status
        </label>
      </div>

      <div className="task-actions" aria-label="Task actions">
        <button className="btn btn-secondary btn-small" onClick={onEdit} aria-label="Edit task">
          Edit
        </button>
        <button className="btn btn-danger btn-small" onClick={onDelete} aria-label="Delete task">
          Delete
        </button>
      </div>
    </article>
  );
}
