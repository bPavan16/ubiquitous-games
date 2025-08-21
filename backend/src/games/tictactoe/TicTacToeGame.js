import BaseGame from '../base/BaseGame.js';

class TicTacToeGame extends BaseGame {

    constructor(gameId, host) {
        super(gameId, host, 'tictactoe');
        this.maxPlayers = 2;
        this.board = Array(3).fill().map(() => Array(3).fill(null));
        this.currentPlayer = null;
        this.symbols = new Map(); // playerId -> symbol (X or O)
        this.moves = [];
    }

    addPlayer(playerId, playerName) {
        if (this.players.size >= this.maxPlayers) {
            return false;
        }

        // First player gets X, second gets O
        const symbol = this.players.size === 0 ? 'X' : 'O';
        this.symbols.set(playerId, symbol);

        const success = super.addPlayer(playerId, playerName);

        if (success) {
            const player = this.players.get(playerId);
            player.symbol = symbol;
            player.wins = 0;
            player.losses = 0;
            player.draws = 0;

            // First player (X) always goes first
            if (symbol === 'X') {
                this.currentPlayer = playerId;
            }
        }

        return success;
    }

    startGame() {
        if (this.gameState === 'waiting' && this.players.size === 2) {
            this.gameState = 'playing';
            this.startTime = Date.now();
            // Set current player to X player
            for (const [playerId, player] of this.players) {
                if (player.symbol === 'X') {
                    this.currentPlayer = playerId;
                    break;
                }
            }
            return true;
        }
        return false;
    }

    makeMove(playerId, moveData) {
        const { row, col } = moveData;

        // Validate move
        if (!this.isValidMove(playerId, moveData)) {
            return { success: false, reason: 'Invalid move' };
        }

        // Make the move
        const player = this.players.get(playerId);
        this.board[row][col] = player.symbol;

        // Record the move
        this.moves.push({
            playerId,
            playerName: player.name,
            symbol: player.symbol,
            row,
            col,
            timestamp: Date.now()
        });

        this.moveHistory.push({
            playerId,
            playerName: player.name,
            row,
            col,
            symbol: player.symbol,
            timestamp: Date.now()
        });

        // Check for win or draw
        const gameResult = this.checkWinCondition();

        if (gameResult.gameOver) {
            this.endGame(gameResult.winner);

            // Update player stats
            if (gameResult.winner) {
                this.players.get(gameResult.winner).wins++;
                this.players.get(gameResult.winner).score += 10;

                // Update loser
                for (const [pId, p] of this.players) {
                    if (pId !== gameResult.winner) {
                        p.losses++;
                        break;
                    }
                }
            } else {
                // It's a draw
                for (const player of this.players.values()) {
                    player.draws++;
                    player.score += 3;
                }
            }
        } else {
            // Switch to next player
            this.switchPlayer();
        }

        player.lastActive = Date.now();

        return {
            success: true,
            gameResult,
            nextPlayer: this.currentPlayer
        };
    }

    isValidMove(playerId, moveData) {
        const { row, col } = moveData;

        // Check if it's the player's turn
        if (this.currentPlayer !== playerId) {
            return false;
        }

        // Check if game is in playing state
        if (this.gameState !== 'playing') {
            return false;
        }

        // Check if coordinates are valid
        if (row < 0 || row > 2 || col < 0 || col > 2) {
            return false;
        }

        // Check if cell is empty
        if (this.board[row][col] !== null) {
            return false;
        }

        return true;
    }

    checkWinCondition() {
        // Check rows
        for (let row = 0; row < 3; row++) {
            if (this.board[row][0] &&
                this.board[row][0] === this.board[row][1] &&
                this.board[row][1] === this.board[row][2]) {
                return {
                    gameOver: true,
                    winner: this.getPlayerBySymbol(this.board[row][0]),
                    winType: 'row',
                    winLine: [row, 0, row, 1, row, 2]
                };
            }
        }

        // Check columns
        for (let col = 0; col < 3; col++) {
            if (this.board[0][col] &&
                this.board[0][col] === this.board[1][col] &&
                this.board[1][col] === this.board[2][col]) {
                return {
                    gameOver: true,
                    winner: this.getPlayerBySymbol(this.board[0][col]),
                    winType: 'column',
                    winLine: [0, col, 1, col, 2, col]
                };
            }
        }

        // Check diagonals
        if (this.board[0][0] &&
            this.board[0][0] === this.board[1][1] &&
            this.board[1][1] === this.board[2][2]) {
            return {
                gameOver: true,
                winner: this.getPlayerBySymbol(this.board[0][0]),
                winType: 'diagonal',
                winLine: [0, 0, 1, 1, 2, 2]
            };
        }

        if (this.board[0][2] &&
            this.board[0][2] === this.board[1][1] &&
            this.board[1][1] === this.board[2][0]) {
            return {
                gameOver: true,
                winner: this.getPlayerBySymbol(this.board[0][2]),
                winType: 'diagonal',
                winLine: [0, 2, 1, 1, 2, 0]
            };
        }

        // Check for draw (board is full)
        const isBoardFull = this.board.every(row => row.every(cell => cell !== null));
        if (isBoardFull) {
            return {
                gameOver: true,
                winner: null,
                winType: 'draw'
            };
        }

        return { gameOver: false };
    }

    getPlayerBySymbol(symbol) {
        for (const [playerId, player] of this.players) {
            if (player.symbol === symbol) {
                return playerId;
            }
        }
        return null;
    }

    switchPlayer() {
        for (const [playerId] of this.players) {
            if (playerId !== this.currentPlayer) {
                this.currentPlayer = playerId;
                break;
            }
        }
    }

    resetBoard() {
        this.board = Array(3).fill().map(() => Array(3).fill(null));
        this.moves = [];
        this.moveHistory = [];
        this.gameState = 'waiting';
        this.winner = null;
        this.startTime = null;
        this.endTime = null;

        // Switch symbols - previous X becomes O, previous O becomes X
        const players = Array.from(this.players.values());
        if (players.length === 2) {
            const player1 = players[0];
            const player2 = players[1];
            
            // Switch symbols
            const temp = player1.symbol;
            player1.symbol = player2.symbol;
            player2.symbol = temp;
            
            // Update the symbols map
            this.symbols.set(player1.id, player1.symbol);
            this.symbols.set(player2.id, player2.symbol);
        }

        // Set current player to whoever has X now
        for (const [playerId, player] of this.players) {
            if (player.symbol === 'X') {
                this.currentPlayer = playerId;
                break;
            }
        }
    }

    updateLeaderboard() {
        this.leaderboard = Array.from(this.players.values())
            .map(player => ({
                id: player.id,
                name: player.name,
                symbol: player.symbol,
                score: player.score,
                wins: player.wins,
                losses: player.losses,
                draws: player.draws,
                winRate: player.wins + player.losses > 0 ?
                    (player.wins / (player.wins + player.losses) * 100).toFixed(1) : 0,
                timeElapsed: this.startTime ? Date.now() - this.startTime : 0
            }))
            .sort((a, b) => {
                if (a.wins !== b.wins) return b.wins - a.wins;
                if (a.score !== b.score) return b.score - a.score;
                return parseFloat(b.winRate) - parseFloat(a.winRate);
            });
    }

    getGameState() {
        const baseState = super.getGameState();

        return {
            ...baseState,
            board: this.board,
            currentPlayer: this.currentPlayer,
            currentPlayerName: this.currentPlayer ?
                this.players.get(this.currentPlayer)?.name : null,
            moves: this.moves,
            players: Array.from(this.players.values()).map(player => ({
                ...player,
                isCurrentPlayer: player.id === this.currentPlayer
            }))
        };
    }

    getPublicGameInfo() {
        const baseInfo = super.getPublicGameInfo();

        return {
            ...baseInfo,
            currentPlayer: this.currentPlayer,
            boardState: this.getBoardSummary()
        };
    }

    getBoardSummary() {
        const filledCells = this.board.flat().filter(cell => cell !== null).length;
        return {
            filledCells,
            totalCells: 9,
            isEmpty: filledCells === 0
        };
    }
}

export default TicTacToeGame;
