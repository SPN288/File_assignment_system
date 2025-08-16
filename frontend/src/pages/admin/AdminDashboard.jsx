import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const [incharges, setIncharges] = useState([]);
  const [logs, setLogs] = useState([]);
  const { logout } = useAuth();

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/admin/incharges");
      setIncharges(data);
      const lg = await api.get("/admin/logs?limit=20");
      setLogs(lg.data);
    })();
  }, []);

  return (
    <div className="container">
      <header className="row">
        <h2>Admin Dashboard</h2>
        <button onClick={logout}>Logout</button>
      </header>

      <div className="grid-2">
        <div className="card">
          <h3>Incharges</h3>
          <ul className="list">
            {incharges.map((u) => (
              <li key={u._id} className="row">
                <span>{u.username}</span>
                <span>{u.fileCount} files</span>
                <Link to={`/admin/incharges/${u._id}`}>Manage →</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3>Recent Activity</h3>
          <ul className="list">
            {logs.map((l, i) => (
              <li key={i}>
                <div>
                  <b>{l.action}</b> on <i>{l.title}</i>
                </div>
                <div>
                  by {l.by.username} • {new Date(l.timestamp).toLocaleString()}
                </div>
                {l.note && <div className="muted">{l.note}</div>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
