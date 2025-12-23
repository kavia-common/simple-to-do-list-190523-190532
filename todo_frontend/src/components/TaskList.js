import React from "react";
import TaskItem from "./TaskItem";

// PUBLIC_INTERFACE
export default function TaskList({ tasks, onEdit, onDelete, onToggleStatus }) {
  if (!tasks || tasks.length === 0) {
    return <p className="empty">No tasks yet. Add one above to get started.</p>;
  }

  return (
    <ul className="task-list" aria-label="Task list">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskItem
            task={task}
            onEdit={() => onEdit(task)}
            onDelete={() => onDelete(task.id)}
            onToggleStatus={() => onToggleStatus(task)}
          />
        </li>
      ))}
    </ul>
  );
}
