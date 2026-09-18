# Pollora — Real-Time Live Polling Platform

A real-time live polling and audience engagement platform built with **React**, **Go (Gin)**, **MongoDB**, **Redis Pub/Sub**, and **WebSockets**.

## 🌐 Live Demo

* **Frontend:** https://pollora-wheat.vercel.app/
* **Backend:** https://pollora-backend.onrender.com/
* **GitHub:** https://github.com/GayathiriAzhagesan/pollora

---

## 🌟 Overview

Pollora allows presenters to create and share live polls while audiences participate instantly from any mobile or desktop browser.

### Core Flow

1. **Create Poll** — Presenters create single-choice or multi-choice polls with a live preview.
2. **Share Instantly** — Polls can be shared using canonical links, QR codes, or social sharing options.
3. **Audience Votes** — Participants can vote without creating an account.
4. **Live Results** — Results update in real time without requiring a page refresh.

---

## ✨ Key Features

* 🔐 Email/password authentication
* 🔵 Google OAuth login
* 📊 Single-choice and multi-choice polls
* 🔗 Shareable poll links
* 📱 Responsive mobile and desktop experience
* 📷 Dynamic QR-code sharing
* ⚡ Real-time vote updates
* 🔄 WebSocket-based live results
* 🚀 Redis Pub/Sub for real-time event distribution
* 🗄️ MongoDB persistent data storage
* 🛡️ Server-side validation
* 🔑 JWT authentication
* 🔒 bcrypt password hashing
* 🎯 Public voting without requiring an account

---

## 🛠️ Tech Stack

| Layer          | Technology                     | Purpose                                           |
| -------------- | ------------------------------ | ------------------------------------------------- |
| Frontend       | React 18 + Vite + React Router | SPA, UI, routing and real-time state              |
| Backend        | Go 1.23 + Gin                  | REST API, authentication and WebSocket management |
| Database       | MongoDB                        | Users, polls and vote persistence                 |
| Realtime       | Redis Pub/Sub + WebSockets     | Real-time vote event distribution                 |
| Authentication | JWT + Google OAuth             | Secure user authentication                        |
| Deployment     | Vercel + Render                | Frontend and backend hosting                      |

---

## 🏗️ Architecture & Real-Time Flow

```text
[ Audience Browser ]
        |
        | PATCH /polls/:id/vote
        v
[ Go / Gin Backend ]
        |
        +---------------------------+
        |                           |
        | Atomic Persistence        | Real-Time Broadcast
        v                           v
[ MongoDB ]                  [ Redis Pub/Sub ]
        |                           |
        |                           v
        |                    [ WebSocket Hub ]
        |                           |
        |                           v
        +------------------> [ Live Results ]
                                  |
                           Updates without reload
```

### Why Redis Pub/Sub + WebSockets?

**WebSockets** maintain persistent connections between the server and connected clients, allowing vote updates to reach viewers without repeated page polling.

**Redis Pub/Sub** provides a message-broker layer for distributing vote events between backend processes and connected WebSocket clients.

**MongoDB** remains the persistent source of truth for poll and vote data, with atomic update operations used for vote-count changes.

---

## 🔒 Security & Validation

Pollora performs validation on the server before processing requests.

### Validation

* Questions must be non-empty.
* Polls require at least two valid options.
* Option IDs are validated server-side.
* MongoDB ObjectIDs are validated before database operations.

### Authentication

* JWT Bearer authentication protects authenticated operations.
* Poll creation and deletion require authentication.
* Passwords are hashed using **bcrypt**.
* Google OAuth is supported for user authentication.

### Public Voting

Voting is intentionally available without requiring audience members to create an account, providing a friction-free participation experience.

---

## 🚀 Running Locally

### Prerequisites

Install:

* [Go](https://go.dev/dl/) 1.23+
* [Node.js](https://nodejs.org/) 18+
* [MongoDB](https://www.mongodb.com/)
* Redis or an Upstash Redis instance

### 1. Clone the Repository

```bash
git clone https://github.com/GayathiriAzhagesan/pollora.git
cd pollora
```

### 2. Backend Setup

```bash
cd backend
```

Create a `.env` file using `.env.example` and configure your MongoDB, Redis, JWT and OAuth settings.

Then run:

```bash
go run .
```

The backend runs on **port 8080** by default.

### 3. Frontend Setup

```bash
cd frontend
```

Create a `.env` file using `.env.example` and configure:

```text
VITE_API_URL=http://localhost:8080
```

Then run:

```bash
npm install
npm run dev
```

The frontend runs on **port 5173** by default.

### 4. Access Pollora

* Open **Frontend URL**: [http://localhost:5173](http://localhost:5173)
* Backend API: [http://localhost:8080](http://localhost:8080)

---

## 📤 Deployment Status

| Component | URL | Status |
| --------- | --- | ------ |
| Frontend | https://pollora-wheat.vercel.app/ | ✅ Live |
| Backend | https://pollora-backend.onrender.com/ | ✅ Live |

---

## 📄 License

[MIT License](LICENSE)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feat/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Authors

* **Gayathiri Azhagesan** - [GitHub](https://github.com/GayathiriAzhagesan)

---

## 🙏 Acknowledgments

* Gin Framework - Go web framework
* React + Vite - Frontend framework
* MongoDB - NoSQL database
* Redis - In-memory data store & message broker
* JWT - Authentication
* bcrypt - Password hashing

---

## 📚 References & Resources

* [Go Gin Documentation](https://gin-gonic.com/docs/)
* [React Router Documentation](https://reactrouter.com/)
* [MongoDB Documentation](https://docs.mongodb.com/)
* [Redis Pub/Sub Documentation](https://redis.io/docs/manual/pubsub/)
* [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

---

## 🏁 Support & Next Steps

* **Need production-ready features?** Consider private polls, live countdowns, advanced analytics, and multi-language support.
* **Questions or issues?** Open an issue or contact the maintainers.

---

### Built with 💜 using Pollora
