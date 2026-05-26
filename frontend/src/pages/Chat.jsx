import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import Message from "../components/Chat/Message";
import ChatInput from "../components/Chat/ChatInput";
import Sidebar from "../components/Chat/Sidebar";

function TypingIndicator({ users }) {
  if (!users || users.length === 0) return null;
  const text = users.length === 1
    ? `${users[0].username} is typing`
    : users.length === 2
      ? `${users[0].username} and ${users[1].username} are typing`
      : `${users.length} people are typing`;

  return (
    <div className="flex items-center gap-3 px-4 py-2 animate-fade-in">
      <div className="flex items-center gap-1 px-3 py-2 rounded-2xl rounded-bl-sm" style={{ background: "var(--nexus-card)" }}>
        <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--nexus-muted)" }} />
        <span className="typing-dot w-1.5 h-1.5 rounded-full mx-0.5" style={{ background: "var(--nexus-muted)" }} />
        <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--nexus-muted)" }} />
      </div>
      <span className="text-xs" style={{ color: "var(--nexus-muted)" }}>{text}...</span>
    </div>
  );
}

function AITypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-4 py-2 animate-fade-in">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}>🤖</div>
      <div className="flex items-center gap-1 px-3 py-2 rounded-2xl rounded-bl-sm ai-message-glow" style={{ background: "var(--nexus-card)" }}>
        <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />
        <span className="typing-dot w-1.5 h-1.5 rounded-full mx-0.5" style={{ background: "#10b981" }} />
        <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />
      </div>
      <span className="text-xs" style={{ color: "#10b981" }}>NexusAI is thinking...</span>
    </div>
  );
}

const ROOM_NAMES = {
  general: { name: "General", emoji: "💬", desc: "Public chat for everyone" },
  "ai-chat": { name: "AI Lab", emoji: "🤖", desc: "Dedicated AI conversations" },
  random: { name: "Random", emoji: "🎲", desc: "Off-topic discussions" },
  tech: { name: "Tech Talk", emoji: "💻", desc: "Technology discussions" },
};

export default function ChatPage() {
  const { user } = useAuth();
  const { messages, typingUsers, aiTyping, currentRoom, loading, onlineUsers } = useChat();
  const bottomRef = useRef(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const room = ROOM_NAMES[currentRoom] || { name: currentRoom, emoji: "💬", desc: "" };

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers, aiTyping]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--nexus-bg)" }}>
      {/* Mobile sidebar overlay */}
      {showSidebar && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSidebar(false)} />
          <div className="absolute left-0 top-0 h-full w-72 z-50">
            <Sidebar onClose={() => setShowSidebar(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-72 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center gap-4 px-5 py-4 border-b" style={{ background: "var(--nexus-surface)", borderColor: "var(--nexus-border)" }}>
          {/* Mobile menu button */}
          <button onClick={() => setShowSidebar(true)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-xl" style={{ background: "var(--nexus-card)" }}>☰</button>

          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl">{room.emoji}</span>
            <div className="min-w-0">
              <h2 className="font-bold truncate" style={{ color: "var(--nexus-text)" }}>#{room.name}</h2>
              <p className="text-xs truncate" style={{ color: "var(--nexus-muted)" }}>{room.desc}</p>
            </div>
          </div>

          {/* Right: online count */}
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: "var(--nexus-card)" }}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-medium" style={{ color: "var(--nexus-text)" }}>{onlineUsers.length + 1} online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--nexus-primary)" }} />
                <p className="text-sm" style={{ color: "var(--nexus-muted)" }}>Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl" style={{ background: "var(--nexus-card)" }}>
                {room.emoji}
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1" style={{ color: "var(--nexus-text)" }}>Welcome to #{room.name}!</h3>
                <p className="text-sm" style={{ color: "var(--nexus-muted)" }}>
                  This is the start of the conversation.<br />
                  Type <code className="px-1 py-0.5 rounded text-xs" style={{ background: "var(--nexus-card)", color: "#10b981" }}>@ai</code> to talk with NexusAI 🤖
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1 max-w-4xl mx-auto">
              {messages.map((msg) => (
                <Message key={msg._id} message={msg} />
              ))}
            </div>
          )}

          {/* Typing indicators */}
          <div className="max-w-4xl mx-auto">
            {aiTyping && <AITypingIndicator />}
            {typingUsers.length > 0 && !aiTyping && <TypingIndicator users={typingUsers} />}
          </div>

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0" style={{ background: "var(--nexus-surface)", borderTop: "1px solid var(--nexus-border)" }}>
          <ChatInput />
        </div>
      </div>
    </div>
  );
}
