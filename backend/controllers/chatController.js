const Message = require("../models/Message");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const getAIReply = async (userMessage) => {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 1000,
    messages: [
      {
        role: "system",
        content: `You are NexusAI, a helpful and friendly AI assistant in a chat app called NexusChat. 
        Reply concisely and engagingly. Use emojis occasionally. 
        Keep responses under 200 words unless more detail is needed.
        If someone speaks Hindi, reply in Hindi too.`,
      },
      { role: "user", content: userMessage },
    ],
  });
  return response.choices[0].message.content;
};

// @desc    Get chat history
// @route   GET /api/chat/history/:room
exports.getChatHistory = async (req, res) => {
  try {
    const { room = "general" } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ room, deleted: false })
      .populate("sender", "username avatar isOnline")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Message.countDocuments({ room, deleted: false });

    res.json({
      messages: messages.reverse(),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get chat history error:", error);
    res.status(500).json({ message: "Failed to fetch chat history" });
  }
};

// @desc    Send message and get AI reply
// @route   POST /api/chat/send
exports.sendMessage = async (req, res) => {
  try {
    const { content, room = "general", type = "text", askAI = false } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }

    const message = await Message.create({
      sender: req.user.id,
      content: content.trim(),
      room,
      type,
    });

    await message.populate("sender", "username avatar isOnline");

    if (askAI || content.toLowerCase().startsWith("@ai") || content.toLowerCase().startsWith("/ai")) {
      const userMessage = content.replace(/^(@ai|\/ai)\s*/i, "").trim();

      try {
        const aiReply = await getAIReply(userMessage);

        const aiMessage = await Message.create({
          sender: req.user.id,
          content: aiReply,
          room,
          type: "ai",
          isAI: true,
        });
        await aiMessage.populate("sender", "username avatar");

        return res.status(201).json({ message, aiMessage, hasAIReply: true });
      } catch (aiError) {
        console.error("AI API error:", aiError);
      }
    }

    res.status(201).json({ message, hasAIReply: false });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// @desc    Delete message
// @route   DELETE /api/chat/:messageId
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    message.deleted = true;
    message.content = "This message was deleted";
    await message.save();

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete message" });
  }
};

// @desc    Get AI response only
// @route   POST /api/chat/ai
exports.getAIResponse = async (req, res) => {
  try {
    const { message } = req.body;
    const reply = await getAIReply(message);
    res.json({ reply });
  } catch (error) {
    console.error("AI response error:", error);
    res.status(500).json({ message: "AI service unavailable", reply: "Thodi der mein phir try karo! 🤖" });
  }
};
