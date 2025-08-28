import { create } from 'zustand';
import { io } from 'socket.io-client';
import { toast } from 'sonner';

// Enhanced socket connection with better configuration
const socket = io('http://localhost:3001', {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 20000,
  transports: ['websocket', 'polling']
});

interface Ship {
  name: string;
  size: number;
  count: number;
}

interface PlacedShip {
  name: string;
  size: number;
  coordinates: { row: number; col: number }[];
  hits: { row: number; col: number }[];
  isDestroyed: boolean;
  orientation: 'horizontal' | 'vertical';
}

interface BoardCell {
  row: number;
  col: number;
  hit?: boolean;
  shipDestroyed?: boolean;
}

interface PlayerBoard {
  ships: PlacedShip[];
  hits: { row: number; col: number }[];
  misses: { row: number; col: number }[];
  shots: BoardCell[];
  shipsRemaining: Ship[];
  shipsDestroyed: number;
  isReady: boolean;
}

interface Player {
  id: string;
  name: string;
  isCurrentPlayer: boolean;
  hits: number;
  misses: number;
  totalShots: number;
  accuracy: number;
  shipsDestroyed: number;
  score: number;
  board: PlayerBoard;
  isReady: boolean;
  isHost?: boolean;
}

interface ShotHistoryEntry {
  playerId: string;
  playerName: string;
  targetRow: number;
  targetCol: number;
  hit: boolean;
  shipHit: string | null;
  shipDestroyed: boolean;
  timestamp: number;
}

interface GameState {
  gameId: string;
  gameType: string;
  gamePhase: 'setup' | 'playing' | 'finished';
  gameState: 'waiting' | 'playing' | 'finished';
  currentPlayer: string | null;
  currentPlayerName: string | null;
  boardSize: number;
  availableShips: Ship[];
  shotHistory: ShotHistoryEntry[];
  playersReady: string[];
  players: Player[];
  host: string;
  maxPlayers: number;
  winner: string | null;
  startTime: number | null;
  endTime: number | null;
}

interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

interface BattleshipStore {
  // Game state
  currentGame: GameState | null;
  isConnected: boolean;
  playerName: string;
  
  // UI state
  selectedShip: Ship | null;
  shipOrientation: 'horizontal' | 'vertical';
  hoveredCells: { row: number; col: number }[] | null;
  targetMode: boolean;
  opponentBoard: PlayerBoard | null;
  
  // Chat
  chatMessages: ChatMessage[];
  
  // Actions
  createGame: (playerName: string) => void;
  joinGame: (gameId: string, playerName: string) => void;
  leaveGame: () => void;
  placeShip: (shipName: string, startRow: number, startCol: number, orientation: 'horizontal' | 'vertical') => void;
  fireShot: (targetRow: number, targetCol: number) => void;
  resetGame: () => void;
  sendChatMessage: (message: string) => void;
  
  // UI actions
  setSelectedShip: (ship: Ship | null) => void;
  setShipOrientation: (orientation: 'horizontal' | 'vertical') => void;
  setHoveredCells: (cells: { row: number; col: number }[] | null) => void;
  setTargetMode: (mode: boolean) => void;
  
  // Utility
  getCurrentPlayer: () => Player | null;
  getOpponent: () => Player | null;
  isMyTurn: () => boolean;
  canPlaceShip: (ship: Ship, startRow: number, startCol: number, orientation: 'horizontal' | 'vertical') => boolean;
  placeRandomShips: () => void;
  startGame: () => void;
  isReady: () => boolean;
}

export const useBattleshipStore = create<BattleshipStore>((set, get) => {
  // Enhanced socket event handlers with comprehensive error handling and debugging
  socket.on('connect', () => {
    console.log('✅ Connected to battleship server');
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
    console.log('🎮 Game created:', data);
    set({ currentGame: data.gameState });
    toast.success('Battleship game created successfully!');
  });

  socket.on('gameJoined', (data) => {
    console.log('🚢 Game joined:', data);
    set({ currentGame: data.gameState });
    toast.success('Joined Battleship game!');
  });

  socket.on('playerJoined', (data) => {
    console.log('👤 Player joined:', data);
    set({ currentGame: data.gameState });
    const newPlayer = data.gameState.players[data.gameState.players.length - 1];
    if (newPlayer) {
      toast.info(`${newPlayer.name} joined the game`);
    }
  });

  socket.on('shipPlaced', (data) => {
    console.log('⚓ Ship placed successfully:', data);
    const { currentGame } = get();
    if (currentGame) {
      set({ 
        currentGame: data.gameState,
        selectedShip: null // Clear selected ship after successful placement
      });
      toast.success(`${data.shipName.charAt(0).toUpperCase() + data.shipName.slice(1)} placed successfully!`);
      
      if (data.isReady) {
        toast.info('All ships deployed! Waiting for opponent...');
      }
    }
  });

  socket.on('playerShipPlaced', (data) => {
    console.log('👥 Opponent ship placed:', data);
    const { currentGame } = get();
    if (currentGame) {
      set({ currentGame: data.gameState });
      toast.info(`${data.playerName} deployed their ${data.shipName}`);
    }
  });

  socket.on('gameStarted', (data) => {
    console.log('🎯 Battle started:', data);
    set({ currentGame: data.gameState });
    toast.success('🔥 Battle has begun! All ships deployed!');
  });

  socket.on('shotFired', (data) => {
    console.log('💥 Shot result:', data);
    const { currentGame } = get();
    if (currentGame) {
      set({ currentGame: data.gameState });
      
      const isMyShot = data.playerId === socket.id;
      if (isMyShot) {
        if (data.hit) {
          if (data.shipDestroyed) {
            toast.success(`🎯 Direct hit! Enemy ${data.shipHit} destroyed!`);
          } else {
            toast.success(`🎯 Direct hit on enemy ${data.shipHit}!`);
          }
        } else {
          toast.info(`💦 Missed! No enemy ships at those coordinates.`);
        }
      } else {
        if (data.hit) {
          if (data.shipDestroyed) {
            toast.error(`💥 Your ${data.shipHit} was destroyed!`);
          } else {
            toast.warning(`⚠️ Your ${data.shipHit} was hit!`);
          }
        } else {
          toast.info(`🌊 Enemy missed!`);
        }
      }
    }
  });

  socket.on('gameFinished', (data) => {
    console.log('🏆 Game finished:', data);
    const { currentGame } = get();
    if (currentGame) {
      set({ 
        currentGame: data.gameState,
        targetMode: false 
      });
      
      const isWinner = data.winner === socket.id;
      if (isWinner) {
        toast.success(`🏆 Victory! You sunk all enemy ships!`);
      } else {
        toast.error(`💀 Defeat! ${data.winnerName} sunk all your ships!`);
      }
    }
  });

  socket.on('battleshipGameReset', (data) => {
    console.log('🔄 Game reset:', data);
    set({ 
      currentGame: data.gameState,
      selectedShip: null,
      shipOrientation: 'horizontal',
      hoveredCells: null,
      targetMode: false,
      opponentBoard: null
    });
    toast.info('Game has been reset');
  });

  socket.on('chatMessage', (message) => {
    set(state => ({
      chatMessages: [...state.chatMessages, message]
    }));
  });

  socket.on('error', (data) => {
    console.error('🚨 Server error:', data);
    toast.error(data.message || 'An error occurred');
  });

  socket.on('invalidMove', (data) => {
    console.warn('⚠️ Invalid move:', data);
    toast.error(`Invalid move: ${data.reason}`);
  });

  return {
    // Initial state
    currentGame: null,
    isConnected: false,
    playerName: '',
    selectedShip: null,
    shipOrientation: 'horizontal',
    hoveredCells: null,
    targetMode: false,
    opponentBoard: null,
    chatMessages: [],

    // Actions
    createGame: (playerName: string) => {
      console.log('🎮 Creating game for:', playerName);
      set({ playerName });
      socket.emit('createGame', {
        playerName,
        gameType: 'battleship'
      });
    },

    joinGame: (gameId: string, playerName: string) => {
      console.log('🚢 Joining game:', gameId, 'as:', playerName);
      set({ playerName });
      socket.emit('joinGame', {
        gameId,
        playerName
      });
    },

    leaveGame: () => {
      console.log('🚪 Leaving game');
      socket.emit('leaveGame');
      set({
        currentGame: null,
        selectedShip: null,
        shipOrientation: 'horizontal',
        hoveredCells: null,
        targetMode: false,
        opponentBoard: null,
        chatMessages: []
      });
    },

    placeShip: (shipName: string, startRow: number, startCol: number, orientation: 'horizontal' | 'vertical') => {
      console.log('⚓ Placing ship:', { shipName, startRow, startCol, orientation });
      console.log('🔌 Socket connected:', socket.connected);
      
      if (!socket.connected) {
        toast.error('Not connected to server! Please refresh the page.');
        return;
      }

      socket.emit('placeShip', {
        shipName,
        startRow,
        startCol,
        orientation
      });
    },

    fireShot: (targetRow: number, targetCol: number) => {
      console.log('🎯 Firing shot at:', { targetRow, targetCol });
      
      if (!socket.connected) {
        toast.error('Not connected to server! Please refresh the page.');
        return;
      }

      socket.emit('makeMove', {
        targetRow,
        targetCol
      });
    },

    resetGame: () => {
      console.log('🔄 Resetting game');
      socket.emit('resetBattleshipGame');
    },

    sendChatMessage: (message: string) => {
      socket.emit('chatMessage', { message });
    },

    // UI actions
    setSelectedShip: (ship: Ship | null) => {
      console.log('🚢 Selected ship:', ship);
      set({ selectedShip: ship });
    },

    setShipOrientation: (orientation: 'horizontal' | 'vertical') => {
      console.log('🔄 Changed orientation to:', orientation);
      set({ shipOrientation: orientation });
    },

    setHoveredCells: (cells: { row: number; col: number }[] | null) => {
      set({ hoveredCells: cells });
    },

    setTargetMode: (mode: boolean) => {
      set({ targetMode: mode });
    },

    // Utility functions
    getCurrentPlayer: () => {
      const { currentGame } = get();
      if (!currentGame) return null;
      return currentGame.players.find(p => p.id === socket.id) || null;
    },

    getOpponent: () => {
      const { currentGame } = get();
      if (!currentGame) return null;
      return currentGame.players.find(p => p.id !== socket.id) || null;
    },

    isMyTurn: () => {
      const { currentGame } = get();
      if (!currentGame) return false;
      return currentGame.currentPlayer === socket.id;
    },

    canPlaceShip: (ship: Ship, startRow: number, startCol: number, orientation: 'horizontal' | 'vertical') => {
      const { currentGame } = get();
      if (!currentGame) return false;

      const currentPlayer = get().getCurrentPlayer();
      if (!currentPlayer) return false;

      // Check bounds
      const endRow = orientation === 'vertical' ? startRow + ship.size - 1 : startRow;
      const endCol = orientation === 'horizontal' ? startCol + ship.size - 1 : startCol;

      if (endRow >= currentGame.boardSize || endCol >= currentGame.boardSize || 
          startRow < 0 || startCol < 0) {
        return false;
      }

      // Check for overlap with existing ships
      const newCoordinates = [];
      for (let i = 0; i < ship.size; i++) {
        const row = orientation === 'vertical' ? startRow + i : startRow;
        const col = orientation === 'horizontal' ? startCol + i : startCol;
        newCoordinates.push({ row, col });
      }

      // Check if any coordinate overlaps with existing ships
      for (const existingShip of currentPlayer.board.ships) {
        for (const existingCoord of existingShip.coordinates) {
          for (const newCoord of newCoordinates) {
            if (existingCoord.row === newCoord.row && existingCoord.col === newCoord.col) {
              return false;
            }
          }
        }
      }

      return true;
    },

    placeRandomShips: () => {
      const { currentGame } = get();
      if (!currentGame) return;

      const currentPlayer = get().getCurrentPlayer();
      if (!currentPlayer) return;

      // Define ships to place
      const ships = [
        { name: 'carrier', size: 5 },
        { name: 'battleship', size: 4 },
        { name: 'cruiser', size: 3 },
        { name: 'submarine', size: 3 },
        { name: 'destroyer', size: 2 }
      ];

      // Get already placed ships
      const placedShipTypes = currentPlayer.board.ships.map(ship => ship.name);
      const shipsToPlace = ships.filter(ship => !placedShipTypes.includes(ship.name));

      console.log('🎲 Placing random ships:', shipsToPlace);

      // Place each remaining ship randomly
      for (const ship of shipsToPlace) {
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 100) {
          const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
          const startRow = Math.floor(Math.random() * currentGame.boardSize);
          const startCol = Math.floor(Math.random() * currentGame.boardSize);
          
          const tempShip = { name: ship.name, size: ship.size, count: 1 };
          if (get().canPlaceShip(tempShip, startRow, startCol, orientation)) {
            get().placeShip(ship.name, startRow, startCol, orientation);
            placed = true;
          }
          attempts++;
        }
        
        if (!placed) {
          console.warn('⚠️ Could not place ship:', ship.name);
          toast.warning(`Could not auto-place ${ship.name}. Please place manually.`);
        }
      }
    },

    startGame: () => {
      console.log('▶️ Starting game');
      socket.emit('startGame');
    },

    isReady: () => {
      const { currentGame } = get();
      if (!currentGame) return false;
      
      const currentPlayer = get().getCurrentPlayer();
      if (!currentPlayer) return false;

      // Check if all 5 ships are placed
      return currentPlayer.board.ships.length === 5;
    }
  };
});
