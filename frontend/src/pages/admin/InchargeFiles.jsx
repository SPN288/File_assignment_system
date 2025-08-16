import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import Pagination from "../../components/Pagination";

export default function InchargeFiles() {
  const { id } = useParams();
  const nav = useNavigate();
  const { logout } = useAuth();

  const [files, setFiles] = useState([]);
  const [incharges, setIncharges] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", assignedTo: id });

  // search + pagination
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  async function refresh({ pageArg = page, qArg = q } = {}) {
    const { data } = await api.get(`/admin/incharges/${id}/files`, {
      params: { page: pageArg, limit, q: qArg }
    });
    setFiles(data.data);
    setPage(data.page);
    setPages(data.pages);
    setTotal(data.total);
  }

  useEffect(() => {
    (async () => {
      const all = await api.get("/admin/incharges", { params: { limit: 999 } });
      setIncharges(all.data.data || all.data); // supports old response shape if any
      await refresh({ pageArg: 1 });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const current = useMemo(() => {
    const found =
      (incharges.data || incharges).find?.((x) => x._id === id) ||
      incharges.find?.((x) => x._id === id);
    return found?.username || "";
  }, [incharges, id]);

  async function createFile(e) {
    e.preventDefault();
    await api.post("/admin/files", form);
    setForm((f) => ({ ...f, title: "", description: "" }));
    await refresh({ pageArg: 1 });
  }

  async function updateFile(fileId, patch) {
    await api.put(`/admin/files/${fileId}`, patch);
    await refresh();
  }

  async function deleteFile(fileId) {
    if (confirm("Delete this file?")) {
      await api.delete(`/admin/files/${fileId}`);
      await refresh({ pageArg: 1 });
    }
  }

  function onSearch(e) {
    e.preventDefault();
    refresh({ pageArg: 1, qArg: q });
  }

  return (
    <div className="container">
      <header className="row">
        <button onClick={() => nav(-1)}>← Back</button>
        <h2>Manage Files • {current}</h2>
        <button onClick={logout}>Logout</button>
      </header>

      <div className="grid-2">
        <form onSubmit={createFile} className="card">
          <h3>Assign New File</h3>
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <label>Assign/Reassign to</label>
          <select
            value={form.assignedTo}
            onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
          >
            {(incharges.data || incharges).map?.((u) => (
              <option key={u._id} value={u._id}>{u.username}</option>
            ))}
          </select>
          <button type="submit">Assign</button>
        </form>

        <div className="card">
          <div className="row">
            <h3>Assigned Files</h3>
            <small className="muted">{total} total</small>
          </div>
          <form onSubmit={onSearch} className="row">
            <input
              placeholder="Search title/description…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>

          <ul className="list" style={{ marginTop: 8 }}>
            {files.map((f) => (
              <li key={f._id}>
                <div className="row">
                  <b>{f.title}</b>
                  <span className={`badge ${f.status}`}>{f.status}</span>
                </div>
                <div className="muted">{f.description}</div>
                <div className="row">
                  <small>Assigned to: {f.assignedTo?.username}</small>
                  <small>Created: {new Date(f.createdAt).toLocaleString()}</small>
                </div>

                <div className="row mt8">
                  <button onClick={() => updateFile(f._id, { status: f.status === "in-progress" ? "completed" : "in-progress" })}>
                    Toggle Status
                  </button>
                  <button onClick={() => deleteFile(f._id)} className="danger">Delete</button>
                </div>

                <details className="mt8">
                  <summary>Edit</summary>
                  <EditInline file={f} incharges={(incharges.data || incharges)} onSave={(p) => updateFile(f._id, p)} />
                </details>
              </li>
            ))}
          </ul>

          <Pagination page={page} pages={pages} onPage={(p) => refresh({ pageArg: p })} />
        </div>
      </div>
    </div>
  );
}

function EditInline({ file, incharges, onSave }) {
  const [patch, setPatch] = useState({
    title: file.title,
    description: file.description,
    assignedTo: file.assignedTo?._id || file.assignedTo
  });

  return (
    <div className="card flat">
      <input value={patch.title} onChange={(e) => setPatch((p) => ({ ...p, title: e.target.value }))} />
      <textarea value={patch.description} onChange={(e) => setPatch((p) => ({ ...p, description: e.target.value }))} />
      <select value={patch.assignedTo} onChange={(e) => setPatch((p) => ({ ...p, assignedTo: e.target.value }))}>
        {incharges.map((u) => <option key={u._id} value={u._id}>{u.username}</option>)}
      </select>
      <button onClick={() => onSave(patch)}>Save</button>
    </div>
  );
}
