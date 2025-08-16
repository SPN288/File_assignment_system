import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const user = await login(form.username, form.password);
      nav(`/${user.role}/dashboard`);
    } catch (e) {
      setErr(e.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="container">
      <h1>Role Files Login</h1>
      <form onSubmit={onSubmit} className="card">
        <input
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          required
        />
        <button type="submit">Login</button>
        {err && <p className="error">{err}</p>}
        <p className="hint">Seed: admin1/admin123, incharge1/incharge123</p>
      </form>
    </div>
  );
}
