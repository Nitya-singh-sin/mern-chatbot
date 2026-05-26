import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [aiTyping, setAiTyping] = useState(false);
  const [currentRoom, setCurrentRoom] = useState("general");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("nexus_theme") || "dark");
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);

  // Apply theme
  useEffect(() => {
    document.body.classList.toggle("light", theme === "light");
    localStorage.setItem("nexus_theme", theme);
  }, [theme]);

  // Socket connection
  useEffect(() => {
    if (!token) return;

    const newSocket = io("http://localhost:5000", {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("🔌 Socket connected");
      setSocket(newSocket);
    });

    newSocket.on("message:receive", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on("users:online", (users) => {
      setOnlineUsers(users);
    });

    newSocket.on("user:typing", ({ userId, username }) => {
      if (userId !== user?._id) {
        setTypingUsers((prev) => {
          if (prev.find((u) => u.userId === userId)) return prev;
          return [...prev, { userId, username }];
        });
      }
    });

    newSocket.on("user:stopped-typing", ({ userId }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    });

    newSocket.on("ai:typing", (isTyping) => {
      setAiTyping(isTyping);
    });

    newSocket.on("message:reacted", ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, reactions } : m))
      );
    });

    newSocket.on("user:joined", ({ username }) => {
      toast(`${username} joined the chat`, { icon: "👋" });
    });

    newSocket.on("user:left", ({ username }) => {
      toast(`${username} left the chat`, { icon: "👋" });
    });

    newSocket.on("error", ({ message }) => {
      toast.error(message);
    });

    newSocket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
    });

    return () => newSocket.disconnect();
  }, [token, user?._id]);

  // Load chat history
  const loadHistory = useCallback(async (room = "general") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/chat/history/${room}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      toast.error("Failed to load chat history");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadHistory(currentRoom);
  }, [token, currentRoom, loadHistory]);

  // Join room
  const joinRoom = (room) => {
    if (socket) {
      socket.emit("room:join", room);
      setCurrentRoom(room);
      loadHistory(room);
    }
  };

  // Send message
  const sendMessage = (content, type = "text") => {
    if (!socket || !content.trim()) return;

    const isAI = content.toLowerCase().startsWith("@ai") || content.toLowerCase().startsWith("/ai");

    if (isAI) {
      socket.emit("message:ai", { content, room: currentRoom });
    } else {
      socket.emit("message:send", { content, room: currentRoom, type });
    }
    stopTyping();
  };

  // Typing indicators
  const startTyping = () => {
    if (!socket || isTypingRef.current) return;
    isTypingRef.current = true;
    socket.emit("typing:start", currentRoom);

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(stopTyping, 3000);
  };

  const stopTyping = () => {
    if (!socket || !isTypingRef.current) return;
    isTypingRef.current = false;
    socket.emit("typing:stop", currentRoom);
    clearTimeout(typingTimerRef.current);
  };

  // React to message
  const reactToMessage = (messageId, emoji) => {
    if (socket) socket.emit("message:react", { messageId, emoji });
  };

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ChatContext.Provider value={{
      socket, messages, onlineUsers, typingUsers, aiTyping,
      currentRoom, loading, theme, joinRoom, sendMessage,
      startTyping, stopTyping, reactToMessage, toggleTheme, loadHistory,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};
