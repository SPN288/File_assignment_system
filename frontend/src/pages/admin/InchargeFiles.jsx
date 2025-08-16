import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function InchargeFiles() {
  const { id } = useParams();
  const nav = useNavigate();
  const { logout } = useAuth();

  const [files, setFiles] = useState([]);
  const [incharges, setIncharges] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", assignedTo: id });

  async function refresh() {
    const { data } = await api.get(`/admin/incharges/${id}/files`);
    setFiles(data);
  }

  useEffect(() => {
    (async () => {
      const all = await api.get("/admin/incharges");
      setIncharges(all.data);
      await refresh();
    })();
  }, [id]);

  const current = useMemo(() => incharges.find((x) => x._id === id)?.username || "", [incharges, id]);

  async function createFile(e) {
    e.preventDefault();
    await api.post("/admin/files", form);
    setForm((f) => ({ ...f, title: "", description: "" }));
    await refresh();
  }

  async function updateFile(fileId, patch) {
    await api.put(`/admin/files/${fileId}`, patch);
    await refresh();
  }

  async function deleteFile(fileId) {
    if (confirm("Delete this file?")) {
      await api.delete(`/admin/files/${fileId}`);
      await refresh();
    }
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
          <label>Reassign to</label>
          <select
            value={form.assignedTo}
            onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
          >
            {incharges.map((u) => (
              <option key={u._id} value={u._id}>{u.username}</option>
            ))}
          </select>
          <button type="submit">Assign</button>
        </form>

        <div className="card">
          <h3>Assigned Files</h3>
          <ul className="list">
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
                  <EditInline file={f} incharges={incharges} onSave={(p) => updateFile(f._id, p)} />
                </details>
              </li>
            ))}
          </ul>
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
