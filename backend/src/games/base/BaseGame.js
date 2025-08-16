class BaseGame {
  constructor(gameId, host, gameType) {
    this.gameId = gameId;
    this.host = host;
    this.gameType = gameType;
    this.players = new Map();
    this.gameState = 'waiting'; // waiting, playing, finished, paused
    this.maxPlayers = 2;
    this.startTime = null;
    this.endTime = null;
    this.winner = null;
    this.leaderboard = [];
    this.moveHistory = [];
    this.createdAt = Date.now();
  }

  addPlayer(playerId, playerName) {
    if (this.players.size >= this.maxPlayers) {
      return false;
    }
    
    this.players.set(playerId, {
      id: playerId,
      name: playerName,
      score: 0,
      isHost: playerId === this.host,
      joinTime: Date.now(),
      lastActive: Date.now()
    });
    
    return true;
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
    
    // If host leaves, assign new host
    if (playerId === this.host && this.players.size > 0) {
      this.host = this.players.keys().next().value;
      this.players.get(this.host).isHost = true;
    }
  }

  startGame() {
    if (this.gameState === 'waiting' && this.players.size >= 1) {
      this.gameState = 'playing';
      this.startTime = Date.now();
      return true;
    }
    return false;
  }

  pauseGame() {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
      return true;
    }
    return false;
  }

  resumeGame() {
    if (this.gameState === 'paused') {
      this.gameState = 'playing';
      return true;
    }
    return false;
  }

  endGame(winnerId = null) {
    this.gameState = 'finished';
    this.winner = winnerId;
    this.endTime = Date.now();
    this.updateLeaderboard();
  }

  updateLeaderboard() {
    this.leaderboard = Array.from(this.players.values())
      .map(player => ({
        id: player.id,
        name: player.name,
        score: player.score,
        timeElapsed: this.startTime ? Date.now() - this.startTime : 0
      }))
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return a.timeElapsed - b.timeElapsed;
      });
  }

  getGameState() {
    this.updateLeaderboard();
    
    return {
      gameId: this.gameId,
      gameType: this.gameType,
      host: this.host,
      maxPlayers: this.maxPlayers,
      players: Array.from(this.players.values()),
      gameState: this.gameState,
      winner: this.winner,
      startTime: this.startTime,
      endTime: this.endTime,
      leaderboard: this.leaderboard,
      totalMoves: this.moveHistory.length
    };
  }

  getPublicGameInfo() {
    return {
      gameId: this.gameId,
      gameType: this.gameType,
      host: this.players.get(this.host)?.name || 'Unknown',
      playerCount: this.players.size,
      maxPlayers: this.maxPlayers,
      gameState: this.gameState,
      startTime: this.startTime
    };
  }

  // Abstract methods to be implemented by specific games
  makeMove(playerId, moveData) {
    throw new Error('makeMove method must be implemented by specific game');
  }

  isValidMove(playerId, moveData) {
    throw new Error('isValidMove method must be implemented by specific game');
  }

  checkWinCondition() {
    throw new Error('checkWinCondition method must be implemented by specific game');
  }
}

module.exports = BaseGame;
