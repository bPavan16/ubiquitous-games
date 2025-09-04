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
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    },
    // Force polling for Vercel compatibility
    transports: process.env.NODE_ENV === 'production' ? ['polling'] : ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
});

// Middleware
app.use(cors({
    origin: "*",
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

app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Ubiqutous Gaming Server</title>
                <style>
                    body { font-family: Arial, sans-serif; background: #f9f9f9; color: #222; margin: 40px; }
                    h1 { color: #2c3e50; }
                    ul { line-height: 1.8; }
                    .container { max-width: 600px; margin: auto; background: #fff; padding: 32px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Welcome to the Ubiqutous Gaming Server!</h1>
                    <p>This backend powers real-time multiplayer games via REST and WebSocket APIs.</p>
                    <ul>
                        <li><a href="/api/health">Health Check</a></li>
                        <li><a href="/api/games">Available Games</a></li>
                        <li><a href="/api/game-types">Supported Game Types</a></li>
                        <li><a href="/api/stats">Server Stats</a></li>
                    </ul>
                    <p>Connect your client to play, create, or join games!</p>
                </div>
            </body>
        </html>
    `);
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