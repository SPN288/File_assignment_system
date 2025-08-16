import React from 'react'
import { Link } from "react-router-dom";
import Pagination from './Pagination';

export default function Ilist() {
    // Incharges state
      const [qUsers, setQUsers] = useState("");
      const [users, setUsers] = useState([]);
      const [usersPage, setUsersPage] = useState(1);
      const [usersPages, setUsersPages] = useState(1);
      const [usersTotal, setUsersTotal] = useState(0);
      const usersLimit = 8;

      async function fetchUsers({ page = usersPage, q = qUsers } = {}) {
    const { data } = await api.get("/admin/incharges", { params: { page, limit: usersLimit, q } });
    setUsers(data.data);
    setUsersPage(data.page);
    setUsersPages(data.pages);
    setUsersTotal(data.total);
  }

    useEffect(() => {
      fetchUsers({ page: 1 });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  
    function onSearchUsers(e) {
      e.preventDefault();
      fetchUsers({ page: 1, q: qUsers });
    }


  return (
    <div>
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
    </div>
  )
}
