const { v4: uuidv4 } = require('uuid');
const SudokuGame = require('../models/SudokuGame');

class SocketManager {
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

      // Make a move
      socket.on('makeMove', (data) => {
        this.handleMakeMove(socket, data);
      });

      // Use hint
      socket.on('useHint', (data) => {
        this.handleUseHint(socket, data);
      });

      // Check conflicts
      socket.on('checkConflicts', () => {
        this.handleCheckConflicts(socket);
      });

      // Get leaderboard
      socket.on('getLeaderboard', () => {
        this.handleGetLeaderboard(socket);
      });

      // Get list of available games
      socket.on('getAvailableGames', () => {
        this.handleGetAvailableGames(socket);
      });

      // Chat message
      socket.on('chatMessage', (data) => {
        this.handleChatMessage(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  handleCreateGame(socket, data) {
    try {
      const { playerName, difficulty = 'medium' } = data;
      
      if (!playerName || playerName.trim().length === 0) {
        socket.emit('error', { message: 'Player name is required' });
        return;
      }

      const gameId = uuidv4();
      const game = new SudokuGame(gameId, socket.id, difficulty);
      
      if (game.addPlayer(socket.id, playerName.trim())) {
        this.games.set(gameId, game);
        this.playerGameMap.set(socket.id, gameId);
        socket.join(gameId);
        
        socket.emit('gameCreated', {
          gameId: gameId,
          gameState: game.getGameState()
        });

        console.log(`Game ${gameId} created by ${playerName}`);
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
        
        socket.emit('gameJoined', {
          gameState: game.getGameState()
        });
        
        // Notify other players
        socket.to(gameId).emit('playerJoined', {
          gameState: game.getGameState()
        });

        console.log(`Player ${playerName} joined game ${gameId}`);
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
        console.log(`Game ${gameId} started`);
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
      const { row, col, value } = data;
      const gameId = this.playerGameMap.get(socket.id);
      const game = this.games.get(gameId);
      
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      // Validate input
      if (row < 0 || row > 8 || col < 0 || col > 8 || value < 0 || value > 9) {
        socket.emit('error', { message: 'Invalid move coordinates or value' });
        return;
      }

      const result = game.updatePlayerProgress(socket.id, row, col, value);
      
      if (result.success) {
        // Broadcast move to all players in the game
        this.io.to(gameId).emit('moveUpdate', {
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

        // Check if game is finished
        if (game.gameState === 'finished') {
          this.io.to(gameId).emit('gameFinished', {
            winner: game.winner,
            winnerName: game.players.get(game.winner).name,
            gameState: game.getGameState()
          });
          console.log(`Game ${gameId} finished, winner: ${game.players.get(game.winner).name}`);
        }
      } else {
        socket.emit('invalidMove', { 
          row, 
          col, 
          value, 
          reason: result.reason 
        });
      }
    } catch (error) {
      console.error('Error making move:', error);
      socket.emit('error', { message: 'Internal server error' });
    }
  }

  handleUseHint(socket, data) {
    try {
      const { row, col } = data;
      const gameId = this.playerGameMap.get(socket.id);
      const game = this.games.get(gameId);
      
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
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

        // Notify other players that a hint was used
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
      
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      const conflicts = game.checkConflicts(socket.id);
      socket.emit('conflictsChecked', { conflicts });
    } catch (error) {
      console.error('Error checking conflicts:', error);
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

  handleGetAvailableGames(socket) {
    try {
      const availableGames = Array.from(this.games.values())
        .filter(game => game.gameState === 'waiting' && game.players.size < game.maxPlayers)
        .map(game => game.getPublicGameInfo());
      
      socket.emit('availableGames', availableGames);
    } catch (error) {
      console.error('Error getting available games:', error);
      socket.emit('error', { message: 'Internal server error' });
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
            this.games.delete(gameId);
            console.log(`Game ${gameId} deleted - no players remaining`);
          } else {
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
    return {
      totalGames: this.games.size,
      totalPlayers: this.playerGameMap.size,
      activeGames: Array.from(this.games.values()).filter(game => game.gameState === 'playing').length,
      waitingGames: Array.from(this.games.values()).filter(game => game.gameState === 'waiting').length
    };
  }

  cleanupInactiveGames() {
    const now = Date.now();
    const INACTIVE_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    for (const [gameId, game] of this.games.entries()) {
      const allPlayersInactive = Array.from(game.players.values()).every(
        player => now - player.lastActive > INACTIVE_TIMEOUT
      );

      if (allPlayersInactive && game.gameState !== 'finished') {
        console.log(`Cleaning up inactive game: ${gameId}`);
        
        // Remove player mappings
        for (const playerId of game.players.keys()) {
          this.playerGameMap.delete(playerId);
        }
        
        this.games.delete(gameId);
      }
    }
  }
}

module.exports = SocketManager;
