import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import Pagination from "../../components/Pagination";


export default function AdminDashboard() {
  const { logout } = useAuth();

  // Incharges state
  const [qUsers, setQUsers] = useState("");
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPages, setUsersPages] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const usersLimit = 10;

  // Logs state
  const [qLogs, setQLogs] = useState("");
  const [logs, setLogs] = useState([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsPages, setLogsPages] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);
  const logsLimit = 5;

  async function fetchUsers({ page = usersPage, q = qUsers } = {}) {
    const { data } = await api.get("/admin/incharges", { params: { page, limit: usersLimit, q } });
    setUsers(data.data);
    setUsersPage(data.page);
    setUsersPages(data.pages);
    setUsersTotal(data.total);
  }

  async function fetchLogs({ page = logsPage, q = qLogs } = {}) {
    const { data } = await api.get("/admin/logs", { params: { page, limit: logsLimit, q } });
    setLogs(data.data);
    setLogsPage(data.page);
    setLogsPages(data.pages);
    setLogsTotal(data.total);
  }

  useEffect(() => {
    fetchUsers({ page: 1 });
    fetchLogs({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSearchUsers(e) {
    e.preventDefault();
    fetchUsers({ page: 1, q: qUsers });
  }
  function onSearchLogs(e) {
    e.preventDefault();
    fetchLogs({ page: 1, q: qLogs });
  }

  const incharges = (<>
    {/* Incharges */}
    <div className="card">
      <div className="row">
        <h3>Incharges</h3>
        <small className="muted">{usersTotal} total</small>
      </div>
      <form onSubmit={onSearchUsers} className="row">
        <input
          placeholder="Search username…"
          value={qUsers}
          onChange={(e) => setQUsers(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <ul className="list" style={{ marginTop: 8 }}>
        {users.map((u) => (
          <li key={u._id} className="row">
            <span>{u.username}</span>
            <span>{u.fileCount} files</span>
            <Link to={`/admin/incharges/${u._id}`}>Manage →</Link>
          </li>
        ))}
      </ul>

      <Pagination
        page={usersPage}
        pages={usersPages}
        onPage={(p) => fetchUsers({ page: p })}
      />
    </div>
  </>);

  const his = (<>
    {/* Logs */}
    <div className="card">
      <div className="row">
        <h3>Recent Activity</h3>
        <small className="muted">{logsTotal} total</small>
      </div>

      <form onSubmit={onSearchLogs} className="row">
        <input
          placeholder="Search title/note/user…"
          value={qLogs}
          onChange={(e) => setQLogs(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <ul className="list" style={{ marginTop: 8 }}>
        {logs.map((l, i) => (
          <li key={`${l.fileId}-${i}`}>
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

      <Pagination
        page={logsPage}
        pages={logsPages}
        onPage={(p) => fetchLogs({ page: p })}
      />
    </div>
  </>);

  const [page, setPage] = useState('home');

  let c;
  if (page === 'home') {
    c = incharges;
  } else if (page === 'history') {
    c = his;
  }

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      <header className="row">

        <button onClick={() => setPage('home')}>Home</button>
        <button onClick={() => setPage('history')}>History</button>
        <button onClick={logout}>Logout</button>
      </header>

      <div className="grid-2">
        {c}
      </div>
    </div>
  );
}
