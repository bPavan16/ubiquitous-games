import Game from '../models/game.model.js';
import { generateSudoku } from '../utils/sudokuGenerator.js';

// @desc    Create a new game
// @route   POST /api/games
// @access  Private
export const createGame = async (req, res, next) => {
    try {
        const { name, difficulty, maxPlayers, timeLimit } = req.body;

        // Generate a new Sudoku puzzle
        const { puzzle, solution } = generateSudoku(difficulty);

        // Create game with the current user as creator
        const game = await Game.create({
            name,
            difficulty: difficulty || 'medium',
            maxPlayers: maxPlayers || 4,
            timeLimit: timeLimit || 0,
            board: puzzle,
            initialBoard: JSON.parse(JSON.stringify(puzzle)), // Deep copy
            solution,
            createdBy: req.user._id,
            players: [{
                userId: req.user._id,
                username: req.user.username,
                score: 0
            }]
        });

        res.status(201).json({
            success: true,
            data: game
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all games
// @route   GET /api/games
// @access  Public
export const getGames = async (req, res, next) => {
    try {
        // Filter options
        const filter = {};

        // Status filter
        if (req.query.status) {
            filter.status = req.query.status;
        }

        // Difficulty filter
        if (req.query.difficulty) {
            filter.difficulty = req.query.difficulty;
        }

        // Player availability filter (only return games with space)
        if (req.query.available === 'true') {
            filter.$expr = { $lt: [{ $size: "$players" }, "$maxPlayers"] };
        }

        // Find games and sort by creation date
        const games = await Game.find(filter)
            .sort({ createdAt: -1 })
            .populate('createdBy', 'username')
            .select('-solution'); // Don't send solutions to client

        res.status(200).json({
            success: true,
            count: games.length,
            data: games
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single game
// @route   GET /api/games/:id
// @access  Public
export const getGame = async (req, res, next) => {
    try {
        const game = await Game.findById(req.params.id)
            .populate('createdBy', 'username')
            .select('-solution'); // Don't send solution to client

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        res.status(200).json({
            success: true,
            data: game
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Join a game
// @route   PUT /api/games/:id/join
// @access  Private
export const joinGame = async (req, res, next) => {
    try {
        const game = await Game.findById(req.params.id);

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        // Check if game is full
        if (game.players.length >= game.maxPlayers) {
            return res.status(400).json({
                success: false,
                message: 'Game is full'
            });
        }

        // Check if user is already in the game
        if (game.players.some(player => player.userId.toString() === req.user._id.toString())) {
            return res.status(400).json({
                success: false,
                message: 'You have already joined this game'
            });
        }

        // Add player to game
        game.players.push({
            userId: req.user._id,
            username: req.user.username,
            score: 0
        });

        // If this is the first player and game was waiting, set it to active
        if (game.status === 'waiting' && game.players.length > 0) {
            game.status = 'active';
            game.startedAt = Date.now();
        }

        await game.save();

        res.status(200).json({
            success: true,
            data: game
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Make a move
// @route   PUT /api/games/:id/move
// @access  Private
export const makeMove = async (req, res, next) => {
    try {
        const { row, col, value } = req.body;

        const game = await Game.findById(req.params.id);

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        // Check if game is active
        if (game.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: `Game is ${game.status}, not active`
            });
        }

        // Check if user is in the game
        const playerIndex = game.players.findIndex(
            player => player.userId.toString() === req.user._id.toString()
        );

        if (playerIndex === -1) {
            return res.status(400).json({
                success: false,
                message: 'You are not a player in this game'
            });
        }

        // Validate move
        if (!game.isValidMove(row, col, value)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid move'
            });
        }

        // Update board
        game.board[row][col] = value;

        // Update player score
        game.players[playerIndex].score += 1;

        // Check if game is complete
        if (game.isComplete()) {
            game.status = 'completed';
            game.completedAt = Date.now();

            // Determine winner (player with highest score)
            const winnerPlayer = [...game.players].sort((a, b) => b.score - a.score)[0];
            game.winner = winnerPlayer.userId;
        }

        await game.save();

        res.status(200).json({
            success: true,
            data: game
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a hint
// @route   GET /api/games/:id/hint
// @access  Private
export const getHint = async (req, res, next) => {
    try {
        const { row, col } = req.query;

        if (!row || !col) {
            return res.status(400).json({
                success: false,
                message: 'Row and column are required'
            });
        }

        const game = await Game.findById(req.params.id);

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        // Check if user is in the game
        const playerIndex = game.players.findIndex(
            player => player.userId.toString() === req.user._id.toString()
        );

        if (playerIndex === -1) {
            return res.status(400).json({
                success: false,
                message: 'You are not a player in this game'
            });
        }

        // Get hint
        const hint = game.getHint(parseInt(row), parseInt(col));

        if (hint === null) {
            return res.status(400).json({
                success: false,
                message: 'Cannot get hint for this cell'
            });
        }

        // Update player score (penalty for using hint)
        game.players[playerIndex].score -= 0.5;
        await game.save();

        res.status(200).json({
            success: true,
            data: {
                hint,
                updatedScore: game.players[playerIndex].score
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete game
// @route   DELETE /api/games/:id
// @access  Private
export const deleteGame = async (req, res, next) => {
    try {
        const game = await Game.findById(req.params.id);

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        // Check if user is the creator
        if (game.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this game'
            });
        }

        await game.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get my games
// @route   GET /api/games/my-games
// @access  Private
export const getMyGames = async (req, res, next) => {
    try {
        const games = await Game.find({
            'players.userId': req.user._id
        })
            .sort({ createdAt: -1 })
            .select('-solution');

        res.status(200).json({
            success: true,
            count: games.length,
            data: games
        });
    } catch (error) {
        next(error);
    }
};