import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Signup() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) return toast.error("Please fill all fields");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    if (form.password !== form.confirm) return toast.error("Passwords don't match");
    setLoading(true);
    try {
      await signup(form.username, form.email, form.password);
      navigate("/chat");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColors = ["", "#ef4444", "#f59e0b", "#10b981"];
  const strengthLabels = ["", "Weak", "Medium", "Strong"];

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4" style={{ background: "var(--nexus-bg)" }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 glow-primary" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <span className="text-3xl">🤖</span>
          </div>
          <h1 className="text-3xl font-bold font-display gradient-text">NexusChat</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--nexus-muted)" }}>Create your free account</p>
        </div>

        <div className="rounded-2xl p-8 border" style={{ background: "var(--nexus-card)", borderColor: "var(--nexus-border)" }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: "var(--nexus-text)" }}>Join NexusChat 🚀</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Username", name: "username", type: "text", placeholder: "cooluser123" },
              { label: "Email", name: "email", type: "email", placeholder: "you@example.com" },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--nexus-muted)" }}>{label}</label>
                <input
                  type={type} name={name} value={form[name]}
                  onChange={handleChange} placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                  style={{ background: "var(--nexus-surface)", borderColor: "var(--nexus-border)", color: "var(--nexus-text)" }}
                />
              </div>
            ))}

            {/* Password with strength */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--nexus-muted)" }}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"} name="password" value={form.password}
                  onChange={handleChange} placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 pr-11 rounded-xl border text-sm outline-none transition-all"
                  style={{ background: "var(--nexus-surface)", borderColor: "var(--nexus-border)", color: "var(--nexus-text)" }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1 mb-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength ? strengthColors[strength] : "var(--nexus-border)" }} />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</p>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--nexus-muted)" }}>Confirm Password</label>
              <input
                type="password" name="confirm" value={form.confirm}
                onChange={handleChange} placeholder="Re-enter password"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={{
                  background: "var(--nexus-surface)",
                  borderColor: form.confirm && form.confirm !== form.password ? "#ef4444" : "var(--nexus-border)",
                  color: "var(--nexus-text)"
                }}
              />
              {form.confirm && form.confirm !== form.password && (
                <p className="text-xs mt-1" style={{ color: "#ef4444" }}>Passwords don't match</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-2"
              style={{ background: loading ? "var(--nexus-border)" : "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : "Create Account →"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: "var(--nexus-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: "var(--nexus-primary)" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
