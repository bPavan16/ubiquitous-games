const BaseGame = require('../base/BaseGame');
const SudokuGenerator = require('./sudokuGenerator');

class SudokuGame extends BaseGame {
  constructor(gameId, host, difficulty = 'medium') {
    super(gameId, host, 'sudoku');
    this.difficulty = difficulty;
    this.maxPlayers = 4;
    
    const { puzzle, solution } = SudokuGenerator.generatePuzzle(difficulty);
    this.puzzle = puzzle;
    this.solution = solution;
  }

  addPlayer(playerId, playerName) {
    if (this.players.size >= this.maxPlayers) {
      return false;
    }
    
    this.players.set(playerId, {
      id: playerId,
      name: playerName,
      progress: [...this.puzzle.map(row => [...row])],
      score: 0,
      correctMoves: 0,
      incorrectMoves: 0,
      hints: 3,
      isHost: playerId === this.host,
      joinTime: Date.now(),
      lastActive: Date.now()
    });
    
    return true;
  }

  updatePlayerProgress(playerId, row, col, value) {
    const player = this.players.get(playerId);
    if (!player || this.gameState !== 'playing') return { success: false, reason: 'Invalid game state' };

    // Only allow moves on empty cells from original puzzle
    if (this.puzzle[row][col] !== 0) {
      return { success: false, reason: 'Cannot modify preset cells' };
    }

    // Store previous value for undo functionality
    const previousValue = player.progress[row][col];
    player.progress[row][col] = value;
    player.lastActive = Date.now();
    
    // Record move in history
    this.moveHistory.push({
      playerId,
      playerName: player.name,
      row,
      col,
      value,
      previousValue,
      timestamp: Date.now()
    });

    // Check if move is correct
    const isCorrect = value === this.solution[row][col] || value === 0;
    
    if (isCorrect && value !== 0) {
      player.score += 10;
      player.correctMoves++;
    } else if (value !== 0) {
      player.score = Math.max(0, player.score - 2);
      player.incorrectMoves++;
    }

    // Check if player completed the puzzle
    if (SudokuGenerator.isPuzzleComplete(player.progress)) {
      this.gameState = 'finished';
      this.winner = playerId;
      this.endTime = Date.now();
      this.updateLeaderboard();
    }

    return { 
      success: true, 
      isCorrect, 
      score: player.score,
      completion: this.getPlayerCompletion(playerId)
    };
  }

  getPlayerCompletion(playerId) {
    const player = this.players.get(playerId);
    if (!player) return 0;

    let filledCells = 0;
    let totalEmptyCells = 0;

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (this.puzzle[i][j] === 0) {
          totalEmptyCells++;
          if (player.progress[i][j] !== 0) {
            filledCells++;
          }
        }
      }
    }

    return totalEmptyCells > 0 ? Math.round((filledCells / totalEmptyCells) * 100) : 100;
  }

  useHint(playerId, row, col) {
    const player = this.players.get(playerId);
    if (!player || player.hints <= 0 || this.gameState !== 'playing') {
      return { success: false, reason: 'No hints available or invalid state' };
    }

    if (this.puzzle[row][col] !== 0) {
      return { success: false, reason: 'Cannot get hint for preset cells' };
    }

    if (player.progress[row][col] === this.solution[row][col]) {
      return { success: false, reason: 'Cell already has correct value' };
    }

    player.hints--;
    player.progress[row][col] = this.solution[row][col];
    player.score = Math.max(0, player.score - 5); // Penalty for using hint

    return {
      success: true,
      value: this.solution[row][col],
      hintsLeft: player.hints,
      score: player.score
    };
  }

  checkConflicts(playerId) {
    const player = this.players.get(playerId);
    if (!player) return [];

    const conflicts = [];
    const grid = player.progress;

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] !== 0 && grid[i][j] !== this.solution[i][j]) {
          conflicts.push({ row: i, col: j, value: grid[i][j] });
        }
      }
    }

    return conflicts;
  }

  updateLeaderboard() {
    this.leaderboard = Array.from(this.players.values())
      .map(player => ({
        id: player.id,
        name: player.name,
        score: player.score,
        correctMoves: player.correctMoves,
        incorrectMoves: player.incorrectMoves,
        completion: this.getPlayerCompletion(player.id),
        timeElapsed: this.startTime ? Date.now() - this.startTime : 0
      }))
      .sort((a, b) => {
        // Sort by completion first, then by score, then by time
        if (a.completion !== b.completion) return b.completion - a.completion;
        if (a.score !== b.score) return b.score - a.score;
        return a.timeElapsed - b.timeElapsed;
      });
  }

  getGameState() {
    const baseState = super.getGameState();
    
    return {
      ...baseState,
      puzzle: this.puzzle,
      difficulty: this.difficulty,
      players: Array.from(this.players.values()).map(player => ({
        ...player,
        completion: this.getPlayerCompletion(player.id)
      }))
    };
  }

  getPublicGameInfo() {
    const baseInfo = super.getPublicGameInfo();
    
    return {
      ...baseInfo,
      difficulty: this.difficulty
    };
  }
}

module.exports = SudokuGame;
