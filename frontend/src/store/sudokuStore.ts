import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

export interface Player {
  id: string;
  name: string;
  progress: number[][];
  score: number;
  correctMoves: number;
  incorrectMoves: number;
  hints: number;
  isHost: boolean;
  completion: number;
}

export interface GameState {
  gameId: string;
  host: string;
  maxPlayers: number;
  players: Player[];
  puzzle: number[][];
  gameState: 'waiting' | 'playing' | 'paused' | 'finished';
  difficulty: 'easy' | 'medium' | 'hard';
  winner: string | null;
  startTime: number | null;
  endTime: number | null;
  leaderboard: Array<{
    id: string;
    name: string;
    score: number;
    completion: number;
    correctMoves: number;
    incorrectMoves: number;
  }>;
  moveHistory?: Array<{
    playerId: string;
    playerName: string;
    row: number;
    col: number;
    value: number;
    timestamp: number;
  }>;
}

export interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

interface SudokuStore {
  // Connection state
  socket: Socket | null;
  isConnected: boolean;
  
  // Game state
  currentGame: GameState | null;
  availableGames: Array<{
    gameId: string;
    host: string;
    playerCount: number;
    maxPlayers: number;
    difficulty: string;
  }>;
  
  // UI state
  selectedCell: { row: number; col: number } | null;
  playerName: string;
  showCreateDialog: boolean;
  showJoinDialog: boolean;
  showLeaderboard: boolean;
  chatMessages: ChatMessage[];
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  setPlayerName: (name: string) => void;
  createGame: (difficulty: 'easy' | 'medium' | 'hard') => void;
  joinGame: (gameId: string) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  makeMove: (row: number, col: number, value: number) => void;
  useHint: (row: number, col: number) => void;
  sendChatMessage: (message: string) => void;
  setSelectedCell: (cell: { row: number; col: number } | null) => void;
  setShowCreateDialog: (show: boolean) => void;
  setShowJoinDialog: (show: boolean) => void;
  setShowLeaderboard: (show: boolean) => void;
  getAvailableGames: () => void;
}

export const useSudokuStore = create<SudokuStore>((set, get) => ({
  // Initial state
  socket: null,
  isConnected: false,
  currentGame: null,
  availableGames: [],
  selectedCell: null,
  playerName: '',
  showCreateDialog: false,
  showJoinDialog: false,
  showLeaderboard: false,
  chatMessages: [],

  // Actions
  connect: () => {
    const socket = io('http://localhost:3001');
    
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

    socket.on('gameStarted', (data) => {
      set({ currentGame: data.gameState });
      toast.success('Game started!');
    });

    socket.on('gamePaused', (data) => {
      set({ currentGame: data.gameState });
      toast.info('Game paused');
    });

    socket.on('gameResumed', (data) => {
      set({ currentGame: data.gameState });
      toast.info('Game resumed');
    });

    socket.on('gameFinished', (data) => {
      set({ currentGame: data.gameState });
      toast.success(`🎉 ${data.winnerName} wins!`);
    });

    socket.on('moveUpdate', (data) => {
      set({ currentGame: data.gameState });
      if (data.isCorrect) {
        toast.success(`${data.playerName} placed ${data.value}`, {
          duration: 1000
        });
      }
    });

    socket.on('invalidMove', (data) => {
      toast.error(`Invalid move: ${data.value} at (${data.row + 1}, ${data.col + 1})`);
    });

    socket.on('hintUsed', (data) => {
      toast.info(`Hint used: ${data.value} at (${data.row + 1}, ${data.col + 1})`);
    });

    socket.on('availableGames', (games) => {
      set({ availableGames: games });
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

  createGame: (difficulty) => {
    const { socket, playerName } = get();
    if (socket && playerName.trim()) {
      socket.emit('createGame', { playerName: playerName.trim(), difficulty });
    } else {
      toast.error('Please enter your name first');
    }
  },

  joinGame: (gameId) => {
    const { socket, playerName } = get();
    if (socket && playerName.trim()) {
      socket.emit('joinGame', { gameId, playerName: playerName.trim() });
    } else {
      toast.error('Please enter your name first');
    }
  },

  startGame: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('startGame');
    }
  },

  pauseGame: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('pauseGame');
    }
  },

  resumeGame: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('resumeGame');
    }
  },

  makeMove: (row, col, value) => {
    const { socket } = get();
    if (socket) {
      socket.emit('makeMove', { row, col, value });
    }
  },

  useHint: (row, col) => {
    const { socket } = get();
    if (socket) {
      socket.emit('useHint', { row, col });
    }
  },

  sendChatMessage: (message) => {
    const { socket } = get();
    if (socket && message.trim()) {
      socket.emit('chatMessage', { message: message.trim() });
    }
  },

  setSelectedCell: (cell) => {
    set({ selectedCell: cell });
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
      socket.emit('getAvailableGames');
    }
  }
}));
