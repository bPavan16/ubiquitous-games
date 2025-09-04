import BaseGame from '../base/BaseGame.js';

class BattleshipGame extends BaseGame {
    constructor(gameId, host) {
        super(gameId, host, 'battleship');
        this.maxPlayers = 2;
        this.boardSize = 10; // 10x10 grid
        this.ships = [
            { name: 'carrier', size: 5, count: 1 },
            { name: 'battleship', size: 4, count: 1 },
            { name: 'cruiser', size: 3, count: 1 },
            { name: 'submarine', size: 3, count: 1 },
            { name: 'destroyer', size: 2, count: 1 }
        ];
        
        // Player boards and game state
        this.playerBoards = new Map(); // playerId -> { ships: [], shots: [], hits: [], misses: [] }
        this.currentPlayer = null;
        this.gamePhase = 'setup'; // setup, playing, finished
        this.playersReady = new Set();
        this.shotHistory = [];
        this.winner = null;
    }

    addPlayer(playerId, playerName) {
        if (this.players.size >= this.maxPlayers) {
            return false;
        }

        const success = super.addPlayer(playerId, playerName);
        
        if (success) {
            // Initialize player board
            this.playerBoards.set(playerId, {
                ships: [],
                shots: [], // All shots fired by this player
                hits: [], // Coordinates where this player was hit
                misses: [], // Coordinates where this player was missed
                shipsRemaining: [...this.ships], // Ships yet to be placed
                isReady: false,
                shipsDestroyed: 0
            });

            const player = this.players.get(playerId);
            player.hits = 0;
            player.misses = 0;
            player.shipsDestroyed = 0;
            player.totalShots = 0;
            player.accuracy = 0;
        }

        return success;
    }

    placeShip(playerId, shipData) {
        const { shipName, startRow, startCol, orientation } = shipData;
        
        console.log(`Attempting to place ship for player ${playerId}:`, shipData);
        
        const validationResult = this.isValidShipPlacement(playerId, shipData);
        if (!validationResult.valid) {
            console.log(`Ship placement validation failed: ${validationResult.reason}`);
            return { success: false, reason: validationResult.reason };
        }

        const playerBoard = this.playerBoards.get(playerId);
        const ship = this.ships.find(s => s.name === shipName);
        
        if (!ship) {
            console.log(`Ship not found: ${shipName}`);
            return { success: false, reason: 'Ship type not found' };
        }
        
        // Create ship object with coordinates
        const shipCoordinates = [];
        for (let i = 0; i < ship.size; i++) {
            if (orientation === 'horizontal') {
                shipCoordinates.push({ row: startRow, col: startCol + i });
            } else {
                shipCoordinates.push({ row: startRow + i, col: startCol });
            }
        }

        const placedShip = {
            name: shipName,
            size: ship.size,
            coordinates: shipCoordinates,
            hits: [],
            isDestroyed: false,
            orientation
        };

        playerBoard.ships.push(placedShip);
        
        // Remove ship from remaining ships
        playerBoard.shipsRemaining = playerBoard.shipsRemaining.filter(s => s.name !== shipName);

        console.log(`Ship placed successfully. Remaining ships: ${playerBoard.shipsRemaining.length}`);

        // Check if player is ready (all ships placed)
        if (playerBoard.shipsRemaining.length === 0) {
            playerBoard.isReady = true;
            this.playersReady.add(playerId);
            console.log(`Player ${playerId} is ready. Total ready: ${this.playersReady.size}`);
            
            // If both players are ready, start the game
            if (this.playersReady.size === 2) {
                console.log('Both players ready, starting battle phase');
                this.startBattlePhase();
            }
        }

        return { 
            success: true, 
            shipsRemaining: playerBoard.shipsRemaining.length,
            isReady: playerBoard.isReady 
        };
    }

    isValidShipPlacement(playerId, shipData) {
        const { shipName, startRow, startCol, orientation } = shipData;
        const playerBoard = this.playerBoards.get(playerId);
        
        if (!playerBoard) {
            return { valid: false, reason: 'Player board not found' };
        }
        
        // Check if ship exists and hasn't been placed
        const ship = this.ships.find(s => s.name === shipName);
        if (!ship) {
            return { valid: false, reason: `Ship type '${shipName}' not found` };
        }
        
        if (!playerBoard.shipsRemaining.find(s => s.name === shipName)) {
            return { valid: false, reason: `Ship '${shipName}' has already been placed` };
        }

        // Check bounds
        const endRow = orientation === 'vertical' ? startRow + ship.size - 1 : startRow;
        const endCol = orientation === 'horizontal' ? startCol + ship.size - 1 : startCol;
        
        if (endRow >= this.boardSize || endCol >= this.boardSize || 
            startRow < 0 || startCol < 0) {
            return { 
                valid: false, 
                reason: `Ship extends outside board boundaries (${startRow},${startCol}) to (${endRow},${endCol})` 
            };
        }

        // Check for overlap with existing ships
        const newCoordinates = [];
        for (let i = 0; i < ship.size; i++) {
            const row = orientation === 'vertical' ? startRow + i : startRow;
            const col = orientation === 'horizontal' ? startCol + i : startCol;
            newCoordinates.push({ row, col });
        }

        // Check if any coordinate overlaps with existing ships
        for (const existingShip of playerBoard.ships) {
            for (const existingCoord of existingShip.coordinates) {
                for (const newCoord of newCoordinates) {
                    if (existingCoord.row === newCoord.row && existingCoord.col === newCoord.col) {
                        return { 
                            valid: false, 
                            reason: `Ship overlaps with existing ship at (${newCoord.row},${newCoord.col})` 
                        };
                    }
                }
            }
        }

        return { valid: true };
    }

    startBattlePhase() {
        if (this.playersReady.size === 2) {
            this.gamePhase = 'playing';
            this.gameState = 'playing';
            this.startTime = Date.now();
            
            // Randomly choose starting player
            const playerIds = Array.from(this.players.keys());
            this.currentPlayer = playerIds[Math.floor(Math.random() * playerIds.length)];
            
            return true;
        }
        return false;
    }

    makeMove(playerId, moveData) {
        const { targetRow, targetCol } = moveData;

        if (!this.isValidMove(playerId, moveData)) {
            return { success: false, reason: 'Invalid move' };
        }

        // Get opponent's board
        const opponentId = this.getOpponentId(playerId);
        const opponentBoard = this.playerBoards.get(opponentId);
        const playerBoard = this.playerBoards.get(playerId);
        const player = this.players.get(playerId);

        // Check if shot hits a ship
        let hit = false;
        let shipHit = null;
        let shipDestroyed = false;

        for (const ship of opponentBoard.ships) {
            for (const coord of ship.coordinates) {
                if (coord.row === targetRow && coord.col === targetCol) {
                    hit = true;
                    shipHit = ship;
                    
                    // Add hit to ship
                    ship.hits.push({ row: targetRow, col: targetCol });
                    
                    // Check if ship is destroyed
                    if (ship.hits.length === ship.size) {
                        ship.isDestroyed = true;
                        shipDestroyed = true;
                        opponentBoard.shipsDestroyed++;
                        player.shipsDestroyed++;
                    }
                    break;
                }
            }
            if (hit) break;
        }

        // Record the shot
        const shotResult = {
            playerId,
            playerName: player.name,
            targetRow,
            targetCol,
            hit,
            shipHit: shipHit ? shipHit.name : null,
            shipDestroyed,
            timestamp: Date.now()
        };

        this.shotHistory.push(shotResult);
        playerBoard.shots.push({ row: targetRow, col: targetCol, hit, shipDestroyed });
        
        // Update opponent's board
        if (hit) {
            opponentBoard.hits.push({ row: targetRow, col: targetCol });
            player.hits++;
        } else {
            opponentBoard.misses.push({ row: targetRow, col: targetCol });
            player.misses++;
        }

        player.totalShots++;
        player.accuracy = player.totalShots > 0 ? (player.hits / player.totalShots * 100).toFixed(1) : 0;
        player.score = player.hits * 10 + player.shipsDestroyed * 50;

        // Check win condition
        const gameResult = this.checkWinCondition();
        
        if (gameResult.gameOver) {
            this.endGame(gameResult.winner);
        } else {
            // Switch players only if it was a miss
            if (!hit) {
                this.switchPlayer();
            }
            // If it was a hit, current player gets another turn
        }

        player.lastActive = Date.now();

        return {
            success: true,
            hit,
            shipHit: shipHit ? shipHit.name : null,
            shipDestroyed,
            gameResult,
            nextPlayer: this.currentPlayer,
            continuesTurn: hit && !gameResult.gameOver
        };
    }

    isValidMove(playerId, moveData) {
        const { targetRow, targetCol } = moveData;

        // Check if it's the player's turn
        if (this.currentPlayer !== playerId) {
            return false;
        }

        // Check if game is in playing state
        if (this.gamePhase !== 'playing' || this.gameState !== 'playing') {
            return false;
        }

        // Check if coordinates are valid
        if (targetRow < 0 || targetRow >= this.boardSize || 
            targetCol < 0 || targetCol >= this.boardSize) {
            return false;
        }

        // Check if this position has already been targeted
        const playerBoard = this.playerBoards.get(playerId);
        for (const shot of playerBoard.shots) {
            if (shot.row === targetRow && shot.col === targetCol) {
                return false; // Already shot at this position
            }
        }

        return true;
    }

    checkWinCondition() {
        for (const [playerId, board] of this.playerBoards) {
            // Check if all opponent's ships are destroyed
            const opponentId = this.getOpponentId(playerId);
            const opponentBoard = this.playerBoards.get(opponentId);
            
            if (opponentBoard && opponentBoard.shipsDestroyed === this.ships.length) {
                return {
                    gameOver: true,
                    winner: playerId,
                    reason: 'All enemy ships destroyed'
                };
            }
        }

        return { gameOver: false };
    }

    getOpponentId(playerId) {
        for (const [id] of this.players) {
            if (id !== playerId) {
                return id;
            }
        }
        return null;
    }

    switchPlayer() {
        const opponentId = this.getOpponentId(this.currentPlayer);
        if (opponentId) {
            this.currentPlayer = opponentId;
        }
    }

    resetGame() {
        this.gamePhase = 'setup';
        this.gameState = 'waiting';
        this.currentPlayer = null;
        this.playersReady.clear();
        this.shotHistory = [];
        this.winner = null;
        this.startTime = null;
        this.endTime = null;

        // Reset player boards
        for (const [playerId] of this.players) {
            this.playerBoards.set(playerId, {
                ships: [],
                shots: [],
                hits: [],
                misses: [],
                shipsRemaining: [...this.ships],
                isReady: false,
                shipsDestroyed: 0
            });

            const player = this.players.get(playerId);
            player.hits = 0;
            player.misses = 0;
            player.shipsDestroyed = 0;
            player.totalShots = 0;
            player.accuracy = 0;
            player.score = 0;
        }
    }

    getGameState() {
        const baseState = super.getGameState();

        return {
            ...baseState,
            gamePhase: this.gamePhase,
            currentPlayer: this.currentPlayer,
            currentPlayerName: this.currentPlayer ? 
                this.players.get(this.currentPlayer)?.name : null,
            boardSize: this.boardSize,
            availableShips: this.ships,
            shotHistory: this.shotHistory,
            playersReady: Array.from(this.playersReady),
            players: Array.from(this.players.values()).map(player => ({
                ...player,
                isCurrentPlayer: player.id === this.currentPlayer,
                board: this.getPlayerBoardState(player.id),
                isReady: this.playerBoards.get(player.id)?.isReady || false
            }))
        };
    }

    getPlayerBoardState(playerId, isOpponent = false) {
        const board = this.playerBoards.get(playerId);
        if (!board) return null;

        return {
            ships: isOpponent ? 
                // For opponent view, only show destroyed ships
                board.ships.filter(ship => ship.isDestroyed).map(ship => ({
                    name: ship.name,
                    coordinates: ship.coordinates,
                    isDestroyed: true
                })) :
                // For own view, show all ships
                board.ships,
            hits: board.hits,
            misses: board.misses,
            shots: board.shots,
            shipsRemaining: board.shipsRemaining,
            shipsDestroyed: board.shipsDestroyed,
            isReady: board.isReady
        };
    }

    getOpponentBoardState(playerId) {
        const opponentId = this.getOpponentId(playerId);
        return this.getPlayerBoardState(opponentId, true);
    }

    updateLeaderboard() {
        this.leaderboard = Array.from(this.players.values())
            .map(player => ({
                id: player.id,
                name: player.name,
                score: player.score,
                hits: player.hits,
                misses: player.misses,
                totalShots: player.totalShots,
                accuracy: player.accuracy,
                shipsDestroyed: player.shipsDestroyed,
                timeElapsed: this.startTime ? Date.now() - this.startTime : 0
            }))
            .sort((a, b) => {
                if (a.score !== b.score) return b.score - a.score;
                if (a.accuracy !== b.accuracy) return b.accuracy - a.accuracy;
                return a.timeElapsed - b.timeElapsed;
            });
    }

    getPublicGameInfo() {
        const baseInfo = super.getPublicGameInfo();

        return {
            ...baseInfo,
            gamePhase: this.gamePhase,
            currentPlayer: this.currentPlayer,
            playersReady: this.playersReady.size,
            totalShots: this.shotHistory.length
        };
    }
}

export default BattleshipGame;
