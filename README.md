# 🤖 NexusChat — MERN Stack AI Chatbot

A full-featured real-time AI-powered chat application built with the MERN stack.

## ✨ Features

| Feature | Status |
|---------|--------|
| Login / Signup | ✅ JWT Auth |
| Real-time Chat | ✅ Socket.IO |
| AI Replies | ✅ Claude API |
| Voice Chat | ✅ Web Speech API |
| Emoji Support | ✅ Emoji Picker |
| Chat History | ✅ MongoDB |
| Dark / Light Mode | ✅ Toggle |
| Typing Animation | ✅ Real-time |
| Multiple Users | ✅ Rooms |
| Message Reactions | ✅ Emoji Reactions |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Real-time | Socket.IO |
| AI | Anthropic Claude API |
| Auth | JWT + bcryptjs |

---

## 📁 Folder Structure

```
mern-chatbot/
├── backend/                  # Node.js + Express API
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   └── socketController.js
│   ├── models/
│   │   ├── User.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── chatRoutes.js
│   │   └── userRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/                 # React.js App
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── Chat/
    │   │       ├── Message.jsx
    │   │       ├── ChatInput.jsx
    │   │       └── Sidebar.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── ChatContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   └── Chat.jsx
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── tailwind.config.js
    └── package.json
```

---

##  Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- Anthropic API Key

---

### Step 1: Clone & Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mern-chatbot
JWT_SECRET=your_super_secret_key_here
ANTHROPIC_API_KEY=sk-ant-your-key-here
CLIENT_URL=http://localhost:3000
```

Start backend:
```bash
npm run dev        # Development (nodemon)
npm start          # Production
```

---

### Step 2: Setup Frontend

```bash
cd frontend
npm install
npm start
```

App runs at: **http://localhost:3000**

---

##  How to Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up / Login
3. Go to **API Keys** section
4. Create a new key and copy it
5. Paste in `.env` as `ANTHROPIC_API_KEY`

---

##  Usage Guide

### Chat Features
- **Normal message**: Just type and send
- **AI Reply**: Start message with `@ai` or `/ai`
  - Example: `@ai What is machine learning?`
- **Emoji**: Click 😊 button
- **Voice**: Click 🎤 to speak (browser speech recognition)
- **Reactions**: Hover over a message to react with emoji

### Rooms
- `#General` — Main chat room
- `#AI Lab` — AI conversations
- `#Random` — Casual talk
- `#Tech Talk` — Tech discussions

---

## 🔌 API Endpoints

### Auth
```
POST /api/auth/signup    - Register new user
POST /api/auth/login     - Login user
GET  /api/auth/me        - Get current user
POST /api/auth/logout    - Logout
```

### Chat
```
GET  /api/chat/history/:room  - Get chat history
POST /api/chat/send           - Send message
POST /api/chat/ai             - Get AI response
DELETE /api/chat/:id          - Delete message
```

### Users
```
GET   /api/users           - Get all users
PATCH /api/users/theme     - Update theme
PATCH /api/users/profile   - Update profile
```

---

## 🌐 Socket Events

### Client → Server
| Event | Payload |
|-------|---------|
| `message:send` | `{content, room, type}` |
| `message:ai` | `{content, room}` |
| `typing:start` | `room` |
| `typing:stop` | `room` |
| `message:react` | `{messageId, emoji}` |
| `room:join` | `room` |

### Server → Client
| Event | Description |
|-------|-------------|
| `message:receive` | New message |
| `users:online` | Online users list |
| `user:typing` | User typing |
| `user:stopped-typing` | User stopped typing |
| `ai:typing` | AI is generating |
| `message:reacted` | Message reaction updated |

---

## 🎨 Dark/Light Mode

Toggle with the ☀️/🌙 button in the sidebar. Preference is saved to localStorage.

---

## 🔒 Security Features

- JWT authentication with 7-day expiry
- Passwords hashed with bcryptjs (salt rounds: 12)
- Protected routes (frontend + backend)
- Socket.IO authentication middleware
- CORS protection

---

## 📦 Production Deployment

```bash
# Build frontend
cd frontend && npm run build

# Serve build with backend (add to server.js)
app.use(express.static(path.join(__dirname, '../frontend/build')));

# Or deploy separately:
# Backend → Railway / Render / Heroku
# Frontend → Vercel / Netlify
```

---

Made with ❤️ using MERN Stack + Claude AI
