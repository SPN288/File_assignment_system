import React from 'react'
import { Link } from "react-router-dom";
import Pagination from './Pagination';

export default function history() {
    // Logs state
  const [qLogs, setQLogs] = useState("");
  const [logs, setLogs] = useState([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsPages, setLogsPages] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);
  const logsLimit = 10;


  async function fetchLogs({ page = logsPage, q = qLogs } = {}) {
      const { data } = await api.get("/admin/logs", { params: { page, limit: logsLimit, q } });
      setLogs(data.data);
      setLogsPage(data.page);
      setLogsPages(data.pages);
      setLogsTotal(data.total);
    }

      useEffect(() => {
        fetchLogs({ page: 1 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
    
      function onSearchLogs(e) {
    e.preventDefault();
    fetchLogs({ page: 1, q: qLogs });
  }


  return (
    <div>
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
    </div>
  )
}
