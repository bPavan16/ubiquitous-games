// filepath: c:\Users\pavan\Desktop\ubiqutous-suduko\backend\src\models\Game.js
import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        default: 0
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const gameSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Game name is required'],
        trim: true
    },
    status: {
        type: String,
        enum: ['waiting', 'active', 'completed'],
        default: 'waiting'
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'expert'],
        default: 'medium'
    },
    // 9x9 Sudoku board represented as a 2D array
    board: {
        type: [[Number]],
        required: true,
        validate: {
            validator: function (board) {
                return board.length === 9 && board.every(row => row.length === 9);
            },
            message: 'Sudoku board must be 9x9'
        }
    },
    // The solved board, used for validation and hints
    solution: {
        type: [[Number]],
        required: true,
        validate: {
            validator: function (solution) {
                return solution.length === 9 && solution.every(row => row.length === 9);
            },
            message: 'Sudoku solution must be 9x9'
        }
    },
    // Initial board state to track original clues
    initialBoard: {
        type: [[Number]],
        required: true
    },
    players: {
        type: [playerSchema],
        default: []
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    maxPlayers: {
        type: Number,
        default: 4,
        min: [1, 'Game must allow at least 1 player'],
        max: [8, 'Game cannot have more than 8 players']
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    startedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    timeLimit: {
        type: Number, // Time limit in minutes
        default: 0 // 0 means no time limit
    }
}, {
    timestamps: true
});

// Index for finding active games
gameSchema.index({ status: 1, createdAt: -1 });

// Method to check if a move is valid
gameSchema.methods.isValidMove = function (row, col, value) {
    // Check if the cell was initially empty (not a clue)
    if (this.initialBoard[row][col] !== 0) {
        return false;
    }

    // Check if the value matches the solution
    return this.solution[row][col] === value;
};

// Method to get a hint for a position
gameSchema.methods.getHint = function (row, col) {
    // Only provide hints for non-clue cells
    if (this.initialBoard[row][col] !== 0) {
        return null;
    }

    return this.solution[row][col];
};

// Method to check if the game is complete
gameSchema.methods.isComplete = function () {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (this.board[i][j] !== this.solution[i][j]) {
                return false;
            }
        }
    }
    return true;
};

const Game = mongoose.model('Game', gameSchema);

export default Game;