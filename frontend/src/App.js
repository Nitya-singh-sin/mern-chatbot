import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ChatPage from "./pages/Chat";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--nexus-bg)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl animate-bounce" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>🤖</div>
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#6366f1" }} />
          <p className="text-sm gradient-text font-semibold">Loading NexusChat...</p>
        </div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/chat" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/chat" element={
        <PrivateRoute>
          <ChatProvider>
            <ChatPage />
          </ChatProvider>
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--nexus-card)",
              color: "var(--nexus-text)",
              border: "1px solid var(--nexus-border)",
              borderRadius: "12px",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "white" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "white" } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
