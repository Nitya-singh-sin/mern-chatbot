const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");
const Groq = require("groq-sdk");

const onlineUsers = new Map();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const getAIReply = async (userMessage) => {
  const response = await groq.chat.completions.create({
    model:"llama-3.3-70b-versatile",
    max_tokens: 1000,
    messages: [
      {
        role: "system",
        content: `You are NexusAI, a helpful and friendly AI assistant in NexusChat. 
        Be concise, friendly and use emojis occasionally.
        If someone speaks Hindi, reply in Hindi too.`,
      },
      { role: "user", content: userMessage },
    ],
  });
  return response.choices[0].message.content;
};

const socketHandler = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const user = socket.user;
    console.log(`✅ User connected: ${user.username} [${socket.id}]`);

    // Set user online
    onlineUsers.set(user._id.toString(), {
      socketId: socket.id,
      username: user.username,
      avatar: user.avatar,
    });

    await User.findByIdAndUpdate(user._id, { isOnline: true });

    // Broadcast online users list as array
    io.emit("users:online", Array.from(onlineUsers.entries()).map(([id, data]) => ({ id, ...data })));

    // Join default room
    socket.join("general");

    // Notify room of new user
    socket.to("general").emit("user:joined", {
      userId: user._id,
      username: user.username,
      avatar: user.avatar,
    });

    // Handle room join
    socket.on("room:join", (room) => {
      socket.join(room);
      socket.emit("room:joined", { room });
    });

    // Handle new message
    socket.on("message:send", async (data) => {
      try {
        const { content, room = "general", type = "text" } = data;

        const message = await Message.create({
          sender: user._id,
          content,
          room,
          type,
        });

        await message.populate("sender", "username avatar isOnline");
        io.to(room).emit("message:receive", message);
      } catch (error) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle AI message
    socket.on("message:ai", async (data) => {
      try {
        const { content, room = "general" } = data;

        // Save user message
        const userMessage = await Message.create({
          sender: user._id,
          content,
          room,
          type: "text",
        });
        await userMessage.populate("sender", "username avatar");
        io.to(room).emit("message:receive", userMessage);

        // Show AI typing
        io.to(room).emit("ai:typing", true);

        // Get AI reply
        const aiQuery = content.replace(/^(@ai|\/ai)\s*/i, "").trim();
        const aiText = await getAIReply(aiQuery);

        // Save AI message
        const aiMessage = await Message.create({
          sender: user._id,
          content: aiText,
          room,
          type: "ai",
          isAI: true,
        });
        await aiMessage.populate("sender", "username avatar");

        io.to(room).emit("ai:typing", false);
        io.to(room).emit("message:receive", aiMessage);
      } catch (error) {
        console.error("Socket AI error:", error);
        io.to(data.room || "general").emit("ai:typing", false);
        socket.emit("error", { message: "AI service error" });
      }
    });

    // Handle typing indicator
    socket.on("typing:start", (room) => {
      socket.to(room).emit("user:typing", {
        userId: user._id,
        username: user.username,
      });
    });

    socket.on("typing:stop", (room) => {
      socket.to(room).emit("user:stopped-typing", { userId: user._id });
    });

    // Handle message reactions
    socket.on("message:react", async ({ messageId, emoji }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;

        const existingReaction = message.reactions.find(
          (r) => r.user.toString() === user._id.toString() && r.emoji === emoji
        );

        if (existingReaction) {
          message.reactions = message.reactions.filter(
            (r) => !(r.user.toString() === user._id.toString() && r.emoji === emoji)
          );
        } else {
          message.reactions.push({ emoji, user: user._id });
        }

        await message.save();
        io.to(message.room).emit("message:reacted", {
          messageId,
          reactions: message.reactions,
        });
      } catch (error) {
        socket.emit("error", { message: "Failed to react to message" });
      }
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      console.log(`❌ User disconnected: ${user.username}`);
      onlineUsers.delete(user._id.toString());

      await User.findByIdAndUpdate(user._id, {
        isOnline: false,
        lastSeen: new Date(),
      });

      io.emit("users:online", Array.from(onlineUsers.entries()).map(([id, data]) => ({ id, ...data })));
      io.emit("user:left", { userId: user._id, username: user.username });
    });
  });
};

module.exports = { socketHandler };
