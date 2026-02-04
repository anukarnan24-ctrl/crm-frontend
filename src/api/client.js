const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};

  // Only set JSON header when body exists (avoids issues with some servers)
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // If backend returns empty body sometimes
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

export const api = {
  // ---------- Auth ----------
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload, auth: false }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload, auth: false }),
  me: () => request("/auth/me"),

  // ---------- Leads ----------
  createLead: (payload) => request("/leads", { method: "POST", body: payload }),
  listLeads: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/leads${qs ? `?${qs}` : ""}`);
  },
  updateLead: (id, payload) => request(`/leads/${id}`, { method: "PATCH", body: payload }),
  convertLead: (id) => request(`/leads/${id}/convert`, { method: "POST" }),

  // ---------- Contacts ----------
  createContact: (payload) => request("/contacts", { method: "POST", body: payload }),
  listContacts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/contacts${qs ? `?${qs}` : ""}`);
  },
  getContact: (id) => request(`/contacts/${id}`),
  updateContact: (id, payload) => request(`/contacts/${id}`, { method: "PATCH", body: payload }),

  // ---------- Notes ----------
  addNote: (contactId, payload) =>
    request(`/contacts/${contactId}/notes`, { method: "POST", body: payload }),
  listNotes: (contactId) => request(`/contacts/${contactId}/notes`),
  updateNote: (noteId, payload) => request(`/notes/${noteId}`, { method: "PATCH", body: payload }),
  deleteNote: (noteId) => request(`/notes/${noteId}`, { method: "DELETE" }),

  // ---------- Tasks ----------
  addTask: (contactId, payload) =>
    request(`/contacts/${contactId}/tasks`, { method: "POST", body: payload }),
  listTasks: (contactId) => request(`/contacts/${contactId}/tasks`),
  updateTask: (taskId, payload) => request(`/tasks/${taskId}`, { method: "PATCH", body: payload }),
  pendingTasks: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/tasks/pending${qs ? `?${qs}` : ""}`);
  },

  // ---------- Timeline ----------
  timeline: (contactId) => request(`/contacts/${contactId}/timeline`),
};