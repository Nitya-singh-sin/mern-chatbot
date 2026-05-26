import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

const API = axios.create({ baseURL: "/api" });

// Add token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("nexus_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("nexus_token"));

  const loadUser = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await API.get("/auth/me");
      setUser(data.user);
    } catch {
      localStorage.removeItem("nexus_token");
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    localStorage.setItem("nexus_token", data.token);
    setToken(data.token);
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.username}! 👋`);
    return data;
  };

  const signup = async (username, email, password) => {
    const { data } = await API.post("/auth/signup", { username, email, password });
    localStorage.setItem("nexus_token", data.token);
    setToken(data.token);
    setUser(data.user);
    toast.success(`Account created! Welcome, ${data.user.username}! 🎉`);
    return data;
  };

  const logout = async () => {
    try { await API.post("/auth/logout"); } catch {}
    localStorage.removeItem("nexus_token");
    setToken(null);
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, setUser, API }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export { API };
