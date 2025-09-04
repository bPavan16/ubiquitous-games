import SudokuGame from './sudoku/SudokuGame.js';
import TicTacToeGame from './tictactoe/TicTacToeGame.js';
import BattleshipGame from './battleship/BattleshipGame.js';
import TypingGame from './typing/TypingGame.js';

class GameFactory {
  static createGame(gameType, gameId, host, options = {}) {
    switch (gameType.toLowerCase()) {
      case 'sudoku':
        return new SudokuGame(gameId, host, options.difficulty);
      
      case 'tictactoe':
        return new TicTacToeGame(gameId, host);
      
      case 'battleship':
        return new BattleshipGame(gameId, host);
      
      case 'typing':
        return new TypingGame(gameId, host, options.mode, options);
      
      default:
        throw new Error(`Unsupported game type: ${gameType}`);
    }
  }

  static getSupportedGameTypes() {
    return [
      {
        type: 'sudoku',
        name: 'Sudoku',
        description: 'Classic number puzzle game',
        minPlayers: 1,
        maxPlayers: 4,
        options: {
          difficulty: ['easy', 'medium', 'hard', 'expert']
        }
      },
      {
        type: 'tictactoe',
        name: 'Tic Tac Toe',
        description: 'Classic X and O strategy game',
        minPlayers: 2,
        maxPlayers: 2,
        options: {}
      },
      {
        type: 'battleship',
        name: 'Battleship',
        description: 'Naval strategy game - sink your opponent\'s fleet',
        minPlayers: 2,
        maxPlayers: 2,
        options: {}
      },
      {
        type: 'typing',
        name: 'Typing Race',
        description: 'Multiplayer typing speed competition',
        minPlayers: 2,
        maxPlayers: 8,
        options: {
          mode: ['text-race', 'word-sprint'],
          duration: [30, 60, 120],
          wordCount: [25, 50, 100]
        }
      }
    ];
  }

  static isValidGameType(gameType) {
    const supportedTypes = this.getSupportedGameTypes().map(game => game.type);
    return supportedTypes.includes(gameType.toLowerCase());
  }
}

export default GameFactory;
