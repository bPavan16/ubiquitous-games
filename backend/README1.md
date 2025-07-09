# Multiplayer Sudoku Backend

A real-time multiplayer Sudoku game backend built with Node.js, Express, and Socket.IO.

## Features

- **Real-time Multiplayer**: Up to 4 players can play simultaneously
- **Multiple Difficulty Levels**: Easy, Medium, and Hard puzzles
- **Live Leaderboard**: Track player scores and completion rates
- **Hint System**: Players get 3 hints per game
- **Chat System**: In-game communication between players
- **Game State Management**: Pause/resume functionality for hosts
- **Conflict Detection**: Highlight incorrect moves
- **Auto-cleanup**: Removes inactive games automatically

## Socket Events

### Client to Server

- `createGame` - Create a new game room
- `joinGame` - Join an existing game
- `startGame` - Start the game (host only)
- `pauseGame` - Pause the game (host only)
- `resumeGame` - Resume the game (host only)
- `makeMove` - Make a move on the board
- `useHint` - Use a hint for a specific cell
- `checkConflicts` - Check for conflicts in current progress
- `getLeaderboard` - Get current leaderboard
- `getAvailableGames` - Get list of available games
- `chatMessage` - Send a chat message

### Server to Client

- `gameCreated` - Game successfully created
- `gameJoined` - Successfully joined a game
- `playerJoined` - Another player joined the game
- `playerLeft` - A player left the game
- `gameStarted` - Game has started
- `gamePaused` - Game has been paused
- `gameResumed` - Game has been resumed
- `gameFinished` - Game completed with winner
- `moveUpdate` - A player made a move
- `invalidMove` - Move was invalid
- `hintUsed` - Hint was successfully used
- `playerUsedHint` - Another player used a hint
- `conflictsChecked` - Conflicts check result
- `leaderboardUpdate` - Updated leaderboard
- `availableGames` - List of available games
- `chatMessage` - Chat message received
- `error` - Error occurred

## API Endpoints

### GET /api/health
Returns server health status and game statistics.

### GET /api/games
Returns list of available games waiting for players.

### GET /api/stats
Returns detailed server statistics.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Start the server:
```bash
npm run dev
```

## Game Logic

### Sudoku Generation
- Generates complete valid Sudoku puzzles
- Removes cells based on difficulty level
- Ensures unique solutions

### Scoring System
- +10 points for correct moves
- -2 points for incorrect moves
- -5 points for using hints
- Leaderboard sorted by completion, then score, then time

### Game States
- `waiting` - Waiting for players to join
- `playing` - Game in progress
- `paused` - Game paused by host
- `finished` - Game completed

## Dependencies

- `express` - Web framework
- `socket.io` - Real-time communication
- `cors` - Cross-origin resource sharing
- `uuid` - Unique ID generation
- `nodemon` - Development auto-restart

## Development

The codebase is organized into:
- `src/index.js` - Main server file
- `src/models/SudokuGame.js` - Game logic and state management
- `src/socket/SocketManager.js` - Socket event handling
- `src/utils/sudokuGenerator.js` - Sudoku puzzle generation

## Testing

Test the server endpoints:
```bash
# Health check
curl http://localhost:3001/api/health

# Available games
curl http://localhost:3001/api/games

# Server stats
curl http://localhost:3001/api/stats
```
