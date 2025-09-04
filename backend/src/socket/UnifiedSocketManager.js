import { v4 as uuidv4 } from 'uuid';
import GameFactory from '../games/GameFactory.js';

class UnifiedSocketManager {
    constructor(io) {
        this.io = io;
        this.games = new Map();
        this.playerGameMap = new Map();
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log('User connected:', socket.id);

            // Create a new game
            socket.on('createGame', (data) => {
                this.handleCreateGame(socket, data);
            });

            // Join an existing game
            socket.on('joinGame', (data) => {
                this.handleJoinGame(socket, data);
            });

            // Start the game
            socket.on('startGame', () => {
                this.handleStartGame(socket);
            });

            // Pause the game
            socket.on('pauseGame', () => {
                this.handlePauseGame(socket);
            });

            // Resume the game
            socket.on('resumeGame', () => {
                this.handleResumeGame(socket);
            });

            // Make a move (unified for all games)
            socket.on('makeMove', (data) => {
                this.handleMakeMove(socket, data);
            });

            // Sudoku-specific events
            socket.on('useHint', (data) => {
                this.handleUseHint(socket, data);
            });

            socket.on('checkConflicts', () => {
                this.handleCheckConflicts(socket);
            });

            // Tic Tac Toe-specific events
            socket.on('resetBoard', () => {
                this.handleResetBoard(socket);
            });

            // Battleship-specific events
            socket.on('placeShip', (data) => {
                this.handlePlaceShip(socket, data);
            });

            socket.on('fireShot', (data) => {
                this.handleFireShot(socket, data);
            });

            socket.on('resetBattleshipGame', () => {
                this.handleResetBattleshipGame(socket);
            });

            socket.on('getOpponentBoard', () => {
                this.handleGetOpponentBoard(socket);
            });

            // Typing-specific events
            socket.on('updateTypingProgress', (data) => {
                this.handleUpdateTypingProgress(socket, data);
            });

            socket.on('getTypingGameContent', () => {
                this.handleGetTypingGameContent(socket);
            });

            // Common events
            socket.on('getLeaderboard', () => {
                this.handleGetLeaderboard(socket);
            });

            socket.on('getAvailableGames', (data) => {
                this.handleGetAvailableGames(socket, data);
            });

            socket.on('getSupportedGameTypes', () => {
                this.handleGetSupportedGameTypes(socket);
            });

            socket.on('chatMessage', (data) => {
                this.handleChatMessage(socket, data);
            });

            socket.on('leaveGame', () => {
                this.handleLeaveGame(socket);
            });

            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });
        });
    }

    handleCreateGame(socket, data) {
        try {
            const { playerName, gameType, difficulty, mode, duration, wordCount } = data;

            if (!playerName || playerName.trim().length === 0) {
                socket.emit('error', { message: 'Player name is required' });
                return;
            }

            if (!GameFactory.isValidGameType(gameType)) {
                socket.emit('error', { message: 'Invalid game type' });
                return;
            }

            const gameId = uuidv4();
            const options = { difficulty, mode, duration, wordCount };
            const game = GameFactory.createGame(gameType, gameId, socket.id, options);

            if (game.addPlayer(socket.id, playerName.trim())) {
                this.games.set(gameId, game);
                this.playerGameMap.set(socket.id, gameId);
                socket.join(gameId);

                socket.emit('gameCreated', {
                    gameId: gameId,
                    gameType: gameType,
                    gameState: game.getGameState()
                });

                console.log(`${gameType} game ${gameId} created by ${playerName}`);
            } else {
                socket.emit('error', { message: 'Failed to create game' });
            }
        } catch (error) {
            console.error('Error creating game:', error);
            socket.emit('error', { message: 'Internal server error' });
        }
    }

    handleJoinGame(socket, data) {
        try {
            const { gameId, playerName } = data;

            if (!playerName || playerName.trim().length === 0) {
                socket.emit('error', { message: 'Player name is required' });
                return;
            }

            const game = this.games.get(gameId);

            if (!game) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }

            if (game.gameState !== 'waiting') {
                socket.emit('error', { message: 'Game already in progress' });
                return;
            }

            if (game.addPlayer(socket.id, playerName.trim())) {
                this.playerGameMap.set(socket.id, gameId);
                socket.join(gameId);

                // Clear empty timer if someone joins an empty game
                if (game.emptyAt) {
                    delete game.emptyAt;
                    console.log(`Game ${gameId} no longer empty - cleared deletion timer`);
                }

                socket.emit('gameJoined', {
                    gameState: game.getGameState()
                });

                socket.to(gameId).emit('playerJoined', {
                    gameState: game.getGameState()
                });

                console.log(`Player ${playerName} joined ${game.gameType} game ${gameId}`);
            } else {
                socket.emit('error', { message: 'Game is full' });
            }
        } catch (error) {
            console.error('Error joining game:', error);
            socket.emit('error', { message: 'Internal server error' });
        }
    }

    handleStartGame(socket) {
        try {
            const gameId = this.playerGameMap.get(socket.id);
            const game = this.games.get(gameId);

            if (!game || game.host !== socket.id) {
                socket.emit('error', { message: 'Only host can start the game' });
                return;
            }

            if (game.startGame()) {
                this.io.to(gameId).emit('gameStarted', {
                    gameState: game.getGameState()
                });
                console.log(`${game.gameType} game ${gameId} started`);
            } else {
                socket.emit('error', { message: 'Cannot start game' });
            }
        } catch (error) {
            console.error('Error starting game:', error);
            socket.emit('error', { message: 'Internal server error' });
        }
    }

    handlePauseGame(socket) {
        try {
            const gameId = this.playerGameMap.get(socket.id);
            const game = this.games.get(gameId);

            if (!game || game.host !== socket.id) {
                socket.emit('error', { message: 'Only host can pause the game' });
                return;
            }

            if (game.pauseGame()) {
                this.io.to(gameId).emit('gamePaused', {
                    gameState: game.getGameState()
                });
            }
        } catch (error) {
            console.error('Error pausing game:', error);
            socket.emit('error', { message: 'Internal server error' });
        }
    }

    handleResumeGame(socket) {
        try {
            const gameId = this.playerGameMap.get(socket.id);
            const game = this.games.get(gameId);

            if (!game || game.host !== socket.id) {
                socket.emit('error', { message: 'Only host can resume the game' });
                return;
            }

            if (game.resumeGame()) {
                this.io.to(gameId).emit('gameResumed', {
                    gameState: game.getGameState()
                });
            }
        } catch (error) {
            console.error('Error resuming game:', error);
            socket.emit('error', { message: 'Internal server error' });
        }
    }

    handleMakeMove(socket, data) {
        try {
            const gameId = this.playerGameMap.get(socket.id);
            const game = this.games.get(gameId);

            if (!game) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }

            let result;

            // Handle different game types
            if (game.gameType === 'sudoku') {
                result = this.handleSudokuMove(socket, game, data);
            } else if (game.gameType === 'tictactoe') {
                result = this.handleTicTacToeMove(socket, game, data);
            } else if (game.gameType === 'battleship') {
                result = this.handleBattleshipMove(socket, game, data);
            } else if (game.gameType === 'typing') {
                result = this.handleTypingMove(socket, game, data);
            } else {
                socket.emit('error', { message: 'Unsupported game type' });
                return;
            }

            // Update player's last active time
            const player = game.players.get(socket.id);
            if (player) {
                player.lastActive = Date.now();
            }

        } catch (error) {
            console.error('Error making move:', error);
            socket.emit('error', { message: 'Internal server error' });
        }
    }

    handleSudokuMove(socket, game, data) {
        const { row, col, value } = data;

        if (row < 0 || row > 8 || col < 0 || col > 8 || value < 0 || value > 9) {
            socket.emit('error', { message: 'Invalid move coordinates or value' });
            return;
        }

        const result = game.updatePlayerProgress(socket.id, row, col, value);

        if (result.success) {
            this.io.to(game.gameId).emit('moveUpdate', {
                playerId: socket.id,
                playerName: game.players.get(socket.id).name,
                row,
                col,
                value,
                isCorrect: result.isCorrect,
                score: result.score,
                completion: result.completion,
                gameState: game.getGameState()
            });

            if (game.gameState === 'finished') {
                this.io.to(game.gameId).emit('gameFinished', {
                    winner: game.winner,
                    winnerName: game.players.get(game.winner).name,
                    gameState: game.getGameState()
                });
                console.log(`Sudoku game ${game.gameId} finished, winner: ${game.players.get(game.winner).name}`);
            }
        } else {
            socket.emit('invalidMove', {
                row,
                col,
                value,
                reason: result.reason
            });
        }
    }

    handleTicTacToeMove(socket, game, data) {
        const { row, col } = data;

        if (row < 0 || row > 2 || col < 0 || col > 2) {
            socket.emit('error', { message: 'Invalid move coordinates' });
            return;
        }

        const result = game.makeMove(socket.id, { row, col });

        if (result.success) {
            this.io.to(game.gameId).emit('ticTacToeMove', {
                playerId: socket.id,
                playerName: game.players.get(socket.id).name,
                symbol: game.players.get(socket.id).symbol,
                row,
                col,
                gameResult: result.gameResult,
                nextPlayer: result.nextPlayer,
                gameState: game.getGameState()
            });

            if (result.gameResult.gameOver) {
                const winnerName = result.gameResult.winner ?
                    game.players.get(result.gameResult.winner).name : null;

                this.io.to(game.gameId).emit('gameFinished', {
                    winner: result.gameResult.winner,
                    winnerName,
                    winType: result.gameResult.winType,
                    winLine: result.gameResult.winLine,
                    gameState: game.getGameState()
                });

                console.log(`Tic Tac Toe game ${game.gameId} finished, winner: ${winnerName || 'Draw'}`);
            }
        } else {
            socket.emit('invalidMove', {
                row,
                col,
                reason: result.reason
            });
        }
    }

    handleBattleshipMove(socket, game, data) {
        const { targetRow, targetCol } = data;

        if (targetRow < 0 || targetRow >= game.boardSize || targetCol < 0 || targetCol >= game.boardSize) {
            socket.emit('error', { message: 'Invalid shot coordinates' });
            return;
        }

        const result = game.makeMove(socket.id, { targetRow, targetCol });

        if (result.success) {
            this.io.to(game.gameId).emit('shotFired', {
                playerId: socket.id,
                playerName: game.players.get(socket.id).name,
                targetRow,
                targetCol,
                hit: result.hit,
                shipHit: result.shipHit,
                shipDestroyed: result.shipDestroyed,
                continuesTurn: result.continuesTurn,
                nextPlayer: result.nextPlayer,
                gameState: game.getGameState()
            });

            if (result.gameResult.gameOver) {
                const winnerName = result.gameResult.winner ?
                    game.players.get(result.gameResult.winner).name : null;

                this.io.to(game.gameId).emit('gameFinished', {
                    winner: result.gameResult.winner,
                    winnerName,
                    reason: result.gameResult.reason,
                    gameState: game.getGameState()
                });

                console.log(`Battleship game ${game.gameId} finished, winner: ${winnerName}`);
            }
        } else {
            socket.emit('invalidMove', {
                targetRow,
                targetCol,
                reason: result.reason
            });
        }
    }

    handleTypingMove(socket, game, data) {
        // Expect frontend to send calculated progress data
        const { wpm, accuracy, progress, position, isFinished } = data;

        if (typeof wmp === 'undefined' || typeof accuracy === 'undefined' || 
            typeof progress === 'undefined' || typeof position === 'undefined') {
            socket.emit('error', { message: 'Invalid progress data' });
            return;
        }

        const result = game.updatePlayerProgress(socket.id, {
            wpm: wpm,
            accuracy: accuracy,
            progress: progress,
            position: position,
            isFinished: isFinished || false
        });

        if (result.success) {
            // Broadcast leaderboard update to all players
            this.io.to(game.gameId).emit('leaderboardUpdate', {
                leaderboard: result.leaderboard,
                gameState: result.gameState
            });

            // Check if game finished
            if (game.isFinished) {
                this.io.to(game.gameId).emit('gameFinished', {
                    winner: game.winner,
                    winnerName: game.players.get(game.winner)?.name,
                    leaderboard: result.leaderboard,
                    gameState: result.gameState
                });
                console.log(`Typing game ${game.gameId} finished, winner: ${game.players.get(game.winner)?.name}`);
            }
        } else {
            socket.emit('error', { message: result.message });
        }
    }

    handleUpdateTypingProgress(socket, data) {
        // This is an alias for the typing move handler
        const gameId = this.playerGameMap.get(socket.id);
        const game = this.games.get(gameId);

        if (!game || game.gameType !== 'typing') {
            socket.emit('error', { message: 'Invalid game or game type' });
            return;
        }

        this.handleTypingMove(socket, game, data);
    }

    handleGetTypingGameContent(socket) {
        try {
            const gameId = this.playerGameMap.get(socket.id);
            const game = this.games.get(gameId);

            if (!game || game.gameType !== 'typing') {
                socket.emit('error', { message: 'Invalid game or game type' });
                return;
            }

            socket.emit('typingGameContent', {
                text: game.currentText,
                words: game.words,
                mode: game.mode,
                duration: game.duration,
                wordCount: game.wordCount
            });
        } catch (error) {
            console.error('Error getting typing game content:', error);
            socket.emit('error', { message: 'Internal server error' });
        }
    }

    handlePlaceShip(socket, data) {
        try {
            const gameId = this.playerGameMap.get(socket.id);
            const game = this.games.get(gameId);

            if (!game || game.gameType !== 'battleship') {
                console.log(`Invalid game or game type for ship placement by ${socket.id}`);
                socket.emit('error', { message: 'Invalid game or game type' });
                return;
            }

            const { shipName, startRow, startCol, orientation } = data;
            console.log(`Ship placement attempt:`, { 
                playerId: socket.id, 
                shipName, 
                startRow, 
                startCol, 
                orientation 
            });

            if (startRow < 0 || startRow >= game.boardSize || 
                startCol < 0 || startCol >= game.boardSize) {
                console.log(`Invalid ship coordinates: row=${startRow}, col=${startCol}`);
                socket.emit('error', { message: 'Invalid ship coordinates' });
                return;
            }

            if (!['horizontal', 'vertical'].includes(orientation)) {
                console.log(`Invalid ship orientation: ${orientation}`);
                socket.emit('error', { message: 'Invalid ship orientation' });
                return;
            }

            const result = game.placeShip(socket.id, { shipName, startRow, startCol, orientation });
            console.log(`Ship placement result:`, result);

            if (result.success) {
                socket.emit('shipPlaced', {
                    shipName,
                    startRow,
                    startCol,
                    orientation,
                    shipsRemaining: result.shipsRemaining,
                    isReady: result.isReady,
                    gameState: game.getGameState()
                });

                // Notify other players that this player placed a ship (without revealing position)
                socket.to(gameId).emit('playerShipPlaced', {
                    playerId: socket.id,
                    playerName: game.players.get(socket.id).name,
                    shipName,
                    isReady: result.isReady,
                    gameState: game.getGameState()
                });

                // If game started (both players ready), notify all players
                if (game.gamePhase === 'playing') {
                    this.io.to(gameId).emit('gameStarted', {
                        gameState: game.getGameState()
                    });
                    console.log(`Battleship battle phase started for game ${gameId}`);
                }
            } else {
                console.log(`Ship placement failed: ${result.reason}`);
                socket.emit('error', { message: result.reason });
            }
        } catch (error) {
            console.error('Error placing ship:', error);
            socket.emit('error', { message: 'Internal server error' });
        }
    }

    handleFireShot(socket, data) {
        // This is handled by makeMove for battleship
        this.handleMakeMove(socket, data);
    }

    handleResetBattleshipGame(socket) {
        try {
            const gameId = this.playerGameMap.get(socket.id);
            const game = this.games.get(gameId);

            if (!game || game.gameType !== 'battleship' || game.host !== socket.id) {
                socket.emit('error', { message: 'Only host can reset Battleship game' });
                return;
            }

            game.resetGame();

            this.io.to(gameId).emit('battleshipGameReset', {
                gameState: game.getGameState()
            });
        } catch (error) {
            console.error('Error resetting Battleship game:', error);
            socket.emit('error', { message: 'Internal server error' });
        }
    }

    handleGetOpponentBoard(socket) {
        try {
            const gameId = this.playerGameMap.get(socket.id);
            const game = this.games.get(gameId);

            if (!game || game.gameType !== 'battleship') {
                socket.emit('error', { message: 'Invalid game or game type' });
                return;
            }

            const opponentBoard = game.getOpponentBoardState(socket.id);
            socket.emit('opponentBoardState', { opponentBoard });
        } catch (error) {
            console.error('Error getting opponent board:', error);
            socket.emit('error', { message: 'Internal server error' });
        }
    }

    handleUseHint(socket, data) {
        try {
            const { row, col } = data;
            const gameId = this.playerGameMap.get(socket.id);
            const game = this.games.get(gameId);

            if (!game || game.gameType !== 'sudoku') {
                socket.emit('error', { message: 'Invalid game or game type' });
                return;
            }

            const result = game.useHint(socket.id, row, col);

            if (result.success) {
                socket.emit('hintUsed', {
                    row,
                    col,
                    value: result.value,
                    hintsLeft: result.hintsLeft,
                    score: result.score
                });

                socket.to(gameId).emit('playerUsedHint', {
                    playerId: socket.id,
                    playerName: game.players.get(socket.id).name,
                    hintsLeft: result.hintsLeft
                });
            } else {
                socket.emit('error', { message: result.reason });
            }
        } catch (error) {
            console.error('Error using hint:', error);
            socket.emit('error', { message: 'Internal server error' });
        }
    }

    handleCheckConflicts(socket) {
        try {
            const gameId = this.playerGameMap.get(socket.id);
            const game = this.games.get(gameId);

            if (!game || game.gameType !== 'sudoku') {
                socket.emit('error', { message: 'Invalid game or game type' });
                return;
            }

            const conflicts = game.checkConflicts(socket.id);
            socket.emit('conflictsChecked', { conflicts });
        } catch (error) {
            console.error('Error checking conflicts:', error);
            socket.emit('error', { message: 'Internal server error' });
        }
    }

    handleResetBoard(socket) {
        try {
            const gameId = this.playerGameMap.get(socket.id);
            const game = this.games.get(gameId);

            if (!game || game.gameType !== 'tictactoe' || game.host !== socket.id) {
                socket.emit('error', { message: 'Only host can reset Tic Tac Toe board' });
                return;
            }

            game.resetBoard();

            this.io.to(gameId).emit('boardReset', {
                gameState: game.getGameState()
            });
        } catch (error) {
            console.error('Error resetting board:', error);
            socket.emit('error', { message: 'Internal server error' });
        }
    }

    handleGetLeaderboard(socket) {
        try {
            const gameId = this.playerGameMap.get(socket.id);
            const game = this.games.get(gameId);

            if (!game) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }

            game.updateLeaderboard();
            socket.emit('leaderboardUpdate', {
                leaderboard: game.leaderboard
            });
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            socket.emit('error', { message: 'Internal server error' });
        }
    }

    handleGetAvailableGames(socket, data) {
        try {
            const { gameType } = data || {};

            let availableGames = Array.from(this.games.values())
                .filter(game => {
                    // Only include waiting games with space that aren't marked for deletion
                    return game.gameState === 'waiting' && 
                           game.players.size < game.maxPlayers &&
                           !game.emptyAt; // Exclude games marked for deletion
                });

            if (gameType) {
                availableGames = availableGames.filter(game => game.gameType === gameType);
            }

            const gameList = availableGames.map(game => game.getPublicGameInfo());

            socket.emit('availableGames', gameList);
        } catch (error) {
            console.error('Error getting available games:', error);
            socket.emit('error', { message: 'Internal server error' });
        }
    }

    handleGetSupportedGameTypes(socket) {
        try {
            socket.emit('supportedGameTypes', GameFactory.getSupportedGameTypes());
        } catch (error) {
            console.error('Error getting supported game types:', error);
            socket.emit('error', { message: 'Internal server error' });
        }
    }

    handleLeaveGame(socket) {
        try {
            const gameId = this.playerGameMap.get(socket.id);
            if (!gameId) return;

            const game = this.games.get(gameId);
            if (!game) return;

            const player = game.players.get(socket.id);
            if (!player) return;

            // Remove player from game
            game.removePlayer(socket.id);
            this.playerGameMap.delete(socket.id);
            socket.leave(gameId);

            // Notify other players that this player left
            socket.to(gameId).emit('playerLeft', {
                gameState: game.getGameState(),
                playerName: player.name
            });

            // If no players left, delete the game
            if (game.players.size === 0) {
                this.games.delete(gameId);
            } else {
                // If the leaving player was the host, assign new host
                if (player.isHost && game.players.size > 0) {
                    const firstPlayer = game.players.values().next().value;
                    if (firstPlayer) {
                        firstPlayer.isHost = true;
                        socket.to(gameId).emit('hostChanged', {
                            gameState: game.getGameState(),
                            newHost: firstPlayer.name
                        });
                    }
                }
            }

            // Notify the leaving player that they successfully left
            socket.emit('gameLeft', { success: true });

        } catch (error) {
            console.error('Error handling leave game:', error);
            socket.emit('error', { message: 'Failed to leave game' });
        }
    }

    handleChatMessage(socket, data) {
        try {
            const { message } = data;
            const gameId = this.playerGameMap.get(socket.id);
            const game = this.games.get(gameId);

            if (!game || !message || message.trim().length === 0) {
                return;
            }

            const player = game.players.get(socket.id);
            if (!player) return;

            const chatMessage = {
                playerId: socket.id,
                playerName: player.name,
                message: message.trim(),
                timestamp: Date.now()
            };

            this.io.to(gameId).emit('chatMessage', chatMessage);
        } catch (error) {
            console.error('Error handling chat message:', error);
        }
    }

    handleDisconnect(socket) {
        try {
            console.log('User disconnected:', socket.id);

            const gameId = this.playerGameMap.get(socket.id);
            if (gameId) {
                const game = this.games.get(gameId);
                if (game) {
                    const player = game.players.get(socket.id);
                    const playerName = player ? player.name : 'Unknown';

                    game.removePlayer(socket.id);

                    if (game.players.size === 0) {
                        // Don't delete immediately, mark for deletion after grace period
                        game.emptyAt = Date.now();
                        console.log(`${game.gameType} game ${gameId} marked for deletion - no players remaining`);
                        
                        // Delete after 5 minutes of being empty
                        setTimeout(() => {
                            const currentGame = this.games.get(gameId);
                            if (currentGame && currentGame.players.size === 0) {
                                this.games.delete(gameId);
                                console.log(`${game.gameType} game ${gameId} deleted after grace period`);
                            }
                        }, 5 * 60 * 1000); // 5 minutes
                    } else {
                        // Clear the empty timer if players rejoin
                        delete game.emptyAt;
                        
                        socket.to(gameId).emit('playerLeft', {
                            playerId: socket.id,
                            playerName: playerName,
                            gameState: game.getGameState()
                        });
                    }
                }
                this.playerGameMap.delete(socket.id);
            }
        } catch (error) {
            console.error('Error handling disconnect:', error);
        }
    }

    // Utility methods
    getGameStats() {
        const stats = {
            totalGames: this.games.size,
            totalPlayers: this.playerGameMap.size,
            activeGames: Array.from(this.games.values()).filter(game => game.gameState === 'playing').length,
            waitingGames: Array.from(this.games.values()).filter(game => game.gameState === 'waiting').length,
            gamesByType: {}
        };

        // Count games by type
        for (const game of this.games.values()) {
            if (!stats.gamesByType[game.gameType]) {
                stats.gamesByType[game.gameType] = {
                    total: 0,
                    waiting: 0,
                    playing: 0,
                    finished: 0
                };
            }

            stats.gamesByType[game.gameType].total++;
            stats.gamesByType[game.gameType][game.gameState]++;
        }

        return stats;
    }

    cleanupInactiveGames() {
        const now = Date.now();
        const INACTIVE_TIMEOUT = 30 * 60 * 1000; // 30 minutes

        for (const [gameId, game] of this.games.entries()) {
            const allPlayersInactive = Array.from(game.players.values()).every(
                player => now - player.lastActive > INACTIVE_TIMEOUT
            );

            if (allPlayersInactive && game.gameState !== 'finished') {
                console.log(`Cleaning up inactive ${game.gameType} game: ${gameId}`);

                for (const playerId of game.players.keys()) {
                    this.playerGameMap.delete(playerId);
                }

                this.games.delete(gameId);
            }
        }
    }
}

export default UnifiedSocketManager;
