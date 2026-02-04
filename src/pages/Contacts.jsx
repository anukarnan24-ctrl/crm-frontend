import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import AppShell from "../components/AppShell";
import Input from "../components/Input";
import Button from "../components/Button";

function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="text-sm px-2 py-1 rounded hover:bg-gray-100" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export default function Contacts() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // create form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");

  const queryParams = useMemo(() => {
    const p = {};
    if (q.trim()) p.q = q.trim();
    p.page = 1;
    p.limit = 50;
    return p;
  }, [q]);

  async function load() {
    setError("");
    setLoading(true);
    try {
      const res = await api.listContacts(queryParams);
      setItems(res.items || []);
      setTotal(res.total || 0);
    } catch (e) {
      setError(e.message || "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  function resetCreateForm() {
    setName("");
    setEmail("");
    setCompany("");
    setPhone("");
  }

  async function onCreate(e) {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      await api.createContact({
        name,
        email: email || undefined,
        company: company || undefined,
        phone: phone || undefined,
      });

      setCreateOpen(false);
      resetCreateForm();
      await load();
    } catch (e2) {
      setError(e2.message || "Create failed");
    } finally {
      setCreating(false);
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Contacts</h1>
          <p className="text-sm text-gray-600">Your converted and manual contacts.</p>
        </div>

        <Button onClick={() => setCreateOpen(true)}>+ New Contact</Button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Input
          label="Search"
          placeholder="Search name, email, phone, company..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="flex items-end sm:col-span-2">
          <button
            className="rounded-lg border bg-white px-4 py-2 hover:bg-gray-50"
            onClick={() => setQ("")}
          >
            Reset
          </button>
        </div>
      </div>

      {/* List */}
      <div className="mt-6 rounded-2xl border bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="text-sm text-gray-600">
            {loading ? "Loading..." : `${total} contact(s)`}
          </div>
        </div>

        {items.length === 0 && !loading ? (
          <div className="p-6 text-sm text-gray-600">No contacts found.</div>
        ) : (
          <ul className="divide-y">
            {items.map((c) => (
              <li key={c.id} className="p-4">
                <Link
                  to={`/contacts/${c.id}`}
                  className="block rounded-xl hover:bg-gray-50 p-2 -m-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{c.name}</div>
                      <div className="mt-1 text-sm text-gray-600 flex flex-wrap gap-x-3 gap-y-1">
                        {c.email && <span>{c.email}</span>}
                        {c.phone && <span>{c.phone}</span>}
                        {c.company && <span>{c.company}</span>}
                      </div>
                    </div>

                    <span className="text-sm text-gray-500">View →</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create modal */}
      <Modal
        open={createOpen}
        title="Create contact"
        onClose={() => {
          setCreateOpen(false);
          resetCreateForm();
        }}
      >
        <form className="space-y-4" onSubmit={onCreate}>
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Company" value={company} onChange={(e) => setCompany(e.target.value)} />

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              className="rounded-lg border bg-white px-4 py-2 hover:bg-gray-50"
              onClick={() => {
                setCreateOpen(false);
                resetCreateForm();
              }}
            >
              Cancel
            </button>
            <Button disabled={creating}>{creating ? "Creating..." : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}