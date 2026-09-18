# Pollora — Real-Time Live Polling Platform

A high-performance, real-time live polling and audience engagement platform built with **React**, **Go (Gin)**, **MongoDB**, and **Redis Pub/Sub**.

---

## 🌟 Overview & Core Flow

1. **Create Poll**: Presenters create single or multi-choice polls with live preview.
2. **Share Instantly**: Presenters share canonical links (`/poll/:id`), dynamic QR codes, or one-click social links (WhatsApp, LinkedIn, X/Twitter, Email).
3. **Audience Votes**: Participants vote seamlessly on any mobile or desktop browser without requiring an account.
4. **Watch Results Stream Live**: As votes come in, the presenter and audience see results update live in sub-seconds with **no page refresh needed**.

---

## 🛠️ Required Tech Stack

| Layer | Technology | Purpose in Project |
|---|---|---|
| **Frontend** | React 18 + Vite + React Router | Dynamic single-page application, responsive layout, interactive charts, real-time state |
| **Backend** | Go 1.23 + Gin Web Framework | High-throughput REST API, JWT authentication, server-side validation, WebSocket connection manager |
| **Database** | MongoDB | Persistent source of truth for users and polls, using atomic `$inc` operations for vote counts |
| **Realtime** | Redis Pub/Sub | Distributed message broker driving real-time vote updates across instances and WebSocket clients |

---

## 🏗️ Architecture & Real-Time Flow

```
   [ Audience Browser ] ───( PATCH /polls/:id/vote )───┐
                                                       │
                                                       ▼
                                            [ Go / Gin Backend ]
                                                       │
                           ┌───────────────────────────┴───────────────────────────┐
                           │ (1) Atomic Persistence                                │ (2) Real-Time Broadcast
                           ▼                                                       ▼
                  [ MongoDB Database ]                                    [ Redis Pub/Sub ]
             $inc: {"options.$.votes": 1}                               PUBLISH poll:<pollID>
                                                                                   │
                                                                                   ▼
                                                                           SUBSCRIBE poll:*
                                                                                   │
                                                                                   ▼
                                                                        [ Go WebSocket Hub ]
                                                                                   │
                                                                 ws.WriteMessage(poll_updated)
                                                                                   │
                                                                                   ▼
                                                                       [ Live Results Page ]
                                                                   (Updates live with no reload)
```

### Why Redis Pub/Sub + WebSockets?
- **True Real-Time**: Standard polling wastes bandwidth and adds latency. WebSockets maintain persistent, low-overhead connections to connected viewers.
- **Horizontal Scalability**: A standalone WebSocket server only knows about clients connected to that specific instance. By routing vote events through **Redis Pub/Sub**, any backend instance can publish a vote and notify all connected WebSocket subscribers across any number of server nodes.
- **MongoDB as Source of Truth**: Vote increments are executed atomically using MongoDB's `$inc` operator, preventing race conditions. Redis is used for high-speed message distribution.

---

## 🚀 How to Run Locally

### 1. Prerequisites
- [Go](https://go.dev/dl/) (v1.22+)
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) running locally on port `27017` or a MongoDB Atlas connection URI
- [Redis](https://redis.io/) running locally on port `6379` (or an Upstash Redis URL)

### 2. Backend Setup
```bash
cd backend

# Create .env from the example template
cp .env.example .env

# Run the Go server
go run .
```
The Go Gin backend will start on `http://localhost:8080`.
*(If Redis is offline, the backend gracefully falls back to local in-memory broadcasting while notifying you in the console).*

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The React frontend will be available at `http://localhost:5173`.

---

## 🔒 Security & Validation

- **Server-Side Validation**: All incoming requests are strictly checked before touching the database:
  - Questions must be non-empty strings.
  - Polls require a minimum of 2 valid, non-empty options.
  - Option IDs and MongoDB ObjectIDs are verified server-side.
- **Authentication**: Poll creation and deletion require a valid JWT `Bearer` token issued upon signup or login. Passwords are encrypted using **bcrypt** (cost factor 10).
- **Public Voting**: Voting and live results are publicly accessible to ensure friction-free participation for audiences.

---

## 📁 Project Structure

```
live-poll-app/
├── backend/
│   ├── auth.go           # Signup, login, password hashing, and token generation
│   ├── middleware.go     # JWT Bearer authentication middleware
│   ├── models.go         # MongoDB and API request/response structs
│   ├── mongo.go          # MongoDB client connection
│   ├── oauth.go          # Google OAuth authentication handlers
│   ├── poll.go           # Poll creation, retrieval, atomic voting, deletion
│   ├── redis.go          # Redis client, Pub/Sub subscriber, and publisher
│   ├── websocket.go      # Gorilla WebSocket hub and connection manager
│   └── main.go           # Gin engine routes, CORS, and entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # Modular UI components (Navbar, Modals, Logo, Cards)
│   │   ├── context/      # PollContext (API & WebSocket sync) & AuthContext
│   │   ├── pages/        # LandingPage, LoginPage, CreatePollPage, LiveResultsPage, etc.
│   │   ├── assets/       # Icons and showcase visuals
│   │   └── App.jsx       # React Router route declarations
│   └── package.json
└── README.md             # Project documentation & decisions
```

---

## 💡 Key Decisions & Evaluation Highlights

1. **Sub-second Realtime UI**: Built around WebSockets and Redis Pub/Sub so presentations on large screens update instantly when attendees submit votes from their phones.
2. **SurveyMars-Style Showcase UX**: High-tier SaaS design featuring keynote wall presentation modes, zero-app mobile voting experiences, and a live interactive voter simulator on the homepage.
3. **Graceful Fallbacks**: The system actively checks for Redis connectivity; if Redis is temporarily unreachable in a local dev environment, it seamlessly routes updates through an internal memory bus so developers are never blocked.
