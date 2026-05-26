import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";

const ROOMS = [
  { id: "general", name: "General", emoji: "💬" },
  { id: "ai-chat", name: "AI Lab", emoji: "🤖" },
  { id: "random", name: "Random", emoji: "🎲" },
  { id: "tech", name: "Tech Talk", emoji: "💻" },
];

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const { onlineUsers, currentRoom, joinRoom, toggleTheme, theme } = useChat();

  // Ensure onlineUsers is always an array
  const usersArray = Array.isArray(onlineUsers) ? onlineUsers : [];

  const handleRoomChange = (roomId) => {
    joinRoom(roomId);
    if (onClose) onClose();
  };

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--nexus-surface)", borderRight: "1px solid var(--nexus-border)" }}>
      {/* Header */}
      <div className="p-5 border-b" style={{ borderColor: "var(--nexus-border)" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>🤖</div>
          <div>
            <h1 className="font-bold font-display text-lg gradient-text">NexusChat</h1>
            <p className="text-xs" style={{ color: "var(--nexus-muted)" }}>AI-Powered</p>
          </div>
          <button onClick={toggleTheme} className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg hover:scale-110 transition-transform" style={{ background: "var(--nexus-card)" }} title="Toggle theme">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>

        {/* User profile */}
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--nexus-card)" }}>
          <div className="relative">
            <img src={user?.avatar} alt={user?.username} className="w-9 h-9 rounded-full object-cover" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2" style={{ borderColor: "var(--nexus-card)" }} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate" style={{ color: "var(--nexus-text)" }}>{user?.username}</p>
            <p className="text-xs" style={{ color: "#10b981" }}>● Online</p>
          </div>
          <button onClick={logout} className="ml-auto text-lg hover:scale-110 transition-transform" title="Logout">🚪</button>
        </div>
      </div>

      {/* Rooms */}
      <div className="p-4 border-b" style={{ borderColor: "var(--nexus-border)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--nexus-muted)" }}>Channels</p>
        <div className="space-y-1">
          {ROOMS.map((room) => (
            <button key={room.id} onClick={() => handleRoomChange(room.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] ${currentRoom === room.id ? "text-white" : ""}`}
              style={{
                background: currentRoom === room.id ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
                color: currentRoom === room.id ? "white" : "var(--nexus-muted)",
              }}>
              <span>{room.emoji}</span>
              <span># {room.name}</span>
              {currentRoom === room.id && <span className="ml-auto w-2 h-2 rounded-full bg-white opacity-80" />}
            </button>
          ))}
        </div>
      </div>

      {/* Online Users */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "var(--nexus-muted)" }}>
          Online Users
          <span className="px-1.5 py-0.5 rounded-full text-xs" style={{ background: "#10b98120", color: "#10b981" }}>
            {usersArray.length}
          </span>
        </p>

        {usersArray.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: "var(--nexus-muted)" }}>No other users online</p>
        ) : (
          <div className="space-y-2">
            {usersArray.map((userData) => (
              <div key={userData.id || userData._id} className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:scale-[1.01]" style={{ background: "var(--nexus-card)" }}>
                <div className="relative flex-shrink-0">
                  <img
                    src={`https://ui-avatars.com/api/?name=${userData.username}&background=6366f1&color=fff&bold=true`}
                    alt={userData.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2" style={{ borderColor: "var(--nexus-card)" }} />
                </div>
                <span className="text-sm font-medium truncate" style={{ color: "var(--nexus-text)" }}>{userData.username}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t" style={{ borderColor: "var(--nexus-border)" }}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs" style={{ background: "var(--nexus-card)", color: "var(--nexus-muted)" }}>
          <span>🤖</span>
          <span>Type <code className="px-1" style={{ color: "#10b981" }}>@ai</code> for AI reply</span>
        </div>
      </div>
    </div>
  );
}
