import Game from '../models/game.model.js';

const gameService = {
    /**
     * Get a game by ID
     * @param {string} gameId - The game ID
     * @returns {Promise<Object>} - Game data
     */
    async getGameById(gameId) {
        try {
            const game = await Game.findById(gameId);
            if (!game) {
                throw new Error('Game not found');
            }
            return game;
        } catch (error) {
            console.error('Error in getGameById:', error);
            throw error;
        }
    },

    /**
     * Update game data
     * @param {string} gameId - The game ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} - Updated game
     */
    async updateGame(gameId, updateData) {
        try {
            const game = await Game.findByIdAndUpdate(
                gameId,
                updateData,
                { new: true, runValidators: true }
            );
            
            if (!game) {
                throw new Error('Game not found');
            }
            
            return game;
        } catch (error) {
            console.error('Error in updateGame:', error);
            throw error;
        }
    },

    /**
     * Validate if a move is correct
     * @param {string} gameId - The game ID
     * @param {number} position - Board position (0-80)
     * @param {number} value - Value to place (1-9, or 0 to clear)
     * @returns {Promise<boolean>} - Whether the move is valid
     */
    async validateMove(gameId, position, value) {
        try {
            const game = await this.getGameById(gameId);
            
            // Convert position to row, col
            const row = Math.floor(position / 9);
            const col = position % 9;
            
            // Check if this is a clue cell (can't modify)
            if (game.initialBoard[row][col] !== 0) {
                return false;
            }
            
            // If clearing the cell, always valid
            if (value === 0) {
                return true;
            }
            
            // Check if the move matches the solution
            return game.solution[row][col] === value;
        } catch (error) {
            console.error('Error in validateMove:', error);
            throw error;
        }
    },

    /**
     * Check if the game is complete
     * @param {string} gameId - The game ID
     * @returns {Promise<boolean>} - Whether the game is complete
     */
    async checkGameCompletion(gameId) {
        try {
            const game = await this.getGameById(gameId);
            
            // Check each cell
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    // If any cell doesn't match the solution, game is not complete
                    if (game.board[row][col] !== game.solution[row][col]) {
                        return false;
                    }
                }
            }
            
            // If we get here, all cells match the solution
            // Update game status to completed
            await this.updateGame(gameId, { 
                status: 'completed',
                completedAt: new Date()
            });
            
            return true;
        } catch (error) {
            console.error('Error in checkGameCompletion:', error);
            throw error;
        }
    },

    /**
     * Get a hint for a specific position
     * @param {string} gameId - The game ID
     * @param {number} position - Board position (0-80)
     * @returns {Promise<number>} - The correct value for the position
     */
    async getHint(gameId, position) {
        try {
            const game = await this.getGameById(gameId);
            
            // Convert position to row, col
            const row = Math.floor(position / 9);
            const col = position % 9;
            
            // Check if this is a clue cell
            if (game.initialBoard[row][col] !== 0) {
                throw new Error('Cannot get hint for a clue cell');
            }
            
            // Return the solution value
            return game.solution[row][col];
        } catch (error) {
            console.error('Error in getHint:', error);
            throw error;
        }
    },

    /**
     * Get all active games (paginated)
     * @param {Object} filters - Optional filters
     * @param {number} page - Page number
     * @param {number} limit - Results per page
     * @returns {Promise<Object>} - Games data with pagination info
     */
    async getGames(filters = {}, page = 1, limit = 10) {
        try {
            const query = {};
            
            // Apply filters
            if (filters.status) {
                query.status = filters.status;
            }
            
            if (filters.difficulty) {
                query.difficulty = filters.difficulty;
            }
            
            // Available games filter (players < maxPlayers)
            if (filters.available) {
                query.$expr = { $lt: [{ $size: "$players" }, "$maxPlayers"] };
            }
            
            // Count total
            const total = await Game.countDocuments(query);
            
            // Get paginated results
            const games = await Game.find(query)
                .select('-solution') // Don't send solutions to client
                .populate('createdBy', 'username')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);
            
            return {
                games,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error in getGames:', error);
            throw error;
        }
    },

    /**
     * Create a new game
     * @param {Object} gameData - New game data
     * @returns {Promise<Object>} - Created game
     */
    async createGame(gameData) {
        try {
            const game = new Game(gameData);
            await game.save();
            return game;
        } catch (error) {
            console.error('Error in createGame:', error);
            throw error;
        }
    },

    /**
     * Join a game
     * @param {string} gameId - The game ID
     * @param {Object} player - Player info (userId, username)
     * @returns {Promise<Object>} - Updated game
     */
    async joinGame(gameId, player) {
        try {
            const game = await this.getGameById(gameId);
            
            // Check if game is joinable
            if (game.status === 'completed') {
                throw new Error('Cannot join a completed game');
            }
            
            // Check if game is full
            if (game.players.length >= game.maxPlayers) {
                throw new Error('Game is full');
            }
            
            // Check if player is already in the game
            if (game.players.some(p => p.userId.toString() === player.userId)) {
                return game; // Player already joined, just return the game
            }
            
            // Add player
            game.players.push({
                userId: player.userId,
                username: player.username,
                score: 0,
                joinedAt: new Date()
            });
            
            // If game was waiting and now has players, set to active
            if (game.status === 'waiting' && game.players.length > 0) {
                game.status = 'active';
                game.startedAt = new Date();
            }
            
            await game.save();
            return game;
        } catch (error) {
            console.error('Error in joinGame:', error);
            throw error;
        }
    },

    /**
     * Get games for a specific user
     * @param {string} userId - The user ID
     * @returns {Promise<Array>} - User's games
     */
    async getUserGames(userId) {
        try {
            const games = await Game.find({
                'players.userId': userId
            })
            .select('-solution')
            .sort({ updatedAt: -1 });
            
            return games;
        } catch (error) {
            console.error('Error in getUserGames:', error);
            throw error;
        }
    }
};

export default gameService;