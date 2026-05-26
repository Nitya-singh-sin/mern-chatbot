import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Please fill all fields");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/chat");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4" style={{ background: "var(--nexus-bg)" }}>
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 glow-primary" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <span className="text-3xl">🤖</span>
          </div>
          <h1 className="text-3xl font-bold font-display gradient-text">NexusChat</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--nexus-muted)" }}>AI-Powered Real-time Chat</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 border" style={{ background: "var(--nexus-card)", borderColor: "var(--nexus-border)" }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: "var(--nexus-text)" }}>Welcome back 👋</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--nexus-muted)" }}>Email</label>
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2"
                style={{
                  background: "var(--nexus-surface)", borderColor: "var(--nexus-border)",
                  color: "var(--nexus-text)", "--tw-ring-color": "#6366f1"
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--nexus-muted)" }}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"} name="password" value={form.password}
                  onChange={handleChange} placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl border text-sm outline-none transition-all focus:ring-2"
                  style={{ background: "var(--nexus-surface)", borderColor: "var(--nexus-border)", color: "var(--nexus-text)" }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ background: loading ? "var(--nexus-border)" : "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: "var(--nexus-muted)" }}>
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold hover:underline" style={{ color: "var(--nexus-primary)" }}>
              Sign up free
            </Link>
          </p>
        </div>

        {/* Demo hint */}
        <p className="text-center text-xs mt-4" style={{ color: "var(--nexus-muted)" }}>
          Type <code className="px-1.5 py-0.5 rounded" style={{ background: "var(--nexus-card)", color: "#10b981" }}>@ai</code> before any message to get AI reply ✨
        </p>
      </div>
    </div>
  );
}
