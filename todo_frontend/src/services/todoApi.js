/**
 * A tiny REST client for the todo backend. The frontend must still work when no
 * backend is configured; in that case the app never calls these methods.
 *
 * We avoid hard-coding paths beyond a conventional REST shape:
 *   GET    /tasks
 *   POST   /tasks
 *   PUT    /tasks/:id
 *   DELETE /tasks/:id
 *
 * If your backend differs, adjust endpoints here (only within this container).
 */

// PUBLIC_INTERFACE
export function createTodoApiClient(apiBase) {
  /** Normalize base URL (no trailing slash). */
  const base = (apiBase || "").replace(/\/+$/, "");

  const buildUrl = (path) => `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const request = async (path, options = {}) => {
    const res = await fetch(buildUrl(path), {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    if (!res.ok) {
      // Try to parse error body; if not JSON, fall back to status text.
      let message = res.statusText || "Request failed";
      try {
        const data = await res.json();
        message = data?.message || data?.detail || message;
      } catch {
        // ignore
      }
      throw new Error(`${message} (HTTP ${res.status})`);
    }

    // Some endpoints may return 204 No Content
    if (res.status === 204) return null;

    // If response isn't JSON, this will throw; that's okay because our backend
    // is expected to be JSON.
    return res.json();
  };

  const normalizeTask = (t) => ({
    id: String(t.id),
    title: t.title ?? "",
    description: t.description ?? "",
    status: t.status === "completed" ? "completed" : "pending",
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  });

  return {
    // PUBLIC_INTERFACE
    async listTasks() {
      const data = await request("/tasks", { method: "GET" });
      if (!Array.isArray(data)) return [];
      return data.map(normalizeTask);
    },

    // PUBLIC_INTERFACE
    async createTask(payload) {
      const data = await request("/tasks", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return normalizeTask(data);
    },

    // PUBLIC_INTERFACE
    async updateTask(id, payload) {
      const data = await request(`/tasks/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return normalizeTask(data);
    },

    // PUBLIC_INTERFACE
    async deleteTask(id) {
      await request(`/tasks/${encodeURIComponent(id)}`, { method: "DELETE" });
      return true;
    },
  };
}
