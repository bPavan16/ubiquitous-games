import { create } from 'zustand';
import { io } from 'socket.io-client';
import { toast } from 'sonner';

// Enhanced socket connection
const socket = io('http://localhost:3001', {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 20000,
  transports: ['websocket', 'polling']
});

// Text content pools for frontend generation
const textPool = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet and is commonly used for typing practice. It helps develop muscle memory and finger coordination while ensuring all keys on the keyboard are utilized effectively.",
  "In the heart of every winter lies a vibrant spring, and behind every night awaits a radiant dawn. Life is a series of seasons, each bringing its own beauty and challenges. Embrace the cold moments, for they make the warm ones even more precious and meaningful.",
  "Technology has revolutionized the way we communicate, work, and live. From smartphones to artificial intelligence, innovation continues to shape our future. The digital age has connected people across the globe, creating opportunities that were once unimaginable.",
  "The art of programming requires patience, logic, and creativity. Writing clean, efficient code is like crafting poetry with purpose. Every function, every variable, every line contributes to a larger symphony of digital innovation and problem-solving excellence.",
  "Nature teaches us valuable lessons about resilience and adaptation. Trees bend with the wind but rarely break, rivers find ways around obstacles, and seasons change in perfect rhythm. We can learn much from observing the natural world around us every day."
];

const wordPool = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with', 'he',
  'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out',
  'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no',
  'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them',
  'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new',
  'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'was', 'are', 'been'
];

interface Player {
  playerId: string;
  playerName: string;
  progress: number; // 0-100 percentage for text mode, words count for word mode
  wmp: number; // words per minute (keeping wmp to match backend)
  accuracy: number; // 0-100 percentage
  position: number; // current position in text/word array
  isFinished: boolean;
  isHost?: boolean;
}

interface GameState {
  gameId: string;
  gameType: string;
  mode: 'text-race' | 'word-sprint'; // Two game modes
  gameState: 'waiting' | 'playing' | 'finished';
  players: Player[];
  host: string;
  maxPlayers: number;
  duration: number; // Game duration in seconds (for word sprint mode)
  isStarted: boolean;
  isFinished: boolean;
  gameStartTime: number | null;
  gameEndTime: number | null;
  timeRemaining: number | null;
  leaderboard: Player[];
  winner: string | null;
  
  // Frontend generated content
  text?: string;
  words?: string[];
}

interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

interface TypingStats {
  startTime: number;
  keystrokes: number;
  errors: number;
  correctChars: number;
  totalChars: number;
  currentInput: string;
  currentPosition: number;
}

interface AvailableGame {
  gameId: string;
  host: string;
  playerCount: number;
  maxPlayers: number;
  mode: string;
  gameState: string;
}

interface TypingStore {
  // Game state
  currentGame: GameState | null;
  isConnected: boolean;
  playerName: string;
  availableGames: AvailableGame[];
  
  // UI state
  currentInput: string;
  typingStats: TypingStats | null;
  
  // Chat
  chatMessages: ChatMessage[];
  
  // Actions
  createGame: (playerName: string, gameMode: 'text-race' | 'word-sprint') => void;
  joinGame: (gameId: string, playerName: string) => void;
  leaveGame: () => void;
  getAvailableGames: () => void;
  sendChatMessage: (message: string) => void;
  updateTypingProgress: (input: string) => void;
  startGame: () => void;
  setPlayerName: (name: string) => void;
  
  // Utility
  getCurrentPlayer: () => Player | null;
  getOpponents: () => Player[];
  calculateWPM: (startTime: number, endTime: number, wordCount: number) => number;
  calculateAccuracy: (correct: number, total: number) => number;
}

export const useTypingStore = create<TypingStore>((set, get) => {
  // Enhanced socket event handlers
  socket.on('connect', () => {
    console.log('✅ Connected to typing server');
    set({ isConnected: true });
    toast.success('Connected to game server');
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Disconnected from server:', reason);
    set({ isConnected: false });
    toast.error('Disconnected from server');
  });

  socket.on('connect_error', (error) => {
    console.error('🔌 Connection error:', error);
    toast.error('Failed to connect to server');
  });

  socket.on('gameCreated', (data) => {
    console.log('🎮 Typing game created:', data);
    set({ currentGame: data.gameState });
    toast.success('Typing game created successfully!');
  });

  socket.on('gameJoined', (data) => {
    console.log('⌨️ Typing game joined:', data);
    set({ currentGame: data.gameState });
    toast.success('Joined typing game!');
  });

  socket.on('playerJoined', (data) => {
    console.log('👤 Player joined:', data);
    set({ currentGame: data.gameState });
    const newPlayer = data.gameState.players[data.gameState.players.length - 1];
    if (newPlayer) {
      toast.info(`${newPlayer.name} joined the game`);
    }
  });

  socket.on('gameStarted', (data) => {
    console.log('🚀 Typing game started:', data);
    
    // Generate content based on mode
    const { mode } = data.gameState;
    const generatedContent: { text?: string; words?: string[] } = {};
    
    if (mode === 'text-race') {
      // Select random text from pool
      const randomIndex = Math.floor(Math.random() * textPool.length);
      generatedContent.text = textPool[randomIndex];
    } else if (mode === 'word-sprint') {
      // Generate random word sequence
      const shuffled = [...wordPool].sort(() => 0.5 - Math.random());
      generatedContent.words = shuffled.slice(0, 50); // 50 words for sprint
    }
    
    set({ 
      currentGame: { 
        ...data.gameState, 
        ...generatedContent 
      },
      typingStats: {
        startTime: Date.now(),
        keystrokes: 0,
        errors: 0,
        correctChars: 0,
        totalChars: 0,
        currentInput: '',
        currentPosition: 0
      }
    });
    toast.success('🎯 Typing race has begun! Start typing!');
  });

  socket.on('typingProgressUpdate', (data) => {
    console.log('📊 Typing progress update:', data);
    set({ currentGame: data.gameState });
  });

  socket.on('gameFinished', (data) => {
    console.log('🏆 Typing game finished:', data);
    const { currentGame } = get();
    if (currentGame) {
      set({ 
        currentGame: data.gameState
      });
      
      const isWinner = data.winner === socket.id;
      if (isWinner) {
        toast.success(`🏆 Congratulations! You won the typing race!`);
      } else {
        toast.info(`🎯 Game finished! Winner: ${data.winnerName}`);
      }
    }
  });

  socket.on('chatMessage', (message) => {
    set(state => ({
      chatMessages: [...state.chatMessages, message]
    }));
  });

  socket.on('availableGames', (games) => {
    set({ availableGames: games });
  });

  socket.on('playerLeft', (data) => {
    console.log('👋 Player left:', data);
    set({ currentGame: data.gameState });
    toast.info(`${data.playerName} left the game`);
  });

  socket.on('error', (data) => {
    console.error('🚨 Server error:', data);
    toast.error(data.message || 'An error occurred');
  });

  return {
    // Initial state
    currentGame: null,
    isConnected: false,
    playerName: '',
    availableGames: [],
    currentInput: '',
    typingStats: null,
    chatMessages: [],

    // Actions
    createGame: (playerName: string, gameMode: 'text-race' | 'word-sprint') => {
      console.log('🎮 Creating typing game:', playerName, gameMode);
      set({ playerName });
      socket.emit('createGame', {
        playerName,
        gameType: 'typing',
        gameMode
      });
    },

    joinGame: (gameId: string, playerName: string) => {
      console.log('⌨️ Joining typing game:', gameId, 'as:', playerName);
      set({ playerName });
      socket.emit('joinGame', {
        gameId,
        playerName
      });
    },

    leaveGame: () => {
      console.log('🚪 Leaving typing game');
      socket.emit('leaveGame');
      set({
        currentGame: null,
        currentInput: '',
        typingStats: null,
        chatMessages: []
      });
    },

    getAvailableGames: () => {
      console.log('📋 Getting available typing games');
      socket.emit('getAvailableGames', { gameType: 'typing' });
    },

    sendChatMessage: (message: string) => {
      socket.emit('chatMessage', { message });
    },

    updateTypingProgress: (input: string) => {
      const { currentGame, typingStats } = get();
      if (!currentGame || currentGame.gameState !== 'playing' || !typingStats) return;

      // Calculate typing metrics
      const currentText = currentGame.mode === 'text-race' ? currentGame.text : currentGame.words?.join(' ');
      if (!currentText) return;

      const newStats = { ...typingStats };
      newStats.currentInput = input;
      newStats.keystrokes++;

      // Calculate correct characters and errors
      let correctChars = 0;
      let errors = 0;
      
      for (let i = 0; i < input.length; i++) {
        if (i < currentText.length && input[i] === currentText[i]) {
          correctChars++;
        } else {
          errors++;
        }
      }

      newStats.correctChars = correctChars;
      newStats.errors = errors;
      newStats.totalChars = input.length;
      newStats.currentPosition = input.length;

      // Calculate WPM and accuracy
      const timeElapsed = (Date.now() - newStats.startTime) / 1000 / 60; // minutes
      const wordsTyped = input.split(' ').length;
      const wmp = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
      const accuracy = newStats.totalChars > 0 ? Math.round((newStats.correctChars / newStats.totalChars) * 100) : 100;

      // Calculate progress percentage
      const progress = currentText.length > 0 ? Math.round((input.length / currentText.length) * 100) : 0;
      const isFinished = input === currentText;

      set({ 
        currentInput: input,
        typingStats: newStats
      });

      // Send progress to server for leaderboard updates
      socket.emit('updateTypingProgress', {
        wmp,
        accuracy,
        progress: Math.min(progress, 100),
        position: newStats.currentPosition,
        isFinished
      });

      // Check if finished
      if (isFinished) {
        socket.emit('finishGame');
      }
    },

    startGame: () => {
      console.log('▶️ Starting typing game');
      socket.emit('startGame');
    },

    setPlayerName: (name: string) => {
      set({ playerName: name });
    },

    // Utility functions
    getCurrentPlayer: () => {
      const { currentGame } = get();
      if (!currentGame) return null;
      return currentGame.players.find(p => p.playerId === socket.id) || null;
    },

    getOpponents: () => {
      const { currentGame } = get();
      if (!currentGame) return [];
      return currentGame.players.filter(p => p.playerId !== socket.id);
    },

    calculateWPM: (startTime: number, endTime: number, wordCount: number) => {
      const timeInMinutes = (endTime - startTime) / 1000 / 60;
      return timeInMinutes > 0 ? Math.round(wordCount / timeInMinutes) : 0;
    },

    calculateAccuracy: (correct: number, total: number) => {
      return total > 0 ? Math.round((correct / total) * 100) : 100;
    }
  };
});
