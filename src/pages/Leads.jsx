import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import AppShell from "../components/AppShell";
import Input from "../components/Input";
import Button from "../components/Button";

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"];

function Badge({ children }) {
  return (
    <span className="text-xs rounded-full border px-2 py-1 bg-white">
      {children}
    </span>
  );
}

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

export default function Leads() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

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
    if (status) p.status = status;
    p.page = 1;
    p.limit = 50;
    return p;
  }, [q, status]);

  async function load() {
    setError("");
    setLoading(true);
    try {
      const res = await api.listLeads(queryParams);
      setItems(res.items || []);
      setTotal(res.total || 0);
    } catch (e) {
      setError(e.message || "Failed to load leads");
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
      await api.createLead({
        name,
        email: email || undefined,
        company: company || undefined,
        phone: phone || undefined,
        status: "NEW",
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

  async function onChangeStatus(leadId, nextStatus) {
    setError("");
    try {
      await api.updateLead(leadId, { status: nextStatus });
      await load();
    } catch (e) {
      setError(e.message || "Update failed");
    }
  }

  async function onConvert(leadId) {
    setError("");
    try {
      await api.convertLead(leadId);
      await load();
    } catch (e) {
      setError(e.message || "Convert failed");
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="text-sm text-gray-600">Manage your incoming leads.</p>
        </div>

        <Button onClick={() => setCreateOpen(true)}>+ New Lead</Button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Input
          label="Search"
          placeholder="Search name, email, phone, company..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <label className="block">
          <span className="text-sm text-gray-700">Status</span>
          <select
            className="mt-1 w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button
            className="w-full rounded-lg border bg-white px-4 py-2 hover:bg-gray-50"
            onClick={() => {
              setQ("");
              setStatus("");
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* List */}
      <div className="mt-6 rounded-2xl border bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="text-sm text-gray-600">
            {loading ? "Loading..." : `${total} lead(s)`}
          </div>
        </div>

        {items.length === 0 && !loading ? (
          <div className="p-6 text-sm text-gray-600">No leads found.</div>
        ) : (
          <ul className="divide-y">
            {items.map((lead) => (
              <li key={lead.id} className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-medium truncate">{lead.name}</div>
                    <Badge>{lead.status}</Badge>
                    {lead.convertedAt && <Badge>Converted</Badge>}
                  </div>

                  <div className="mt-1 text-sm text-gray-600 flex flex-wrap gap-x-3 gap-y-1">
                    {lead.email && <span>{lead.email}</span>}
                    {lead.phone && <span>{lead.phone}</span>}
                    {lead.company && <span>{lead.company}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  {/* status */}
                  <select
                    className="rounded-lg border bg-white px-3 py-2 text-sm"
                    value={lead.status}
                    onChange={(e) => onChangeStatus(lead.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  {/* convert */}
                  <button
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                    disabled={Boolean(lead.convertedAt)}
                    onClick={() => onConvert(lead.id)}
                    title={lead.convertedAt ? "Already converted" : "Convert to contact"}
                  >
                    Convert
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create modal */}
      <Modal
        open={createOpen}
        title="Create lead"
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