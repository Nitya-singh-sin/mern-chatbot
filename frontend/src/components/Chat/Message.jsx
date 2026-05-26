import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function Message({ message }) {
  const { user } = useAuth();
  const { reactToMessage } = useChat();
  const [showReactions, setShowReactions] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);

  const isOwn = message.sender?._id === user?._id || message.sender === user?._id;
  const isAI = message.isAI || message.type === "ai";
  const isDeleted = message.deleted;

  const senderName = isAI ? "🤖 NexusAI" : (message.sender?.username || "Unknown");
  const avatar = isAI
    ? null
    : (message.sender?.avatar || `https://ui-avatars.com/api/?name=${senderName}&background=6366f1&color=fff`);

  // Group reactions
  const groupedReactions = message.reactions?.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <div className={`flex gap-3 group message-enter ${isOwn ? "flex-row-reverse" : "flex-row"} mb-4`}>
      {/* Avatar */}
      <div className="flex-shrink-0 self-end">
        {isAI ? (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm glow-ai" style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}>🤖</div>
        ) : (
          <img src={avatar} alt={senderName} className="w-8 h-8 rounded-full object-cover ring-2" style={{ ringColor: isOwn ? "#6366f1" : "var(--nexus-border)" }} />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[70%] min-w-0 ${isOwn ? "items-end" : "items-start"} flex flex-col`}
        onMouseEnter={() => setShowReactions(true)}
        onMouseLeave={() => { setShowReactions(false); setShowEmojis(false); }}>

        {/* Sender name */}
        {!isOwn && (
          <span className="text-xs font-medium mb-1 px-1" style={{ color: isAI ? "#10b981" : "var(--nexus-muted)" }}>
            {senderName}
          </span>
        )}

        <div className="relative">
          {/* Message bubble */}
          <div className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words
            ${isOwn ? "rounded-br-sm" : "rounded-bl-sm"}
            ${isAI ? "ai-message-glow" : ""}
            ${isDeleted ? "opacity-50 italic" : ""}
          `} style={{
            background: isAI
              ? "linear-gradient(135deg, #10b98115, #06b6d415)"
              : isOwn
                ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                : "var(--nexus-card)",
            borderColor: isAI ? "#10b98133" : "var(--nexus-border)",
            border: isOwn ? "none" : "1px solid",
            color: "var(--nexus-text)",
            maxWidth: "100%",
          }}>
            {message.content}

            {/* Time */}
            <span className="text-xs ml-2 opacity-50 float-right mt-1" style={{ fontSize: "10px" }}>
              {formatTime(message.createdAt)}
            </span>
          </div>

          {/* Quick reaction button */}
          {showReactions && !isDeleted && (
            <div className={`absolute -top-8 ${isOwn ? "right-0" : "left-0"} flex gap-1 px-2 py-1 rounded-xl border animate-fade-in z-10`}
              style={{ background: "var(--nexus-surface)", borderColor: "var(--nexus-border)" }}>
              {QUICK_EMOJIS.map((emoji) => (
                <button key={emoji} onClick={() => reactToMessage(message._id, emoji)}
                  className="hover:scale-125 transition-transform text-sm">
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reactions display */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <button key={emoji} onClick={() => reactToMessage(message._id, emoji)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all hover:scale-105"
                style={{ background: "var(--nexus-surface)", borderColor: "var(--nexus-border)" }}>
                {emoji} <span style={{ color: "var(--nexus-muted)" }}>{count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
