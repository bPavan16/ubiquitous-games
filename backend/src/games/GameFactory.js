import SudokuGame from './sudoku/SudokuGame.js';
import TicTacToeGame from './tictactoe/TicTacToeGame.js';

class GameFactory {
  static createGame(gameType, gameId, host, options = {}) {
    switch (gameType.toLowerCase()) {
      case 'sudoku':
        return new SudokuGame(gameId, host, options.difficulty);
      
      case 'tictactoe':
        return new TicTacToeGame(gameId, host);
      
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
      }
    ];
  }

  static isValidGameType(gameType) {
    const supportedTypes = this.getSupportedGameTypes().map(game => game.type);
    return supportedTypes.includes(gameType.toLowerCase());
  }
}

export default GameFactory;
