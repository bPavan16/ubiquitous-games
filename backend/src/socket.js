import { Server } from 'socket.io';
import gameService from './services/gameService.js';

const setupSocketServer = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Track active games and players
    const activeGames = new Map();
    const playerSockets = new Map();

    io.on('connection', (socket) => {
        
        console.log(`User connected: ${socket.id}`);

        // Handle player joining a game
        socket.on('join-game', async ({ gameId, userId, username }) => {
            try {
                // Store player information
                playerSockets.set(socket.id, { userId, gameId, username });

                // Join socket room for this game
                socket.join(gameId);

                // Get or initialize game state
                if (!activeGames.has(gameId)) {
                    const gameData = await gameService.getGameById(gameId);
                    if (!gameData) {
                        throw new Error('Game not found');
                    }
                    activeGames.set(gameId, gameData);
                }

                const game = activeGames.get(gameId);

                // Add player to game if not already joined
                if (!game.players.some(player => player.userId === userId)) {
                    game.players.push({ userId, username, score: 0 });
                    await gameService.updateGame(gameId, { players: game.players });
                }

                // Notify everyone in the room about the new player
                io.to(gameId).emit('player-joined', {
                    userId,
                    username,
                    players: game.players
                });

                // Send current game state to the newly joined player
                socket.emit('game-state', game);
            } catch (error) {
                console.error('Error joining game:', error);
                socket.emit('error', { message: error.message });
            }
        });

        // Handle player making a move
        socket.on('make-move', async ({ gameId, userId, position, value }) => {
            try {
                if (!activeGames.has(gameId)) {
                    throw new Error('Game not found');
                }

                const game = activeGames.get(gameId);

                // Validate move
                const isValid = await gameService.validateMove(gameId, position, value);

                if (isValid) {
                    // Update game state
                    const row = Math.floor(position / 9);
                    const col = position % 9;
                    game.board[row][col] = value;

                    // Update player score
                    const playerIndex = game.players.findIndex(p => p.userId === userId);
                    if (playerIndex !== -1) {
                        game.players[playerIndex].score += 1;
                    }

                    // Save updated game to database
                    await gameService.updateGame(gameId, {
                        board: game.board,
                        players: game.players
                    });

                    // Broadcast the move to all players in the game
                    io.to(gameId).emit('move-made', {
                        userId,
                        position,
                        value,
                        players: game.players
                    });

                    // Check if game is complete
                    const isComplete = await gameService.checkGameCompletion(gameId);
                    if (isComplete) {
                        io.to(gameId).emit('game-complete', {
                            winners: [...game.players].sort((a, b) => b.score - a.score)
                        });
                    }
                } else {
                    // Notify player that move was invalid
                    socket.emit('invalid-move', { position, value });
                }
            } catch (error) {
                console.error('Error making move:', error);
                socket.emit('error', { message: error.message });
            }
        });

        // Handle player requesting a hint
        socket.on('request-hint', async ({ gameId, userId, position }) => {
            try {
                const hint = await gameService.getHint(gameId, position);
                socket.emit('hint', { position, value: hint });

                // Maybe deduct points for using a hint
                const game = activeGames.get(gameId);
                const playerIndex = game.players.findIndex(p => p.userId === userId);
                if (playerIndex !== -1) {
                    game.players[playerIndex].score -= 0.5; // Penalty for using a hint
                    await gameService.updateGame(gameId, { players: game.players });
                    io.to(gameId).emit('players-updated', { players: game.players });
                }
            } catch (error) {
                console.error('Error getting hint:', error);
                socket.emit('error', { message: error.message });
            }
        });

        // Handle chat messages
        socket.on('send-message', ({ gameId, userId, username, message }) => {
            io.to(gameId).emit('new-message', {
                userId,
                username,
                message,
                timestamp: new Date()
            });
        });

        // Handle player disconnection
        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.id}`);

            const playerInfo = playerSockets.get(socket.id);
            if (playerInfo) {
                const { gameId, userId, username } = playerInfo;

                // Remove from tracking maps
                playerSockets.delete(socket.id);

                // Notify other players about disconnection
                io.to(gameId).emit('player-left', {
                    userId,
                    username
                });

                // Check if this was the last player
                const socketsInRoom = io.sockets.adapter.rooms.get(gameId);
                if (!socketsInRoom || socketsInRoom.size === 0) {
                    // Last player left, remove game from active games
                    activeGames.delete(gameId);
                }
            }
        });
    });

    return io;
};

export default setupSocketServer;