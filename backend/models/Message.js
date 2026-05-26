const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },
    type: {
      type: String,
      enum: ["text", "ai", "voice", "emoji"],
      default: "text",
    },
    room: {
      type: String,
      default: "general",
    },
    isAI: {
      type: Boolean,
      default: false,
    },
    aiReply: {
      type: String,
      default: null,
    },
    reactions: [
      {
        emoji: String,
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    edited: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
