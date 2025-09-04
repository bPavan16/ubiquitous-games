import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

export interface TicTacToePlayer {
    id: string;
    name: string;
    symbol: 'X' | 'O';
    score: number;
    isHost: boolean;
    wins: number;
    losses: number;
    draws: number;
}

export interface TicTacToeGameState {
    gameId: string;
    host: string;
    maxPlayers: number;
    players: TicTacToePlayer[];
    board: (string | null)[][];
    gameState: 'waiting' | 'playing' | 'paused' | 'finished';
    currentPlayer: string | null;
    winner: string | null;
    startTime: number | null;
    endTime: number | null;
    moveHistory: Array<{
        playerId: string;
        playerName: string;
        row: number;
        col: number;
        symbol: string;
        timestamp: number;
    }>;
    leaderboard: Array<{
        id: string;
        name: string;
        wins: number;
        losses: number;
        draws: number;
    }>;
}

export interface TicTacToeChatMessage {
    playerId: string;
    playerName: string;
    message: string;
    timestamp: number;
}

interface TicTacToeStore {
    // Connection state
    socket: Socket | null;
    isConnected: boolean;

    // Game state
    currentGame: TicTacToeGameState | null;
    availableGames: Array<{
        gameId: string;
        host: string;
        playerCount: number;
        maxPlayers: number;
    }>;

    // UI state
    playerName: string;
    showCreateDialog: boolean;
    showJoinDialog: boolean;
    showLeaderboard: boolean;
    chatMessages: TicTacToeChatMessage[];

    // Actions
    connect: () => void;
    disconnect: () => void;
    setPlayerName: (name: string) => void;
    createGame: () => void;
    joinGame: (gameId: string) => void;
    leaveGame: () => void;
    startGame: () => void;
    makeMove: (row: number, col: number) => void;
    playAgain: () => void;
    sendChatMessage: (message: string) => void;
    setShowCreateDialog: (show: boolean) => void;
    setShowJoinDialog: (show: boolean) => void;
    setShowLeaderboard: (show: boolean) => void;
    getAvailableGames: () => void;
}

export const useTicTacToeStore = create<TicTacToeStore>((set, get) => ({
    // Initial state
    socket: null,
    isConnected: false,
    currentGame: null,
    availableGames: [],
    playerName: '',
    showCreateDialog: false,
    showJoinDialog: false,
    showLeaderboard: false,
    chatMessages: [],

    // Actions
    connect: () => {
        const socket = io(import.meta.env.VITE_BACKEND_SERVER_URL, {
             transports: ["websocket"],

        });

        socket.on('connect', () => {
            set({ socket, isConnected: true });
            toast.success('Connected to server');
        });

        socket.on('disconnect', () => {
            set({ isConnected: false });
            toast.error('Disconnected from server');
        });

        socket.on('gameCreated', (data) => {
            set({
                currentGame: data.gameState,
                showCreateDialog: false
            });
            toast.success('Game created successfully!');
        });

        socket.on('gameJoined', (data) => {
            set({
                currentGame: data.gameState,
                showJoinDialog: false
            });
            toast.success('Joined game successfully!');
        });

        socket.on('playerJoined', (data) => {
            set({ currentGame: data.gameState });
            const newPlayer = data.gameState.players[data.gameState.players.length - 1];
            toast.info(`${newPlayer.name} joined the game`);
        });

        socket.on('playerLeft', (data) => {
            set({ currentGame: data.gameState });
            toast.info(`${data.playerName} left the game`);
        });

        socket.on('gameLeft', () => {
            set({
                currentGame: null,
                chatMessages: []
            });
            toast.success('Left the game successfully');
        });

        socket.on('hostChanged', (data) => {
            set({ currentGame: data.gameState });
            toast.info(`${data.newHost} is now the host`);
        });

        socket.on('gameStarted', (data) => {
            set({ currentGame: data.gameState });
            toast.success('Game started!');
        });

        socket.on('gameFinished', (data) => {
            set({ currentGame: data.gameState });
            if (data.winner) {
                toast.success(`🎉 ${data.winnerName} wins!`);
            } else {
                toast.info('Game ended in a draw!');
            }
        });

        socket.on('boardReset', (data) => {
            set({ currentGame: data.gameState });
            
            // Check if symbols have switched and notify players
            const currentGame = get().currentGame;
            if (currentGame && currentGame.players.length === 2) {
                const players = currentGame.players;
                const playerNames = players.map(p => `${p.name} (${p.symbol})`).join(' vs ');
                toast.info(`New round started! Symbols switched: ${playerNames}`);
            } else {
                toast.info('Game board has been reset. Starting new round!');
            }
        });

        socket.on('ticTacToeMove', (data) => {
            set({ currentGame: data.gameState });
            toast.success(`${data.playerName} placed ${data.symbol}`, {
                duration: 1000
            });
        });

        socket.on('invalidMove', (data) => {
            toast.error(`Invalid move: Cell already occupied at (${data.row + 1}, ${data.col + 1})`);
        });

        socket.on('availableGames', (games) => {
            set({ availableGames: games.filter((game: { gameType: string }) => game.gameType === 'tictactoe') });
        });

        socket.on('chatMessage', (message) => {
            set(state => ({
                chatMessages: [...state.chatMessages, message]
            }));
        });

        socket.on('error', (error) => {
            toast.error(error.message);
        });
    },

    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({
                socket: null,
                isConnected: false,
                currentGame: null,
                chatMessages: []
            });
        }
    },

    setPlayerName: (name) => {
        set({ playerName: name });
    },

    createGame: () => {
        const { socket, playerName } = get();
        if (socket && playerName.trim()) {
            socket.emit('createGame', {
                playerName: playerName.trim(),
                gameType: 'tictactoe'
            });
        } else {
            toast.error('Please enter your name first');
        }
    },

    joinGame: (gameId) => {
        const { socket, playerName } = get();
        if (socket && playerName.trim()) {
            socket.emit('joinGame', {
                gameId,
                playerName: playerName.trim(),
                gameType: 'tictactoe'
            });
        } else {
            toast.error('Please enter your name first');
        }
    },

    leaveGame: () => {
        const { socket } = get();
        if (socket) {
            socket.emit('leaveGame');
        }
    },

    startGame: () => {
        const { socket } = get();
        if (socket) {
            socket.emit('startGame');
        }
    },

    makeMove: (row, col) => {
        const { socket } = get();
        if (socket) {
            socket.emit('makeMove', { row, col });
        }
    },

    playAgain: () => {
        const { socket } = get();
        if (socket) {
            socket.emit('resetBoard');
        }
    },

    sendChatMessage: (message) => {
        const { socket } = get();
        if (socket && message.trim()) {
            socket.emit('chatMessage', { message: message.trim() });
        }
    },

    setShowCreateDialog: (show) => {
        set({ showCreateDialog: show });
    },

    setShowJoinDialog: (show) => {
        set({ showJoinDialog: show });
    },

    setShowLeaderboard: (show) => {
        set({ showLeaderboard: show });
    },

    getAvailableGames: () => {
        const { socket } = get();
        if (socket) {
            socket.emit('getAvailableGames', { gameType: 'tictactoe' });
        }
    }
}));
