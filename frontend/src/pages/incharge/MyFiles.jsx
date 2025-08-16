import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function MyFiles() {
  const [files, setFiles] = useState([]);

  async function refresh() {
    const { data } = await api.get("/incharge/files");
    setFiles(data);
  }

  useEffect(() => { refresh(); }, []);

  async function markComplete(id) {
    await api.put(`/incharge/files/${id}/complete`);
    await refresh();
  }

  return (
    <div className="container">
      <h2>My Files</h2>
      <div className="card">
        <ul className="list">
          {files.map((f) => (
            <li key={f._id}>
              <div className="row">
                <b>{f.title}</b>
                <span className={`badge ${f.status}`}>{f.status}</span>
              </div>
              <div className="muted">{f.description}</div>
              <div className="row">
                <small>Assigned: {new Date(f.createdAt).toLocaleString()}</small>
                {f.status !== "completed" && (
                  <button onClick={() => markComplete(f._id)}>Mark Completed</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
