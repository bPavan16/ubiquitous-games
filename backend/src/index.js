import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import UnifiedSocketManager from './socket/UnifiedSocketManager.js';
import GameFactory from './games/GameFactory.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5174", "http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: ["http://localhost:5174", "http://localhost:5173", "http://localhost:3000"],
    credentials: true
}));
app.use(express.json());

// Initialize Unified Socket Manager
const socketManager = new UnifiedSocketManager(io);

// Cleanup inactive games every 10 minutes
setInterval(() => {
    socketManager.cleanupInactiveGames();
}, 10 * 60 * 1000);

// REST API endpoints
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        stats: socketManager.getGameStats()
    });
});

app.get('/api/games', (req, res) => {
    const { gameType } = req.query;
    
    let availableGames = Array.from(socketManager.games.values())
        .filter(game => game.gameState === 'waiting' && game.players.size < game.maxPlayers);
    
    if (gameType) {
        availableGames = availableGames.filter(game => game.gameType === gameType);
    }
    
    const gameList = availableGames.map(game => game.getPublicGameInfo());
    res.json(gameList);
});

app.get('/api/stats', (req, res) => {
    res.json(socketManager.getGameStats());
});

app.get('/api/game-types', (req, res) => {
    res.json(GameFactory.getSupportedGameTypes());
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🎮 Multiplayer Gaming server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🎯 Available games: http://localhost:${PORT}/api/games`);
    console.log(`🎲 Game types: http://localhost:${PORT}/api/game-types`);
    console.log(`📈 Stats: http://localhost:${PORT}/api/stats`);
});