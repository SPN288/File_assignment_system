import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function InchargeDashboard() {
  const [count, setCount] = useState(0);
  const { auth, logout } = useAuth();

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/incharge/files");
      setCount(data.length);
    })();
  }, []);

  return (
    <div className="container">
      <header className="row">
        <h2>Incharge Dashboard</h2>
        <div className="row">
          <span className="muted">Hi, {auth.user.username}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="card">
        <p>You have <b>{count}</b> files assigned.</p>
        <Link to="/incharge/files" className="btn">View My Files</Link>
      </div>
    </div>
  );
}
