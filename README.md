<div align="center">

  

# Ubiquitous Games Platform

A modern real-time multiplayer gaming platform featuring **Sudoku**, **Battleship**, and **Tic-Tac-Toe**. Built with cutting-edge web technologies for seamless multiplayer experiences with live chat, leaderboards, and responsive design.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://ubiquitous-games.vercel.app)

 
</div>

## ✨ Features

| Game | Description | Players | Features |
|------|-------------|---------|----------|
| 🧩 **Sudoku** | Collaborative puzzle solving | 1-4 | Real-time sync, hints, difficulty levels |
| ⚓ **Battleship** | Classic naval combat | 2 | Ship placement, turn-based combat, animations |
| ❌ **Tic-Tac-Toe** | Quick strategy matches | 2 | Fast gameplay, instant results |

### 🌟 Platform Features
- 💬 **Real-time Chat** - In-game messaging for all multiplayer games
- 🏆 **Live Leaderboards** - Track progress and rankings in real-time  
- 📱 **Mobile Responsive** - Optimized for all devices and screen sizes
- 🚀 **Modern UI** - Beautiful interface with smooth animations
- 🔄 **Auto-reconnect** - Robust connection handling with automatic reconnection

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=flat-square&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?style=flat-square&logo=vite)

- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety and enhanced developer experience  
- **Zustand** - Lightweight state management for each game
- **Tailwind CSS 4** - Modern utility-first styling with animations
- **Shadcn UI** - Beautiful, accessible component library
- **Vite** - Lightning-fast build tool and dev server

### Backend
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-010101?style=flat-square&logo=socket.io)

- **Node.js & Express** - Scalable server architecture
- **Socket.IO** - Real-time bidirectional communication
- **CORS** - Cross-origin resource sharing configuration

## 🚀 Quick Start

### Prerequisites
- 📦 Node.js 18+ 
- 🔧 npm or yarn

### Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/bPavan16/ubiquitous-sudoku.git
cd ubiquitous-sudoku

# 2️⃣ Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3️⃣ Setup environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Running Locally

```bash
# 🖥️ Start backend (Terminal 1)
cd backend && npm run dev
# ➜ Server: http://localhost:3001

# 🌐 Start frontend (Terminal 2)  
cd frontend && npm run dev
# ➜ App: http://localhost:5173
```

### 🌍 API Endpoints
- 🏥 Health Check: `http://localhost:3001/api/health`
- 🎮 Available Games: `http://localhost:3001/api/games`
- 📊 Game Stats: `http://localhost:3001/api/stats`

## 🚀 Deployment

### Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bPavan16/ubiquitous-sudoku)

#### Backend Setup
1. Import your repo to Vercel
2. Set root directory to `backend/`
3. Add environment variables:
   ```
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

#### Frontend Setup  
1. Create new Vercel project for frontend
2. Set root directory to `frontend/`
3. Add environment variable:
   ```
   VITE_BACKEND_SERVER_URL=https://your-backend-domain.vercel.app
   ```

> **⚠️ Note**: Vercel uses polling transport for Socket.IO (no WebSocket support in serverless)

## 📁 Project Structure

```
📦 ubiquitous-games/
├── 🖥️  backend/           # Node.js Express Server
│   ├── src/games/         # Game logic implementations  
│   ├── src/socket/        # Socket.IO management
│   └── src/index.js       # Server entry point
├── 🌐 frontend/           # React Application
│   ├── src/components/    # React components
│   ├── src/store/         # Zustand state stores
│   └── src/App.tsx        # Main app component
└── 📝 README.md          # Project documentation
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. 🍴 Fork the repository
2. 🌟 Create your feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🔄 Open a Pull Request

## 👨‍💻 Author

**bPavan16**
- 🐙 GitHub: [@bPavan16](https://github.com/bPavan16)
- 📫 Repository: [ubiquitous-sudoku](https://github.com/bPavan16/ubiquitous-sudoku)

## 📄 License

This project is licensed under the MIT License - feel free to use it however you'd like!

---

<div align="center">

**🎮 Ready to play? [Start Gaming Now!](https://ubiquitous-games.vercel.app) 🎮**

Made with ❤️ by [bPavan16](https://github.com/bPavan16)

</div>
