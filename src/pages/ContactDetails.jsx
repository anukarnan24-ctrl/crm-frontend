import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import Input from "../components/Input";
import Button from "../components/Button";
import { api } from "../api/client";

const TABS = ["notes", "tasks", "timeline"];

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-sm rounded-lg border ${
        active ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

function Card({ children }) {
  return <div className="rounded-2xl border bg-white p-4">{children}</div>;
}

export default function ContactDetails() {
  const { id } = useParams();

  const [tab, setTab] = useState("notes");

  const [contact, setContact] = useState(null);
  const [loadingContact, setLoadingContact] = useState(false);

  const [error, setError] = useState("");

  // edit contact
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cName, setCName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cCompany, setCCompany] = useState("");

  // notes
  const [notes, setNotes] = useState([]);
  const [noteBody, setNoteBody] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // tasks
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState(""); // datetime-local
  const [addingTask, setAddingTask] = useState(false);

  // timeline
  const [timeline, setTimeline] = useState([]);
  const [loadingTab, setLoadingTab] = useState(false);

  async function loadContact() {
    setError("");
    setLoadingContact(true);
    try {
      const res = await api.getContact(id);
      setContact(res.contact);

      // prepare edit fields
      setCName(res.contact?.name || "");
      setCEmail(res.contact?.email || "");
      setCPhone(res.contact?.phone || "");
      setCCompany(res.contact?.company || "");
    } catch (e) {
      setError(e.message || "Failed to load contact");
    } finally {
      setLoadingContact(false);
    }
  }

  async function loadNotes() {
    setLoadingTab(true);
    setError("");
    try {
      const res = await api.listNotes(id);
      setNotes(res.notes || []);
    } catch (e) {
      setError(e.message || "Failed to load notes");
    } finally {
      setLoadingTab(false);
    }
  }

  async function loadTasks() {
    setLoadingTab(true);
    setError("");
    try {
      const res = await api.listTasks(id);
      setTasks(res.tasks || []);
    } catch (e) {
      setError(e.message || "Failed to load tasks");
    } finally {
      setLoadingTab(false);
    }
  }

  async function loadTimeline() {
    setLoadingTab(true);
    setError("");
    try {
      const res = await api.timeline(id);
      setTimeline(res.items || []);
    } catch (e) {
      setError(e.message || "Failed to load timeline");
    } finally {
      setLoadingTab(false);
    }
  }

  async function refreshTab() {
    if (tab === "notes") return loadNotes();
    if (tab === "tasks") return loadTasks();
    if (tab === "timeline") return loadTimeline();
  }

  useEffect(() => {
    loadContact();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    refreshTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, id]);

  const contactSubtitle = useMemo(() => {
    if (!contact) return "";
    const parts = [contact.email, contact.phone, contact.company].filter(Boolean);
    return parts.join(" • ");
  }, [contact]);

  async function onSaveContact() {
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: cName,
        email: cEmail || null,
        phone: cPhone || null,
        company: cCompany || null,
      };
      const res = await api.updateContact(id, payload);
      setContact(res.contact);
      setEditing(false);
    } catch (e) {
      setError(e.message || "Failed to save contact");
    } finally {
      setSaving(false);
    }
  }

  async function onAddNote(e) {
    e.preventDefault();
    if (!noteBody.trim()) return;

    setAddingNote(true);
    setError("");
    try {
      await api.addNote(id, { body: noteBody.trim() });
      setNoteBody("");
      await loadNotes();
      // keep timeline fresh if user switches
    } catch (e2) {
      setError(e2.message || "Failed to add note");
    } finally {
      setAddingNote(false);
    }
  }

  async function onDeleteNote(noteId) {
    setError("");
    try {
      await api.deleteNote(noteId);
      await loadNotes();
    } catch (e) {
      setError(e.message || "Failed to delete note");
    }
  }

  async function onAddTask(e) {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setAddingTask(true);
    setError("");
    try {
      const dueDateIso = taskDueDate ? new Date(taskDueDate).toISOString() : undefined;
      await api.addTask(id, { title: taskTitle.trim(), dueDate: dueDateIso });
      setTaskTitle("");
      setTaskDueDate("");
      await loadTasks();
    } catch (e2) {
      setError(e2.message || "Failed to add task");
    } finally {
      setAddingTask(false);
    }
  }

  async function toggleTaskComplete(task) {
    setError("");
    try {
      await api.updateTask(task.id, { completed: !task.completedAt });
      await loadTasks();
    } catch (e) {
      setError(e.message || "Failed to update task");
    }
  }

  return (
    <AppShell>
      {loadingContact ? (
        <div className="text-sm text-gray-600">Loading contact...</div>
      ) : !contact ? (
        <div className="text-sm text-gray-600">Contact not found.</div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold truncate">{contact.name}</h1>
              {contactSubtitle ? (
                <p className="mt-1 text-sm text-gray-600">{contactSubtitle}</p>
              ) : (
                <p className="mt-1 text-sm text-gray-400">No extra details</p>
              )}
            </div>

            <div className="flex gap-2">
              {!editing ? (
                <button
                  className="rounded-lg border bg-white px-4 py-2 hover:bg-gray-50"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </button>
              ) : (
                <>
                  <button
                    className="rounded-lg border bg-white px-4 py-2 hover:bg-gray-50"
                    onClick={() => {
                      setEditing(false);
                      setCName(contact.name || "");
                      setCEmail(contact.email || "");
                      setCPhone(contact.phone || "");
                      setCCompany(contact.company || "");
                    }}
                  >
                    Cancel
                  </button>
                  <Button disabled={saving} onClick={onSaveContact}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Edit form */}
          {editing && (
            <div className="mt-4">
              <Card>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="Name" value={cName} onChange={(e) => setCName(e.target.value)} />
                  <Input label="Email" value={cEmail} onChange={(e) => setCEmail(e.target.value)} />
                  <Input label="Phone" value={cPhone} onChange={(e) => setCPhone(e.target.value)} />
                  <Input
                    label="Company"
                    value={cCompany}
                    onChange={(e) => setCCompany(e.target.value)}
                  />
                </div>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <div className="mt-6 flex gap-2 flex-wrap">
            <TabButton active={tab === "notes"} onClick={() => setTab("notes")}>
              Notes
            </TabButton>
            <TabButton active={tab === "tasks"} onClick={() => setTab("tasks")}>
              Tasks
            </TabButton>
            <TabButton active={tab === "timeline"} onClick={() => setTab("timeline")}>
              Timeline
            </TabButton>
          </div>

          {/* Tab content */}
          <div className="mt-4">
            {loadingTab ? (
              <div className="text-sm text-gray-600">Loading...</div>
            ) : tab === "notes" ? (
              <Card>
                <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={onAddNote}>
                  <div className="flex-1">
                    <label className="block">
                      <span className="text-sm text-gray-700">Add note</span>
                      <textarea
                        className="mt-1 w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
                        rows={3}
                        placeholder="Write a note..."
                        value={noteBody}
                        onChange={(e) => setNoteBody(e.target.value)}
                      />
                    </label>
                  </div>
                  <Button disabled={addingNote}>{addingNote ? "Adding..." : "Add"}</Button>
                </form>

                <div className="mt-5">
                  {notes.length === 0 ? (
                    <div className="text-sm text-gray-600">No notes yet.</div>
                  ) : (
                    <ul className="space-y-3">
                      {notes.map((n) => (
                        <li key={n.id} className="rounded-xl border p-3">
                          <div className="text-sm whitespace-pre-wrap">{n.body}</div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {new Date(n.createdAt).toLocaleString()}
                            </span>
                            <button
                              className="text-xs text-red-600 hover:underline"
                              onClick={() => onDeleteNote(n.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card>
            ) : tab === "tasks" ? (
              <Card>
                <form className="grid gap-3 sm:grid-cols-3" onSubmit={onAddTask}>
                  <div className="sm:col-span-2">
                    <Input
                      label="Task title"
                      placeholder="Follow up call..."
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      required
                    />
                  </div>

                  <label className="block">
                    <span className="text-sm text-gray-700">Due date</span>
                    <input
                      type="datetime-local"
                      className="mt-1 w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                    />
                  </label>

                  <div className="sm:col-span-3 flex justify-end">
                    <Button disabled={addingTask}>{addingTask ? "Adding..." : "Add task"}</Button>
                  </div>
                </form>

                <div className="mt-5">
                  {tasks.length === 0 ? (
                    <div className="text-sm text-gray-600">No tasks yet.</div>
                  ) : (
                    <ul className="space-y-2">
                      {tasks.map((t) => (
                        <li key={t.id} className="rounded-xl border p-3 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className={`text-sm ${t.completedAt ? "line-through text-gray-500" : ""}`}>
                              {t.title}
                            </div>
                            <div className="mt-1 text-xs text-gray-500 flex flex-wrap gap-3">
                              {t.dueDate && <span>Due: {new Date(t.dueDate).toLocaleString()}</span>}
                              <span>Created: {new Date(t.createdAt).toLocaleString()}</span>
                            </div>
                          </div>

                          <button
                            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                            onClick={() => toggleTaskComplete(t)}
                          >
                            {t.completedAt ? "Mark pending" : "Mark done"}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card>
            ) : (
              <Card>
                {timeline.length === 0 ? (
                  <div className="text-sm text-gray-600">No activity yet.</div>
                ) : (
                  <ul className="space-y-3">
                    {timeline.map((it) => (
                      <li key={`${it.type}-${it.id}`} className="rounded-xl border p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-xs rounded-full border px-2 py-1 bg-white">
                            {it.type.toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(it.createdAt).toLocaleString()}
                          </div>
                        </div>

                        <div className="mt-2 text-sm whitespace-pre-wrap">{it.content}</div>

                        {it.type === "task" && (
                          <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-3">
                            {it.dueDate && <span>Due: {new Date(it.dueDate).toLocaleString()}</span>}
                            {it.completedAt ? (
                              <span>Completed: {new Date(it.completedAt).toLocaleString()}</span>
                            ) : (
                              <span>Pending</span>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}