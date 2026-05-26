import React, { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import { useChat } from "../../context/ChatContext";
import toast from "react-hot-toast";

export default function ChatInput() {
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const inputRef = useRef(null);
  const emojiRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const { sendMessage, startTyping, stopTyping, theme } = useChat();

  // Close emoji on outside click
  useEffect(() => {
    const handler = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmoji(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (e) => {
    setInput(e.target.value);
    if (e.target.value) startTyping();
    else stopTyping();
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
    stopTyping();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleEmoji = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        // Use SpeechRecognition to transcribe
        const url = URL.createObjectURL(blob);
        stream.getTracks().forEach((t) => t.stop());
        toast.success("Voice recorded! (Transcription in production)");
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
      clearInterval(timerRef.current);
    }
  };

  // Speech to text (browser API)
  const handleVoiceToText = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      return toast.error("Speech recognition not supported in this browser");
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    setIsRecording(true);
    timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript);
      setIsRecording(false);
      clearInterval(timerRef.current);
      setRecordingTime(0);
      inputRef.current?.focus();
    };

    recognition.onerror = () => {
      setIsRecording(false);
      clearInterval(timerRef.current);
      setRecordingTime(0);
      toast.error("Voice recognition failed");
    };

    recognition.onend = () => {
      setIsRecording(false);
      clearInterval(timerRef.current);
      setRecordingTime(0);
    };

    recognition.start();
  };

  const isAIMode = input.toLowerCase().startsWith("@ai") || input.toLowerCase().startsWith("/ai");

  return (
    <div className="relative px-4 pb-4 pt-2">
      {/* AI Mode indicator */}
      {isAIMode && (
        <div className="absolute -top-8 left-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-t-xl text-xs glow-ai animate-fade-in"
          style={{ background: "#10b98115", border: "1px solid #10b98133", color: "#10b981" }}>
          🤖 <span>AI Mode — NexusAI will reply to your message</span>
        </div>
      )}

      <div className={`flex items-end gap-3 p-3 rounded-2xl border transition-all ${isAIMode ? "glow-ai" : ""}`}
        style={{
          background: "var(--nexus-card)",
          borderColor: isAIMode ? "#10b98133" : "var(--nexus-border)",
        }}>

        {/* Emoji button */}
        <div className="relative" ref={emojiRef}>
          <button onClick={() => setShowEmoji(!showEmoji)}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-xl transition-all hover:scale-110"
            style={{ background: showEmoji ? "var(--nexus-primary)" : "var(--nexus-surface)" }}
            title="Emoji">
            😊
          </button>

          {showEmoji && (
            <div className="absolute bottom-12 left-0 z-50 animate-slide-up shadow-2xl rounded-2xl overflow-hidden">
              <EmojiPicker
                onEmojiClick={handleEmoji}
                theme={theme === "dark" ? "dark" : "light"}
                height={380}
                width={320}
                searchDisabled={false}
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
        </div>

        {/* Text input */}
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={isRecording ? "🎤 Listening..." : 'Type a message... (use @ai for AI reply)'}
          rows={1}
          disabled={isRecording}
          className="flex-1 resize-none outline-none text-sm leading-relaxed max-h-32 bg-transparent"
          style={{ color: "var(--nexus-text)" }}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px";
          }}
        />

        {/* Recording indicator */}
        {isRecording && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg recording-pulse" style={{ background: "#ef444415", color: "#ef4444" }}>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-mono">{String(Math.floor(recordingTime / 60)).padStart(2, "0")}:{String(recordingTime % 60).padStart(2, "0")}</span>
          </div>
        )}

        {/* Voice button */}
        <button
          onClick={isRecording ? stopRecording : handleVoiceToText}
          className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-lg transition-all hover:scale-110 ${isRecording ? "recording-pulse" : ""}`}
          style={{ background: isRecording ? "#ef4444" : "var(--nexus-surface)" }}
          title={isRecording ? "Stop recording" : "Voice message"}>
          🎤
        </button>

        {/* Send button */}
        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl font-bold text-white transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: isAIMode ? "linear-gradient(135deg, #10b981, #06b6d4)" : "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          title="Send message">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>

      {/* Tips */}
      <p className="text-center text-xs mt-2" style={{ color: "var(--nexus-muted)" }}>
        <kbd className="px-1 py-0.5 rounded text-xs" style={{ background: "var(--nexus-card)" }}>Enter</kbd> to send &nbsp;·&nbsp;
        <kbd className="px-1 py-0.5 rounded text-xs" style={{ background: "var(--nexus-card)" }}>Shift+Enter</kbd> for new line &nbsp;·&nbsp;
        <span style={{ color: "#10b981" }}>@ai</span> for AI reply
      </p>
    </div>
  );
}
