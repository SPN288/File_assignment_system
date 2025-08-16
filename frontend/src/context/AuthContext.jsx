import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem("auth");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username, password) => {
    const { data } = await api.post("/auth/login", { username, password });
    const authData = { token: data.token, user: data.user };
    setAuth(authData);
    localStorage.setItem("auth", JSON.stringify(authData));
    return data.user;
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem("auth");
  };

  return (
    <AuthCtx.Provider value={{ auth, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
