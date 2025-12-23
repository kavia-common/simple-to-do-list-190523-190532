import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import Toasts from "./components/Toasts";
import { createTodoApiClient } from "./services/todoApi";

/**
 * Task shape used by the UI:
 * {
 *   id: string,
 *   title: string,
 *   description: string,
 *   status: "pending" | "completed",
 *   createdAt?: string,
 *   updatedAt?: string
 * }
 */

// PUBLIC_INTERFACE
function App() {
  /** API base can come from either env var; if absent we operate purely in-memory. */
  const apiBase =
    process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || "";

  const api = useMemo(() => createTodoApiClient(apiBase), [apiBase]);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(Boolean(apiBase));
  const [editingTask, setEditingTask] = useState(null);

  const [toasts, setToasts] = useState([]);
  const addToast = (toast) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, ...toast }]);
  };
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Load tasks from backend when configured; otherwise seed with a friendly example.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!apiBase) {
        setLoading(false);
        setTasks([
          {
            id: "local-1",
            title: "Welcome",
            description:
              "Add a task above. If you configure REACT_APP_API_BASE or REACT_APP_BACKEND_URL, tasks will sync to your backend.",
            status: "pending",
          },
        ]);
        return;
      }

      setLoading(true);
      try {
        const remoteTasks = await api.listTasks();
        if (!cancelled) setTasks(remoteTasks);
      } catch (err) {
        if (!cancelled) {
          addToast({
            type: "error",
            title: "Couldn't load tasks",
            message: err?.message || "Please check your API configuration.",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [api, apiBase]);

  const startEdit = (task) => setEditingTask(task);
  const cancelEdit = () => setEditingTask(null);

  // Optimistic create
  const handleCreate = async (draft) => {
    const optimisticId = `tmp-${Date.now()}`;
    const optimisticTask = {
      id: optimisticId,
      title: draft.title,
      description: draft.description,
      status: draft.status,
      _optimistic: true,
    };

    setTasks((prev) => [optimisticTask, ...prev]);

    try {
      if (!apiBase) return; // in-memory mode: keep optimistic task as "real"
      const created = await api.createTask({
        title: draft.title,
        description: draft.description,
        status: draft.status,
      });

      // Replace optimistic task with real task from backend
      setTasks((prev) => prev.map((t) => (t.id === optimisticId ? created : t)));
    } catch (err) {
      // rollback
      setTasks((prev) => prev.filter((t) => t.id !== optimisticId));
      addToast({
        type: "error",
        title: "Couldn't add task",
        message: err?.message || "Please try again.",
      });
    }
  };

  // Optimistic update (edit or status toggle)
  const handleUpdate = async (taskId, updates) => {
    let previousTask = null;

    // optimistic patch
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        previousTask = t;
        return { ...t, ...updates, _optimistic: Boolean(apiBase) };
      })
    );

    try {
      if (!apiBase) return;
      const saved = await api.updateTask(taskId, updates);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? saved : t)));
    } catch (err) {
      // rollback
      if (previousTask) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? previousTask : t)));
      }
      addToast({
        type: "error",
        title: "Couldn't update task",
        message: err?.message || "Please try again.",
      });
      throw err;
    }
  };

  // Optimistic delete
  const handleDelete = async (taskId) => {
    let deletedTask = null;

    setTasks((prev) => {
      const next = [];
      for (const t of prev) {
        if (t.id === taskId) {
          deletedTask = t;
          continue;
        }
        next.push(t);
      }
      return next;
    });

    try {
      if (!apiBase) return;
      await api.deleteTask(taskId);
    } catch (err) {
      // rollback
      if (deletedTask) setTasks((prev) => [deletedTask, ...prev]);
      addToast({
        type: "error",
        title: "Couldn't delete task",
        message: err?.message || "Please try again.",
      });
    }
  };

  const handleSubmitEdit = async (draft) => {
    if (!editingTask) return;
    try {
      await handleUpdate(editingTask.id, {
        title: draft.title,
        description: draft.description,
        status: draft.status,
      });
      setEditingTask(null);
    } catch {
      // error already toasted
    }
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    return { total, completed };
  }, [tasks]);

  return (
    <div className="App">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true" />
            <div className="brand-text">
              <h1 className="app-title">To‑Do List</h1>
              <p className="app-subtitle">
                {apiBase ? (
                  <>
                    Connected to <code className="inline-code">{apiBase}</code>
                  </>
                ) : (
                  <>In‑memory mode (set REACT_APP_API_BASE to enable syncing)</>
                )}
              </p>
            </div>
          </div>

          <div className="stats" aria-label="Task statistics">
            <div className="stat">
              <span className="stat-label">Total</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Completed</span>
              <span className="stat-value">{stats.completed}</span>
            </div>
          </div>
        </div>
      </header>

      <main id="main" className="container">
        <section className="panel" aria-label="Task input section">
          <div className="panel-header">
            <h2 className="panel-title">{editingTask ? "Edit task" : "Add a task"}</h2>
            <p className="panel-hint">
              Title is required. Use status to mark completed tasks.
            </p>
          </div>

          <TaskForm
            mode={editingTask ? "edit" : "create"}
            initialTask={editingTask}
            onSubmit={editingTask ? handleSubmitEdit : handleCreate}
            onCancel={editingTask ? cancelEdit : undefined}
          />
        </section>

        <section className="panel" aria-label="Task list section">
          <div className="panel-header">
            <h2 className="panel-title">Your tasks</h2>
            {loading ? <span className="badge">Loading…</span> : null}
          </div>

          <TaskList
            tasks={tasks}
            onEdit={startEdit}
            onDelete={handleDelete}
            onToggleStatus={async (task) => {
              const nextStatus = task.status === "completed" ? "pending" : "completed";
              await handleUpdate(task.id, { status: nextStatus });
            }}
          />
        </section>
      </main>

      <Toasts toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
